'use client'

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS } from '@/lib/dashboard-data'

export interface StatCardProps {
  title: string
  value: string | number
  trend: number
  icon: LucideIcon
  period: string
  onPeriodChange: (period: string) => void
  className?: string
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  period,
  onPeriodChange,
  className,
}: StatCardProps) {
  const isPositive = trend >= 0
  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? 'Aylıq'

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"
          aria-hidden="true"
        >
          <Icon size={16} className="text-[#00B4CC]" />
        </span>
        <span className="text-sm font-medium text-muted-foreground leading-relaxed">
          {title}
        </span>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </p>

      {/* Trend + Period dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={13} className="text-emerald-500" aria-hidden="true" />
          ) : (
            <TrendingDown size={13} className="text-red-500" aria-hidden="true" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {isPositive ? '+' : ''}{trend} %
          </span>
        </div>

        <SelectDropdown
          options={PERIOD_OPTIONS}
          value={period}
          onChange={onPeriodChange}
        />
      </div>
    </article>
  )
}
