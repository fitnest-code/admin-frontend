import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'

export type CoinSettingsV2 = {
  id?: number
  formulaVersion: string
  active: boolean
  welcomeBonusAmount: number
  baseEarnRate: number
  maxGivebackRate: number
  earnCoinFactor: number
  spendRateCoinToAzn: number
  maxDiscountPercentage: number
  expiryMonths: number
  tierMultipliers: Record<string, number>
  periodMultipliers: Record<number, number>
}

export type PackageEarnPreview = {
  packageId?: number
  optionId?: number
  tier: string
  durationMonths: number
  priceAzn: number
  appliedGivebackRate: number
  awardedCoins: number
}

export function useCoinSettingsV2() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['coin-settings-v2'],
    queryFn: () => apiGet<CoinSettingsV2>('/api/v2/admin/coins/settings'),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: CoinSettingsV2) =>
      apiPut<CoinSettingsV2>('/api/v2/admin/coins/settings', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['coin-settings-v2'], data)
    },
  })

  const previewBatchMutation = useMutation({
    mutationFn: (packages: Array<{
      packageId?: number
      optionId?: number
      tierName?: string
      durationMonths?: number
      priceAzn?: number
    }>) =>
      apiPost<{ formulaVersion: string; previews: PackageEarnPreview[] }>(
        '/api/v2/admin/coins/earn/preview-batch',
        { packages },
      ),
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    previewBatch: previewBatchMutation.mutateAsync,
    isPreviewing: previewBatchMutation.isPending,
    previews: previewBatchMutation.data?.previews ?? [],
  }
}
