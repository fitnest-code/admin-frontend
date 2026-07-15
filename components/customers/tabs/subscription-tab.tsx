'use client'

import { useEffect, useState } from 'react'
import { Calendar, Check, Clock, Minus, Pencil, Plus, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomerCurrentSubscriptionQuery, useUpdateEntryLimitMutation } from '@/modules/customers/hooks/use-customers-query'
import { useAuthStore } from '@/lib/store/auth-store'
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
  const [isEditing, setIsEditing] = useState(false)
  const [draftRemaining, setDraftRemaining] = useState(0)
  const { data, isLoading, isError } = useCustomerCurrentSubscriptionQuery(userId)
  const updateLimit = useUpdateEntryLimitMutation(userId)

  // Only the system admin (ROLE_ADMIN) may edit the entry limit — not gym / super admins.
  const userRole = useAuthStore((s) => s.user?.role)?.toUpperCase()
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'

  const serverRemaining = data?.userRemainingLimit ?? 0

  useEffect(() => {
    if (!isEditing) {
      setDraftRemaining(serverRemaining)
    }
  }, [serverRemaining, isEditing])

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

  const displayedRemaining = isEditing ? draftRemaining : serverRemaining
  const serverTotal = data.totalEntryLimit ?? 0
  const displayedTotal = Math.max(serverTotal, displayedRemaining)
  const pct = displayedTotal > 0
    ? Math.min(100, Math.max(0, Math.round((displayedRemaining / displayedTotal) * 100)))
    : 0
  const isDirty = draftRemaining !== serverRemaining

  const handleStartEdit = () => {
    setDraftRemaining(serverRemaining)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftRemaining(serverRemaining)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!isDirty) {
      setIsEditing(false)
      return
    }
    updateLimit.mutate(
      { remainingLimit: draftRemaining },
      {
        onSuccess: () => {
          toast.success('Giriş limiti yeniləndi')
          setIsEditing(false)
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Giriş limiti yenilənmədi')
        },
      },
    )
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white border border-border p-7 shadow-xs gap-6 animate-in fade-in-50 duration-300">
      {/* Container Header */}
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Abunəlik məlumatları</h2>
        {isAdmin && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
          >
            <Pencil size={13} /> Düzəliş et
          </button>
        )}
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
            {isEditing ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDraftRemaining((v) => Math.max(0, v - 1))}
                  disabled={draftRemaining <= 0 || updateLimit.isPending}
                  aria-label="Azalt"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-foreground transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
                >
                  <Minus size={14} />
                </button>
                <strong className="min-w-[3.5rem] text-center font-bold text-foreground tabular-nums">
                  {draftRemaining}/{displayedTotal}
                </strong>
                <button
                  type="button"
                  onClick={() => setDraftRemaining((v) => v + 1)}
                  disabled={updateLimit.isPending}
                  aria-label="Artır"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-foreground transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <strong className="font-bold text-foreground">
                {serverRemaining}/{serverTotal}
              </strong>
            )}
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

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateLimit.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-border"
            >
              <X size={15} /> Ləğv et
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateLimit.isPending || !isDirty}
              className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00a2b8] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#00B4CC]/40"
            >
              <Check size={15} /> {updateLimit.isPending ? 'Yadda saxlanılır...' : 'Yadda saxla'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
