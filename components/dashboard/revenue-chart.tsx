'use client'

import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS, TIER_OPTIONS, TIER_COLORS, type TierKey } from '@/lib/dashboard-data'
import { useDashboardIncomeQuery } from '@/modules/dashboard/hooks'
import {
  formatCurrencyCompact,
  signedPercentageChange,
  type DashboardPeriod,
} from '@/modules/dashboard/period'
import { cn } from '@/lib/utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[#00B4CC] px-3 py-2 text-center shadow-lg">
      <p className="text-[11px] font-medium text-white">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value}</p>
    </div>
  )
}

export function RevenueChart() {
  const [tier, setTier] = useState<TierKey>('bronze')
  const [period, setPeriod] = useState<DashboardPeriod>('monthly')

  const { data, isLoading, isError } = useDashboardIncomeQuery(period)

  const chartData = useMemo(() => {
    if (!data?.trend?.length) return []
    return data.trend.map((point) => ({
      month: point.periodLabel,
      value: point.tierValues[tier] ?? 0,
    }))
  }, [data?.trend, tier])

  const color = TIER_COLORS[tier]
  const peakEntry = chartData.length
    ? [...chartData].sort((a, b) => b.value - a.value)[0]
    : undefined

  const pct = data
    ? signedPercentageChange(data.percentageChange, data.isPositiveTrend)
    : 0
  const isPositive = pct >= 0

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
      aria-label="Gəlir Dinamikası"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Gəlir Dinamikası</h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground capitalize">{tier}</span>
            {data && (
              <span className="text-sm text-muted-foreground">
                {formatCurrencyCompact(data.totalIncome)} ümumi gəlir
              </span>
            )}
            {data && !isLoading && (
              <span
                className={cn(
                  'flex items-center gap-0.5 text-sm font-medium',
                  isPositive ? 'text-emerald-500' : 'text-red-500',
                )}
              >
                {isPositive ? (
                  <TrendingUp size={13} aria-hidden="true" />
                ) : (
                  <TrendingDown size={13} aria-hidden="true" />
                )}
                {isPositive ? '+' : ''}
                {pct.toFixed(1)}% artım
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SelectDropdown
            options={TIER_OPTIONS}
            value={tier}
            onChange={(v) => setTier(v as TierKey)}
          />
          <SelectDropdown
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(v) => setPeriod(v as DashboardPeriod)}
          />
        </div>
      </div>

      <div className="relative h-52">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/80">
            <div className="h-full w-full animate-pulse rounded-lg bg-secondary/40" />
          </div>
        )}
        {isError && !isLoading && (
          <p className="flex h-full items-center justify-center text-sm text-destructive">
            Məlumat yüklənmədi
          </p>
        )}
        {!isError && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E9EF" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#4B5563' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4B5563' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#00B4CC', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {peakEntry && (
                <ReferenceLine
                  x={peakEntry.month}
                  stroke="#00B4CC"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={<Dot r={5} fill={color} stroke="#fff" strokeWidth={2} />}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}