'use client'

import { Loader2, RefreshCw } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { mapMultiplierValue, previewKey, useCampaignCoin } from './campaign-coin-provider'
import {
  CoinSaveBar,
  CoinSection,
  CoinTabLoader,
  MultiplierCard,
} from './campaign-coin-ui'

export function CampaignMultipliersTab() {
  const t = useT()
  const c = t.campaign
  const {
    draft,
    isLoading,
    isSaving,
    isPreviewing,
    packagesLoading,
    existingPackages,
    existingDurations,
    packageRows,
    previewMap,
    save,
    refreshPreview,
    updatePackageMultiplier,
    updatePeriodMultiplier,
  } = useCampaignCoin()

  if (isLoading || !draft) return <CoinTabLoader />

  return (
    <div className="flex flex-col gap-5 w-full max-w-6xl">
      <CoinSection title={c.tierMultipliers} description={c.packageMultipliersHint}>
        {existingPackages.length === 0 ? (
          <p className="rounded-xl bg-[#fafafa] px-4 py-6 text-center text-[13px] text-[#667085]">
            {c.noPackages}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {existingPackages.map((pkg) => (
              <MultiplierCard
                key={pkg.id}
                title={pkg.name}
                subtitle={`ID ${pkg.id}`}
                value={mapMultiplierValue(draft.tierMultipliers, String(pkg.id), 1)}
                onChange={(value) => updatePackageMultiplier(pkg.id, value)}
              />
            ))}
          </div>
        )}
      </CoinSection>

      <CoinSection title={c.periodMultipliers} description={c.periodMultipliersHint}>
        {existingDurations.length === 0 ? (
          <p className="rounded-xl bg-[#fafafa] px-4 py-6 text-center text-[13px] text-[#667085]">
            {c.noDurations}
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {existingDurations.map((months) => (
              <MultiplierCard
                key={months}
                title={`${months} ${c.monthsShort}`}
                subtitle={c.multiplierValue}
                value={mapMultiplierValue(draft.periodMultipliers, months, 1)}
                onChange={(value) => updatePeriodMultiplier(months, value)}
              />
            ))}
          </div>
        )}
      </CoinSection>

      <CoinSection title={c.earnPreviewTable} description={c.earnPreviewHint}>
        {packagesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
          </div>
        ) : packageRows.length === 0 ? (
          <p className="rounded-xl bg-[#fafafa] px-4 py-6 text-center text-[13px] text-[#667085]">
            {c.noPackages}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#ececed]/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead>
                  <tr className="bg-[#f9fafb] text-left text-[#667085]">
                    <th className="px-4 py-3 font-medium">{c.tableTier}</th>
                    <th className="px-4 py-3 font-medium">{c.tableDuration}</th>
                    <th className="px-4 py-3 font-medium">{c.tablePrice}</th>
                    <th className="px-4 py-3 font-medium">{c.tableGivebackRate}</th>
                    <th className="px-4 py-3 font-medium">{c.tableCoins}</th>
                  </tr>
                </thead>
                <tbody>
                  {packageRows.map((row, index) => {
                    const preview = previewMap.get(previewKey(row.packageId, row.optionId))
                    return (
                      <tr
                        key={previewKey(row.packageId, row.optionId)}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfd]'}
                      >
                        <td className="px-4 py-3 font-medium text-[#101828]">{row.packageName}</td>
                        <td className="px-4 py-3 text-[#475467]">
                          {row.durationMonths} {c.monthsShort}
                        </td>
                        <td className="px-4 py-3 text-[#475467]">{row.priceAzn.toFixed(2)} AZN</td>
                        <td className="px-4 py-3 text-[#475467]">
                          {preview ? `${(Number(preview.appliedGivebackRate) * 100).toFixed(2)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#00B4CC]">
                          {preview ? preview.awardedCoins : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CoinSection>

      <CoinSaveBar
        onSave={save}
        isSaving={isSaving}
        savingLabel={c.saving}
        saveLabel={c.saveSettings}
        extra={
          <Button
            type="button"
            variant="outline"
            disabled={isPreviewing || packagesLoading || packageRows.length === 0}
            onClick={refreshPreview}
            className="h-10 rounded-xl border-[#ececed] bg-white text-[13px] font-medium hover:border-[#00B4CC]/40 hover:bg-[#00B4CC]/5"
          >
            {isPreviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {c.previewEarnTable}
          </Button>
        }
      />
    </div>
  )
}
