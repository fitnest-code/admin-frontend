'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { useCustomerCurrentSubscriptionQuery } from '@/modules/customers/hooks/use-customers-query'

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getDaysRemaining(endDateStr: string): number {
  const end = new Date(endDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function SkeletonRow() {
  return <div className="h-4 w-full animate-pulse rounded bg-secondary" />
}

export function SubscriptionTab({ userId }: { userId: string }) {
  const [isFrozen, setIsFrozen] = useState(false)
  const { data, isLoading, isError } = useCustomerCurrentSubscriptionQuery(userId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Abunəlik məlumatları</h2>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
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
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Abunəlik məlumatları</h2>
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Aktiv abunəlik tapılmadı.
        </div>
      </div>
    )
  }

  const effectivePrice = data.discountedPrice < data.price ? data.discountedPrice : data.price
  const daysLeft = getDaysRemaining(data.endDate)
  const pct = data.totalEntryLimit > 0 ? Math.round((data.userRemainingLimit / data.totalEntryLimit) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground">Abunəlik məlumatları</h2>

      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <h3 className="text-base font-bold text-foreground">{data.packageName}</h3>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Seçilmiş plan:</span>
            <span className="text-sm font-semibold text-foreground">{data.optionDuration} Aylıq</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">Qiymət:</span>
            <span className="text-sm font-bold text-foreground">{effectivePrice} ₼</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-[#00B4CC] shrink-0" />
            <span className="text-muted-foreground">Başlama tarixi:</span>
          </div>
          <span className="pl-5 text-sm font-semibold text-foreground">{formatDate(data.startDate)}</span>

          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-[#00B4CC] shrink-0" />
                <span className="text-muted-foreground">Növbəti ödəniş:</span>
              </div>
              <span className="pl-5 text-sm font-semibold text-foreground">{formatDate(data.endDate)}</span>
            </div>

            {daysLeft <= 7 && daysLeft >= 0 && (
              <div className="flex items-center gap-1 rounded-full border border-[#00B4CC]/30 bg-[#00B4CC]/10 px-2.5 py-1 text-xs font-medium text-[#00B4CC]">
                <Clock size={11} /> Son {daysLeft} gün
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Qalıq Limit:</span>
            <span className="text-muted-foreground">{data.userRemainingLimit}/{data.totalEntryLimit}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00B4CC] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Abunəliyi dondur</span>
          <button
            role="switch"
            aria-checked={isFrozen}
            onClick={() => setIsFrozen((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${
              isFrozen ? 'bg-[#00B4CC]' : 'bg-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                isFrozen ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
