'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useCoinSettingsV2, type CoinSettingsV2 } from '@/lib/query/use-coin-settings-v2'
import { useRawSubscriptionPackages } from '@/lib/query/use-subscriptions'

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const
const PERIODS = [1, 3, 6, 12] as const

const inputClass =
  'w-full rounded-lg border border-[#ececed] bg-white px-3 py-2.5 text-sm text-black placeholder:text-[#98a2b3] focus:outline-none focus:border-[#00b4cc] transition-colors'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-medium text-[#475467]">{children}</span>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4CC]',
        checked ? 'bg-[#00B4CC]' : 'bg-[#e4e4e7]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

function durationLabel(months: number, c: ReturnType<typeof useT>['campaign']) {
  if (months === 1) return c.period1Month
  if (months === 3) return c.period3Month
  if (months === 6) return c.period6Month
  if (months === 12) return c.period12Month
  return `${months} ${c.monthsShort}`
}

export function CampaignEarnTab({
  onNotify,
}: {
  onNotify: (message: string, type: 'success' | 'error') => void
}) {
  const t = useT()
  const c = t.campaign
  const { settings, isLoading, saveSettings, isSaving, previewBatch, isPreviewing, previews } =
    useCoinSettingsV2()
  const { data: packages, isLoading: packagesLoading } = useRawSubscriptionPackages()

  const [draft, setDraft] = useState<CoinSettingsV2 | null>(null)
  const [activeTier, setActiveTier] = useState<(typeof TIERS)[number]>('BRONZE')

  useEffect(() => {
    if (settings) setDraft(settings)
  }, [settings])

  const packageRows = useMemo(() => {
    if (!packages) return []
    return packages.flatMap((pkg) =>
      (pkg.duration_options ?? []).map((opt) => ({
        packageId: pkg.package_id,
        optionId: opt.option_id,
        tierName: (pkg.name ?? 'Bronze').toUpperCase(),
        durationMonths: opt.duration_months ?? 1,
        priceAzn: Number(opt.price_discounted || opt.price_standard || 0),
      })),
    )
  }, [packages])

  async function handleSave() {
    if (!draft) return
    try {
      await saveSettings(draft)
      onNotify(c.settingsSaved, 'success')
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.saveFailed, 'error')
    }
  }

  async function handlePreview() {
    if (packageRows.length === 0) return
    try {
      await previewBatch(packageRows)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.previewFailed, 'error')
    }
  }

  function updateTierMultiplier(tier: string, value: number) {
    if (!draft) return
    setDraft({
      ...draft,
      tierMultipliers: { ...draft.tierMultipliers, [tier]: value },
    })
  }

  function updatePeriodMultiplier(months: number, value: number) {
    if (!draft) return
    setDraft({
      ...draft,
      periodMultipliers: { ...draft.periodMultipliers, [months]: value },
    })
  }

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  const previewMap = new Map(
    previews.map((p) => [`${p.tier}-${p.durationMonths}-${p.optionId}`, p]),
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
        <div className="border-b border-border pb-3">
          <h2 className="text-[16px] font-bold text-foreground">{c.earnFormulaSection}</h2>
          <p className="text-sm text-muted-foreground mt-1">{c.earnFormulaHint}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.baseEarnRate}</FieldLabel>
            <input
              type="number"
              step="0.0001"
              className={inputClass}
              value={draft.baseEarnRate}
              onChange={(e) => setDraft({ ...draft, baseEarnRate: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.maxGivebackRate}</FieldLabel>
            <input
              type="number"
              step="0.0001"
              className={inputClass}
              value={draft.maxGivebackRate}
              onChange={(e) => setDraft({ ...draft, maxGivebackRate: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.earnCoinFactor}</FieldLabel>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={draft.earnCoinFactor}
              onChange={(e) => setDraft({ ...draft, earnCoinFactor: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.welcomeBonus}</FieldLabel>
            <input
              type="number"
              className={inputClass}
              value={draft.welcomeBonusAmount}
              onChange={(e) => setDraft({ ...draft, welcomeBonusAmount: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.spendRate}</FieldLabel>
            <input
              type="number"
              className={inputClass}
              value={draft.spendRateCoinToAzn}
              onChange={(e) => setDraft({ ...draft, spendRateCoinToAzn: Number(e.target.value) })}
            />
          </label>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#ececed] px-3 py-2.5">
            <FieldLabel>{c.active}</FieldLabel>
            <Toggle checked={draft.active} onChange={(active) => setDraft({ ...draft, active })} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">{c.tierMultipliers}</h3>
            <div className="flex flex-wrap gap-2">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActiveTier(tier)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                    activeTier === tier
                      ? 'bg-[#00B4CC] text-white border-[#00B4CC]'
                      : 'bg-white text-foreground border-[#ececed] hover:border-[#00B4CC]',
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.multiplierValue}</FieldLabel>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={draft.tierMultipliers[activeTier] ?? 1}
                onChange={(e) => updateTierMultiplier(activeTier, Number(e.target.value))}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">{c.periodMultipliers}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {PERIODS.map((months) => (
                <label key={months} className="flex flex-col gap-1.5">
                  <FieldLabel>{durationLabel(months, c)}</FieldLabel>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={draft.periodMultipliers[months] ?? 1}
                    onChange={(e) => updatePeriodMultiplier(months, Number(e.target.value))}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="h-10 rounded-lg bg-[#00b4cc] px-5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSaving ? c.saving : c.saveSettings}
          </button>
          <button
            type="button"
            disabled={isPreviewing || packagesLoading || packageRows.length === 0}
            onClick={handlePreview}
            className="h-10 rounded-lg border border-[#ececed] px-5 text-[13px] font-medium text-foreground hover:border-[#00B4CC] disabled:opacity-60 flex items-center gap-2"
          >
            {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {c.previewEarnTable}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-border p-5 shadow-xs overflow-x-auto">
        <div className="border-b border-border pb-3 mb-4">
          <h2 className="text-[16px] font-bold text-foreground">{c.earnPreviewTable}</h2>
          <p className="text-sm text-muted-foreground mt-1">{c.earnPreviewHint}</p>
        </div>

        {packagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ececed] text-left text-[#475467]">
                <th className="py-2 pr-4 font-medium">{c.tableTier}</th>
                <th className="py-2 pr-4 font-medium">{c.tableDuration}</th>
                <th className="py-2 pr-4 font-medium">{c.tablePrice}</th>
                <th className="py-2 pr-4 font-medium">{c.tableGivebackRate}</th>
                <th className="py-2 font-medium">{c.tableCoins}</th>
              </tr>
            </thead>
            <tbody>
              {packageRows.map((row) => {
                const preview = previewMap.get(`${row.tierName}-${row.durationMonths}-${row.optionId}`)
                return (
                  <tr key={`${row.packageId}-${row.optionId}`} className="border-b border-[#ececed]/60">
                    <td className="py-2.5 pr-4 font-medium">{row.tierName}</td>
                    <td className="py-2.5 pr-4">{durationLabel(row.durationMonths, c)}</td>
                    <td className="py-2.5 pr-4">{row.priceAzn.toFixed(2)} AZN</td>
                    <td className="py-2.5 pr-4">
                      {preview ? `${(preview.appliedGivebackRate * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2.5 font-semibold text-[#00B4CC]">
                      {preview ? preview.awardedCoins : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
