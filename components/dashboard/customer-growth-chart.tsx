'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS } from '@/lib/dashboard-data'
import { useDashboardCustomerGrowthQuery } from '@/modules/dashboard/hooks'
import type { DashboardPeriod } from '@/modules/dashboard/period'
import { cn } from '@/lib/utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg text-xs">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>
}

function CustomLegend({ payload }: CustomLegendProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {payload?.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: entry.color }} />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CustomerGrowthChart() {
  const [period, setPeriod] = useState<DashboardPeriod>('monthly')

  const { data, isLoading, isError } = useDashboardCustomerGrowthQuery(period)

  const chartData = useMemo(() => {
    if (!data?.chartData?.length) return []
    return data.chartData.map((point) => ({
      month: point.periodLabel,
      yeni: point.newCustomers,
      aktiv: point.activeCustomers,
    }))
  }, [data?.chartData])

  const maxVal = chartData.length
    ? Math.max(...chartData.flatMap((d) => [d.yeni, d.aktiv]))
    : 0
  const yMax = Math.ceil(maxVal / 1000) * 1000 || 5000
  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round((yMax / 5) * i))

  const growthPct = data?.overallGrowthPercentage ?? 0
  const growthPositive = growthPct >= 0

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
      aria-label="Müştəri artımı"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Müştəri artımı</h2>
          {data && !isLoading && (
            <div className="mt-1 flex items-center gap-1.5">
              {growthPositive ? (
                <TrendingUp size={13} className="text-emerald-500" aria-hidden="true" />
              ) : (
                <TrendingDown size={13} className="text-red-500" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-xs',
                  growthPositive ? 'text-muted-foreground' : 'text-red-500',
                )}
              >
                {growthPositive ? '+' : ''}
                {growthPct.toFixed(1)}% artım
              </span>
            </div>
          )}
        </div>
        <SelectDropdown
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(v) => setPeriod(v as DashboardPeriod)}
        />
      </div>

      <p className="text-[11px] text-muted-foreground -mb-2">Müştəri sayı</p>

      <div className="relative h-52">
        {isLoading && (
          <div className="absolute inset-0 z-10 animate-pulse rounded-lg bg-secondary/40" />
        )}
        {isError && !isLoading && (
          <p className="flex h-full items-center justify-center text-sm text-destructive">
            Məlumat yüklənmədi
          </p>
        )}
        {!isError && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barCategoryGap="30%"
              barGap={3}
            >
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
                domain={[0, yMax]}
                ticks={yTicks}
                tickFormatter={(v) =>
                  v === 0 ? '0' : v >= 1000 ? `${v / 1000}k` : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0F4F8' }} />
              <Legend content={<CustomLegend />} />
              <Bar dataKey="yeni" name="Yeni müştəri" fill="#87CBF1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aktiv" name="Aktiv müştəri" fill="#00B4CC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}