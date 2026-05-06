'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALL_SUBSCRIPTION_TIERS,
  DEFAULT_SERVICES,
  type SubscriptionTier,
  type GymService,
} from '@/lib/gyms-data'

interface PlansTabProps {
  subscriptionTiers: SubscriptionTier[]
  services: GymService[]
}

const TIER_META: Record<
  SubscriptionTier,
  { icon: string; bg: string; border: string; text: string }
> = {
  Bronze:   { icon: '🥉', bg: 'bg-amber-50',  border: 'border-amber-300', text: 'text-amber-700' },
  Silver:   { icon: '🥈', bg: 'bg-slate-50',  border: 'border-slate-300', text: 'text-slate-600' },
  Gold:     { icon: '🥇', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
  Platinum: { icon: '💎', bg: 'bg-zinc-900/10',  border: 'border-[#00B4CC]', text: 'text-white' },
}

export function PlansTab({ subscriptionTiers: initial = [], services: initialServices = [] }: PlansTabProps) {
  const [selectedTiers, setSelectedTiers] = useState<Set<SubscriptionTier>>(
    new Set(initial),
  )
  const [services, setServices] = useState<GymService[]>(() => {
    // Merge default services with selected ones from gym data
    return DEFAULT_SERVICES.map((ds) => ({
      ...ds,
      selected: initialServices.some((s) => s.id === ds.id),
    })) as (GymService & { selected: boolean })[]
  })
  const [newServiceName, setNewServiceName] = useState('')
  const [showAddService, setShowAddService] = useState(false)

  function toggleTier(tier: SubscriptionTier) {
    setSelectedTiers((prev) => {
      const next = new Set(prev)
      next.has(tier) ? next.delete(tier) : next.add(tier)
      return next
    })
  }

  function toggleService(id: string) {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, selected: !(s as any).selected } : s,
      ),
    )
  }

  function addService() {
    const name = newServiceName.trim()
    if (!name) return
    setServices((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name, selected: true } as any,
    ])
    setNewServiceName('')
    setShowAddService(false)
  }

  return (
    <div className="flex flex-col gap-8 py-2">
      {/* ── Abunəlik tiers ─────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Zala aid olan abunəliklər
        </h2>

        <div className="flex flex-wrap gap-3">
          {ALL_SUBSCRIPTION_TIERS.map((tier) => {
            const meta     = TIER_META[tier]
            const selected = selectedTiers.has(tier)
            return (
              <button
                key={tier}
                type="button"
                onClick={() => toggleTier(tier)}
                className={cn(
                  'relative flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 transition-all select-none',
                  selected
                    ? `${meta.border} ${meta.bg}`
                    : 'border-border bg-card hover:border-[#00B4CC]/40',
                )}
                aria-pressed={selected}
              >
                {/* Tier icon — use CSS circles instead of emojis */}
                <TierIcon tier={tier} />

                <span
                  className={cn(
                    'text-sm font-semibold',
                    tier === 'Platinum' && selected
                      ? ''
                      : 'text-foreground',
                  )}
                >
                  {tier}
                </span>

                {/* Checkbox */}
                <span
                  className={cn(
                    'ml-1 flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    selected
                      ? 'border-[#00B4CC] bg-[#00B4CC]'
                      : 'border-border bg-card',
                  )}
                >
                  {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Xidmətlər ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Zalda mövcud olan xidmətlər
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(services as (GymService & { selected: boolean })[]).map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => toggleService(svc.id)}
              className={cn(
                'flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all select-none',
                svc.selected
                  ? 'border-[#00B4CC] bg-[#00B4CC0D] text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-[#00B4CC]/40',
              )}
              aria-pressed={svc.selected}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  svc.selected
                    ? 'border-[#00B4CC] bg-[#00B4CC]'
                    : 'border-border',
                )}
              >
                {svc.selected && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              {svc.name}
            </button>
          ))}
        </div>

        {/* Add service row */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {showAddService && (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addService()}
                placeholder="Xidmət adı"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#00B4CC] transition-colors w-44"
              />
              <button
                onClick={addService}
                className="rounded-lg bg-[#00B4CC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#008799] transition-colors"
              >
                Əlavə et
              </button>
              <button
                onClick={() => setShowAddService(false)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Ləğv et
              </button>
            </div>
          )}
          {!showAddService && (
            <button
              onClick={() => setShowAddService(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
            >
              <Plus size={14} />
              Xidmət əlavə et
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Tier Icon ─────────────────────────────────────────────────────────────────

function TierIcon({ tier }: { tier: SubscriptionTier }) {
  const base = 'h-7 w-7 rounded-full flex items-center justify-center shrink-0'
  if (tier === 'Bronze')
    return <span className={cn(base, 'bg-linear-to-br from-amber-400 to-amber-700')} />
  if (tier === 'Silver')
    return <span className={cn(base, 'bg-linear-to-br from-slate-300 to-slate-500')} />
  if (tier === 'Gold')
    return <span className={cn(base, 'bg-linear-to-br from-yellow-300 to-yellow-600')} />
  // Platinum
  return <span className={cn(base, 'bg-linear-to-br from-zinc-600 to-zinc-900 ring-2 ring-[#00B4CC]/50')} />
}
