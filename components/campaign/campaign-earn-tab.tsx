'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useCoinSettingsV2, type CoinSettingsV2 } from '@/lib/query/use-coin-settings-v2'
import { useRawSubscriptionPackages } from '@/lib/query/use-subscriptions'
import { useSubscriptionPackages } from '@/lib/query/use-subscription-packages'

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

function mapValue(map: Record<string | number, number> | undefined, key: string | number, fallback = 1) {
  if (!map) return fallback
  const value = map[key as keyof typeof map] ?? map[String(key) as keyof typeof map]
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function previewKey(packageId?: number, optionId?: number) {
  return `${packageId ?? ''}-${optionId ?? ''}`
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
  const { data: packageNames, isLoading: namesLoading } = useSubscriptionPackages()
  const { data: packages, isLoading: packagesLoading } = useRawSubscriptionPackages()

  const [draft, setDraft] = useState<CoinSettingsV2 | null>(null)

  const existingPackages = useMemo(() => {
    if (packages && packages.length > 0) {
      return packages
        .filter((pkg) => pkg.package_id != null)
        .map((pkg) => ({
          id: Number(pkg.package_id),
          name: pkg.name || `Package ${pkg.package_id}`,
        }))
    }
    return (packageNames ?? []).map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
    }))
  }, [packages, packageNames])

  const existingDurations = useMemo(() => {
    const months = new Set<number>()
    for (const pkg of packages ?? []) {
      for (const opt of pkg.duration_options ?? []) {
        if (opt.duration_months != null && opt.duration_months > 0) {
          months.add(opt.duration_months)
        }
      }
    }
    return Array.from(months).sort((a, b) => a - b)
  }, [packages])

  const packageRows = useMemo(() => {
    if (!packages) return []
    return packages.flatMap((pkg) =>
      (pkg.duration_options ?? []).map((opt) => ({
        packageId: pkg.package_id,
        optionId: opt.option_id,
        packageName: pkg.name || `Package ${pkg.package_id}`,
        durationMonths: opt.duration_months ?? 0,
        priceAzn: Number(opt.price_discounted || opt.price_standard || 0),
      })),
    )
  }, [packages])

  useEffect(() => {
    if (!settings) return
    const tierMultipliers: Record<string, number> = {}
    existingPackages.forEach((pkg) => {
      tierMultipliers[String(pkg.id)] = mapValue(settings.tierMultipliers, String(pkg.id), 1)
    })
    const periodMultipliers: Record<number, number> = {}
    existingDurations.forEach((months) => {
      periodMultipliers[months] = mapValue(settings.periodMultipliers, months, 1)
    })
    setDraft({
      ...settings,
      formulaVersion: settings.formulaVersion || 'EARN_V2_20260901',
      welcomeBonusAmount: Number(settings.welcomeBonusAmount ?? 0),
      baseEarnRate: Number(settings.baseEarnRate ?? 0.02),
      maxGivebackRate: Number(settings.maxGivebackRate ?? 0.05),
      earnCoinFactor: Number(settings.earnCoinFactor ?? 10),
      spendRateCoinToAzn: Number(settings.spendRateCoinToAzn ?? 10),
      maxDiscountPercentage: Number(settings.maxDiscountPercentage ?? 100),
      expiryMonths: Number(settings.expiryMonths ?? 12),
      active: Boolean(settings.active),
      tierMultipliers,
      periodMultipliers,
    })
  }, [settings, existingPackages, existingDurations])

  useEffect(() => {
    if (packageRows.length === 0) return
    previewBatch(
      packageRows.map((row) => ({
        packageId: row.packageId,
        optionId: row.optionId,
        tierName: row.packageName,
        durationMonths: row.durationMonths,
        priceAzn: row.priceAzn,
      })),
    ).catch(() => undefined)
  }, [packageRows, previewBatch])

  async function handleSave() {
    if (!draft) return
    try {
      const saved = await saveSettings({
        ...draft,
        formulaVersion: draft.formulaVersion || 'EARN_V2_20260901',
        tierMultipliers: Object.fromEntries(
          existingPackages.map((pkg) => [
            String(pkg.id),
            mapValue(draft.tierMultipliers, String(pkg.id), 1),
          ]),
        ),
        periodMultipliers: Object.fromEntries(
          existingDurations.map((months) => [
            months,
            mapValue(draft.periodMultipliers, months, 1),
          ]),
        ) as Record<number, number>,
      })
      setDraft({
        ...saved,
        tierMultipliers: Object.fromEntries(
          existingPackages.map((pkg) => [
            String(pkg.id),
            mapValue(saved.tierMultipliers, String(pkg.id), 1),
          ]),
        ),
        periodMultipliers: Object.fromEntries(
          existingDurations.map((months) => [
            months,
            mapValue(saved.periodMultipliers, months, 1),
          ]),
        ) as Record<number, number>,
      })
      onNotify(c.settingsSaved, 'success')
      if (packageRows.length > 0) {
        await previewBatch(
          packageRows.map((row) => ({
            packageId: row.packageId,
            optionId: row.optionId,
            tierName: row.packageName,
            durationMonths: row.durationMonths,
            priceAzn: row.priceAzn,
          })),
        )
      }
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.saveFailed, 'error')
    }
  }

  async function handlePreview() {
    if (packageRows.length === 0) return
    try {
      await previewBatch(
        packageRows.map((row) => ({
          packageId: row.packageId,
          optionId: row.optionId,
          tierName: row.packageName,
          durationMonths: row.durationMonths,
          priceAzn: row.priceAzn,
        })),
      )
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.previewFailed, 'error')
    }
  }

  function updatePackageMultiplier(packageId: number, value: number) {
    if (!draft) return
    setDraft({
      ...draft,
      tierMultipliers: { ...draft.tierMultipliers, [String(packageId)]: value },
    })
  }

  function updatePeriodMultiplier(months: number, value: number) {
    if (!draft) return
    setDraft({
      ...draft,
      periodMultipliers: { ...draft.periodMultipliers, [months]: value },
    })
  }

  if (isLoading || namesLoading || !draft) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  const previewMap = new Map(previews.map((p) => [previewKey(p.packageId, p.optionId), p]))

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
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.expiryMonths}</FieldLabel>
            <input
              type="number"
              className={inputClass}
              value={draft.expiryMonths}
              onChange={(e) => setDraft({ ...draft, expiryMonths: Number(e.target.value) })}
            />
          </label>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#ececed] px-3 py-2.5 sm:col-span-2 lg:col-span-1">
            <FieldLabel>{c.active}</FieldLabel>
            <Toggle checked={draft.active} onChange={(active) => setDraft({ ...draft, active })} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">{c.tierMultipliers}</h3>
            {existingPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">{c.noPackages}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {existingPackages.map((pkg) => (
                  <label key={pkg.id} className="flex flex-col gap-1.5">
                    <FieldLabel>{pkg.name}</FieldLabel>
                    <input
                      type="number"
                      step="0.01"
                      className={inputClass}
                      value={mapValue(draft.tierMultipliers, String(pkg.id), 1)}
                      onChange={(e) => updatePackageMultiplier(pkg.id, Number(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">{c.periodMultipliers}</h3>
            {existingDurations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{c.noDurations}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {existingDurations.map((months) => (
                  <label key={months} className="flex flex-col gap-1.5">
                    <FieldLabel>
                      {months} {c.monthsShort}
                    </FieldLabel>
                    <input
                      type="number"
                      step="0.01"
                      className={inputClass}
                      value={mapValue(draft.periodMultipliers, months, 1)}
                      onChange={(e) => updatePeriodMultiplier(months, Number(e.target.value))}
                    />
                  </label>
                ))}
              </div>
            )}
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
        ) : packageRows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{c.noPackages}</p>
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
                const preview = previewMap.get(previewKey(row.packageId, row.optionId))
                return (
                  <tr key={previewKey(row.packageId, row.optionId)} className="border-b border-[#ececed]/60">
                    <td className="py-2.5 pr-4 font-medium">{row.packageName}</td>
                    <td className="py-2.5 pr-4">
                      {row.durationMonths} {c.monthsShort}
                    </td>
                    <td className="py-2.5 pr-4">{row.priceAzn.toFixed(2)} AZN</td>
                    <td className="py-2.5 pr-4">
                      {preview ? `${(Number(preview.appliedGivebackRate) * 100).toFixed(2)}%` : '—'}
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
