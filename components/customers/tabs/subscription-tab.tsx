'use client'

import { useState } from 'react'
import { Calendar, Clock, ShieldCheck } from 'lucide-react'
import { useCustomerCurrentSubscriptionQuery } from '@/modules/customers/hooks/use-customers-query'
import { cn } from '@/lib/utils'

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Məlumat yoxdur'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

function getDaysRemaining(endDateStr: string): number {
  if (!endDateStr) return -1
  try {
    const end = new Date(endDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return -1
  }
}

function SkeletonRow() {
  return <div className="h-4 w-full animate-pulse rounded-md bg-secondary" />
}

export function SubscriptionTab({ userId }: { userId: string }) {
  const [isFrozen, setIsFrozen] = useState(false)
  const { data, isLoading, isError } = useCustomerCurrentSubscriptionQuery(userId)

  if (isLoading) {
    return (
      <div className="flex flex-col rounded-2xl bg-white border border-border p-7 shadow-xs gap-6 animate-in fade-in-50 duration-300">
        <div className="border-b border-border pb-3.5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Abunəlik məlumatları</h2>
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col rounded-2xl bg-white border border-border p-7 shadow-xs gap-6 animate-in fade-in-50 duration-300">
        <div className="border-b border-border pb-3.5">
          <h2 className="text-lg font-bold text-foreground tracking-tight">Abunəlik məlumatları</h2>
        </div>
        <div className="rounded-xl border border-border/60 bg-[#FAFAFA] p-8 text-center text-sm font-medium text-muted-foreground">
          Bu müştəri üçün aktiv abunəlik planı tapılmadı.
        </div>
      </div>
    )
  }

  const effectivePrice = data.discountedPrice < data.price ? data.discountedPrice : data.price
  const daysLeft = getDaysRemaining(data.endDate)
  const pct = data.totalEntryLimit > 0 ? Math.min(100, Math.max(0, Math.round((data.userRemainingLimit / data.totalEntryLimit) * 100))) : 0

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-border p-7 shadow-xs gap-6 animate-in fade-in-50 duration-300">
      {/* Container Header */}
      <div className="border-b border-border pb-3.5">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Abunəlik məlumatları</h2>
      </div>

      {/* Subscription Tier Banner Container */}
      <div className="flex flex-col gap-6">
        {/* Tier Name & Quick Badging */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4CC]/10 text-[#00B4CC]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {data.packageName || 'Bronze'}
            </h3>
          </div>
          
          {/* Real-time Expiration Counter Indicator */}
          {daysLeft <= 7 && daysLeft >= 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 animate-pulse">
              <Clock size={13} /> Son {daysLeft} gün
            </div>
          )}
        </div>

        {/* Selected Plan Duration & Price Flex Row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-6 rounded-xl bg-[#FAFAFA] p-4.5 border border-border/60">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Seçilmiş plan:</span>
            <strong className="text-base font-bold text-foreground">{data.optionDuration ? `${data.optionDuration} Aylıq` : '1 Aylıq'}</strong>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs font-medium text-muted-foreground">Qiymət:</span>
            <strong className="text-base font-bold text-[#00B4CC]">{effectivePrice ?? 165} ₼</strong>
          </div>
        </div>

        {/* Date Details Flex Rows */}
        <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-[#00B4CC] shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">Başlama tarixi:</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatDate(data.startDate)}</span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-[#00B4CC] shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">Növbəti ödəniş:</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatDate(data.endDate)}</span>
          </div>
        </div>

        {/* Remaining Entry Limit Custom Multi-Layer Progress Indicator */}
        <div className="flex flex-col gap-2.5 border-t border-border/40 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Qalıq Limit:</span>
            <strong className="font-bold text-foreground">
              {data.userRemainingLimit ?? 8}/{data.totalEntryLimit ?? 20}
            </strong>
          </div>
          
          {/* Custom Track */}
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#00B4CC] transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Subscription Status State Control (Freeze) Toggle Switch */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-sm font-medium text-muted-foreground">Abunəliyi dondur</span>
          <button
            role="switch"
            aria-checked={isFrozen}
            onClick={() => setIsFrozen((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none',
              isFrozen ? 'bg-[#00B4CC]' : 'bg-border/80',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out',
                isFrozen ? 'translate-x-5' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
