'use client'

import { useState } from 'react'
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
import { TrendingUp } from 'lucide-react'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS, getCustomerGrowthData } from '@/lib/dashboard-data'

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

type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function CustomerGrowthChart() {
  const [period, setPeriod] = useState<PeriodKey>('monthly')

  const data = getCustomerGrowthData(period)

  // Dynamic Y-axis max based on data
  const maxVal = Math.max(...data.flatMap((d) => [d.yeni, d.aktiv]))
  const yMax = Math.ceil(maxVal / 1000) * 1000 || 5000
  const yTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round((yMax / 5) * i),
  )

  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
      aria-label="Müştəri artımı"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Müştəri artımı</h2>
          <div className="mt-1 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-500" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">
              +12% artım (keçən aya nisbətən)
            </span>
          </div>
        </div>
        <SelectDropdown
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(v) => setPeriod(v as PeriodKey)}
        />
      </div>

      {/* Y-axis label */}
      <p className="text-[11px] text-muted-foreground -mb-2">Müştəri sayı</p>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            <Bar dataKey="yeni"  name="Yeni müştəri"  fill="#87CBF1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="aktiv" name="Aktiv müştəri" fill="#00B4CC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
