'use client'

import { useState } from 'react'
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
import { TrendingUp } from 'lucide-react'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS, TIER_OPTIONS, TIER_META, getRevenueData } from '@/lib/dashboard-data'

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

type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'
type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function RevenueChart() {
  const [tier, setTier] = useState<TierKey>('bronze')
  const [period, setPeriod] = useState<PeriodKey>('monthly')

  const data = getRevenueData(tier, period)
  const meta = TIER_META[tier]
  const peakEntry = [...data].sort((a, b) => b.value - a.value)[0]

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
      aria-label="Gəlir Dinamikası"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Gəlir Dinamikası</h2>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: meta.color }}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground capitalize">{tier}</span>
            <span className="text-sm text-muted-foreground">{meta.subscribers} abunə</span>
            <span className="flex items-center gap-0.5 text-sm font-medium text-emerald-500">
              <TrendingUp size={13} aria-hidden="true" />
              +{meta.growth}% artım
            </span>
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
            onChange={(v) => setPeriod(v as PeriodKey)}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <ReferenceLine
              x={peakEntry?.month}
              stroke="#00B4CC"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={meta.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={
                <Dot r={5} fill={meta.color} stroke="#fff" strokeWidth={2} />
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
