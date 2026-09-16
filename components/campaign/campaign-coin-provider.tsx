'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useCoinSettingsV2, type CoinSettingsV2 } from '@/lib/query/use-coin-settings-v2'
import { useRawSubscriptionPackages } from '@/lib/query/use-subscriptions'
import { useSubscriptionPackages } from '@/lib/query/use-subscription-packages'

export function mapMultiplierValue(
  map: Record<string | number, number> | undefined,
  key: string | number,
  fallback = 1,
) {
  if (!map) return fallback
  const value = map[key as keyof typeof map] ?? map[String(key) as keyof typeof map]
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function previewKey(packageId?: number, optionId?: number) {
  return `${packageId ?? ''}-${optionId ?? ''}`
}

type CampaignCoinContextValue = {
  draft: CoinSettingsV2 | null
  setDraft: React.Dispatch<React.SetStateAction<CoinSettingsV2 | null>>
  isLoading: boolean
  isSaving: boolean
  isPreviewing: boolean
  packagesLoading: boolean
  existingPackages: Array<{ id: number; name: string }>
  existingDurations: number[]
  packageRows: Array<{
    packageId?: number
    optionId?: number
    packageName: string
    durationMonths: number
    priceAzn: number
  }>
  previewMap: Map<string, ReturnType<typeof useCoinSettingsV2>['previews'][number]>
  save: () => Promise<void>
  refreshPreview: () => Promise<void>
  updatePackageMultiplier: (packageId: number, value: number) => void
  updatePeriodMultiplier: (months: number, value: number) => void
}

const CampaignCoinContext = createContext<CampaignCoinContextValue | null>(null)

export function useCampaignCoin() {
  const ctx = useContext(CampaignCoinContext)
  if (!ctx) throw new Error('useCampaignCoin must be used within CampaignCoinProvider')
  return ctx
}

export function CampaignCoinProvider({
  children,
  onNotify,
  settingsSavedMessage,
  saveFailedMessage,
  previewFailedMessage,
}: {
  children: ReactNode
  onNotify: (message: string, type: 'success' | 'error') => void
  settingsSavedMessage: string
  saveFailedMessage: string
  previewFailedMessage: string
}) {
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
      tierMultipliers[String(pkg.id)] = mapMultiplierValue(settings.tierMultipliers, String(pkg.id), 1)
    })
    const periodMultipliers: Record<number, number> = {}
    existingDurations.forEach((months) => {
      periodMultipliers[months] = mapMultiplierValue(settings.periodMultipliers, months, 1)
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

  const runPreview = useCallback(async () => {
    if (packageRows.length === 0) return
    await previewBatch(
      packageRows.map((row) => ({
        packageId: row.packageId,
        optionId: row.optionId,
        tierName: row.packageName,
        durationMonths: row.durationMonths,
        priceAzn: row.priceAzn,
      })),
    )
  }, [packageRows, previewBatch])

  useEffect(() => {
    if (packageRows.length === 0) return
    runPreview().catch(() => undefined)
  }, [packageRows, runPreview])

  const save = useCallback(async () => {
    if (!draft) return
    try {
      const saved = await saveSettings({
        ...draft,
        formulaVersion: draft.formulaVersion || 'EARN_V2_20260901',
        tierMultipliers: Object.fromEntries(
          existingPackages.map((pkg) => [
            String(pkg.id),
            mapMultiplierValue(draft.tierMultipliers, String(pkg.id), 1),
          ]),
        ),
        periodMultipliers: Object.fromEntries(
          existingDurations.map((months) => [
            months,
            mapMultiplierValue(draft.periodMultipliers, months, 1),
          ]),
        ) as Record<number, number>,
      })
      setDraft({
        ...saved,
        tierMultipliers: Object.fromEntries(
          existingPackages.map((pkg) => [
            String(pkg.id),
            mapMultiplierValue(saved.tierMultipliers, String(pkg.id), 1),
          ]),
        ),
        periodMultipliers: Object.fromEntries(
          existingDurations.map((months) => [
            months,
            mapMultiplierValue(saved.periodMultipliers, months, 1),
          ]),
        ) as Record<number, number>,
      })
      onNotify(settingsSavedMessage, 'success')
      await runPreview()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : saveFailedMessage, 'error')
    }
  }, [
    draft,
    existingDurations,
    existingPackages,
    onNotify,
    runPreview,
    saveFailedMessage,
    saveSettings,
    settingsSavedMessage,
  ])

  const refreshPreview = useCallback(async () => {
    try {
      await runPreview()
    } catch (e) {
      onNotify(e instanceof Error ? e.message : previewFailedMessage, 'error')
    }
  }, [onNotify, previewFailedMessage, runPreview])

  const updatePackageMultiplier = useCallback((packageId: number, value: number) => {
    setDraft((current) =>
      current
        ? { ...current, tierMultipliers: { ...current.tierMultipliers, [String(packageId)]: value } }
        : current,
    )
  }, [])

  const updatePeriodMultiplier = useCallback((months: number, value: number) => {
    setDraft((current) =>
      current
        ? { ...current, periodMultipliers: { ...current.periodMultipliers, [months]: value } }
        : current,
    )
  }, [])

  const previewMap = useMemo(
    () => new Map(previews.map((p) => [previewKey(p.packageId, p.optionId), p])),
    [previews],
  )

  const value: CampaignCoinContextValue = {
    draft,
    setDraft,
    isLoading: isLoading || namesLoading,
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
  }

  return <CampaignCoinContext.Provider value={value}>{children}</CampaignCoinContext.Provider>
}
