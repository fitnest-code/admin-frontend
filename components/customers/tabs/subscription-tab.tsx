'use client'

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { MOCK_SUBSCRIPTION } from '@/lib/customers-data'

export function SubscriptionTab() {
  const [sub, setSub] = useState(MOCK_SUBSCRIPTION)

  const pct = Math.round((sub.limitUsed / sub.limitTotal) * 100)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground">Abunəlik məlumatları</h2>

      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        {/* Tier name */}
        <h3 className="text-base font-bold text-foreground">{sub.tier}</h3>

        {/* Plan + Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Seçilmiş plan:</span>
            <span className="text-sm font-semibold text-foreground">{sub.plan}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">Qiymət:</span>
            <span className="text-sm font-bold text-foreground">{sub.price} ₼</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-[#00B4CC] shrink-0" />
            <span className="text-muted-foreground">Başlama tarixi:</span>
          </div>
          <span className="pl-5 text-sm font-semibold text-foreground">{sub.startDate}</span>

          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-[#00B4CC] shrink-0" />
                <span className="text-muted-foreground">Növbəti ödəniş:</span>
              </div>
              <span className="pl-5 text-sm font-semibold text-foreground">{sub.nextPayment}</span>
            </div>

            {sub.daysLeft <= 7 && (
              <div className="flex items-center gap-1 rounded-full border border-[#00B4CC]/30 bg-[#00B4CC]/10 px-2.5 py-1 text-xs font-medium text-[#00B4CC]">
                <Clock size={11} /> Son {sub.daysLeft} gün
              </div>
            )}
          </div>
        </div>

        {/* Limit progress */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Qalıq Limit:</span>
            <span className="text-muted-foreground">{sub.limitUsed}/{sub.limitTotal}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00B4CC] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Freeze toggle */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Abunəliyi dondur</span>
          <button
            role="switch"
            aria-checked={sub.isFrozen}
            onClick={() => setSub((s) => ({ ...s, isFrozen: !s.isFrozen }))}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${
              sub.isFrozen ? 'bg-[#00B4CC]' : 'bg-border'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                sub.isFrozen ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
