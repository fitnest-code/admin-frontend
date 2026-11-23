'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Check, Clock, Minus, Pencil, Plus, ShieldCheck, Snowflake, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCustomerCurrentSubscriptionQuery,
  useFreezeCustomerSubscriptionMutation,
  useUnfreezeCustomerSubscriptionMutation,
  useUpdateEntryLimitMutation,
} from '@/modules/customers/hooks/use-customers-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { PrimaryGymCard } from '../membership/primary-gym-card'

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
  const [isEditing, setIsEditing] = useState(false)
  const [draftRemaining, setDraftRemaining] = useState(0)
  const [selectedDays, setSelectedDays] = useState(1)
  const { data, isLoading, isError } = useCustomerCurrentSubscriptionQuery(userId)
  const updateLimit = useUpdateEntryLimitMutation(userId)
  const freezeMutation = useFreezeCustomerSubscriptionMutation(userId)
  const unfreezeMutation = useUnfreezeCustomerSubscriptionMutation(userId)

  // Only the system admin (ROLE_ADMIN) may edit / freeze — not gym / super admins.
  const userRole = useAuthStore((s) => s.user?.role)?.toUpperCase()
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'

  const serverRemaining = data?.userRemainingLimit ?? 0
  const availableFreezeDays = data?.availableFreezeDays ?? 0
  const currentlyFrozen = Boolean(data?.currentlyFrozen)
  const canFreeze = Boolean(data?.canFreeze) && availableFreezeDays > 0

  const dayOptions = useMemo(() => {
    const max = Math.max(0, availableFreezeDays)
    return Array.from({ length: max }, (_, i) => i + 1)
  }, [availableFreezeDays])

  useEffect(() => {
    if (!isEditing) {
      setDraftRemaining(serverRemaining)
    }
  }, [serverRemaining, isEditing])

  useEffect(() => {
    if (dayOptions.length === 0) {
      setSelectedDays(1)
      return
    }
    setSelectedDays((prev) =>
      dayOptions.includes(prev) ? prev : dayOptions[dayOptions.length - 1],
    )
  }, [dayOptions])

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
  const busy = freezeMutation.isPending || unfreezeMutation.isPending

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

  const handleFreeze = () => {
    if (!canFreeze) {
      toast.error(
        availableFreezeDays <= 0
          ? 'Bu abunəlik üçün qalan dondurma günü yoxdur.'
          : 'Abunəlik hazırda dondurula bilməz.',
      )
      return
    }
    freezeMutation.mutate(selectedDays, {
      onSuccess: () => {
        toast.success(`Abunəlik ${selectedDays} günlüyə donduruldu`)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Abunəlik dondurulmadı')
      },
    })
  }

  const handleUnfreeze = () => {
    unfreezeMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Abunəlik yenidən aktivləşdirildi')
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Dondurma bitirilmədi')
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
    <div className="flex flex-col rounded-2xl bg-white border border-border p-7 shadow-xs gap-6 animate-in fade-in-50 duration-300">
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

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4CC]/10 text-[#00B4CC]">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {data.packageName || 'Bronze'}
              </h3>
              {data.status && (
                <span className="text-xs font-medium text-muted-foreground">
                  Status: {data.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentlyFrozen && (
              <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700">
                <Snowflake size={13} /> Dondurulub
                {data.unfreezesAt ? ` · ${formatDate(data.unfreezesAt)}` : ''}
              </div>
            )}
            {daysLeft <= 7 && daysLeft >= 0 && !currentlyFrozen && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 animate-pulse">
                <Clock size={13} /> Son {daysLeft} gün
              </div>
            )}
          </div>
        </div>

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

          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#00B4CC] transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Freeze controls — duration from this subscription's available days */}
        <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">Abunəliyi dondur</span>
              <span className="text-xs text-muted-foreground">
                Qalan hüquq: {availableFreezeDays} gün
                {typeof data.totalFreezeDays === 'number'
                  ? ` · cəmi ${data.totalFreezeDays}`
                  : ''}
              </span>
            </div>
            {currentlyFrozen && isAdmin && (
              <button
                type="button"
                onClick={handleUnfreeze}
                disabled={busy}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-[#FAFAFA] disabled:opacity-50"
              >
                {unfreezeMutation.isPending ? 'Açılır…' : 'Dondurmanı bitir'}
              </button>
            )}
          </div>

          {!currentlyFrozen && isAdmin && (
            <>
              {canFreeze ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDays(d)}
                        disabled={busy}
                        className={cn(
                          'min-w-10 rounded-lg border px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors',
                          selectedDays === d
                            ? 'border-[#00B4CC] bg-[#00B4CC] text-white'
                            : 'border-border bg-white text-foreground hover:bg-[#FAFAFA]',
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleFreeze}
                    disabled={busy || !dayOptions.includes(selectedDays)}
                    className="self-start flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00a2b8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Snowflake size={15} />
                    {freezeMutation.isPending
                      ? 'Dondurulur…'
                      : `${selectedDays} gün dondur`}
                  </button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {availableFreezeDays <= 0
                    ? 'Bu abunəlik üçün dondurma günü qalmayıb.'
                    : 'Abunəlik hazırda dondurula bilməz.'}
                </p>
              )}
            </>
          )}

          {!isAdmin && (
            <p className="text-xs text-muted-foreground">
              Dondurma yalnız sistem admin tərəfindən edilə bilər.
            </p>
          )}
        </div>

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
    <PrimaryGymCard userId={userId}/>
    </div>
  )
}
