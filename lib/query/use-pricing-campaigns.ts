import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'

const BASE = '/api/v2/admin/pricing-campaigns'

export type PricingCampaignLocalized = {
  az: string
  ru: string
  en: string
}

export type PricingDiscount = {
  months: number
  percent: number
}

export type AdminPricingCampaignRequest = {
  code: string
  startsAt: string
  endsAt: string
  maxPercent: number
  discounts: PricingDiscount[]
  pushTitle: PricingCampaignLocalized
  pushBody: PricingCampaignLocalized
  pushLast12hTitle: PricingCampaignLocalized
  pushLast12hBody: PricingCampaignLocalized
}

export type AdminPricingCampaignResponse = AdminPricingCampaignRequest & {
  id: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
}

const listKey = ['pricing-campaigns'] as const
const detailKey = (id: string) => ['pricing-campaigns', id] as const

export function usePricingCampaigns() {
  return useQuery({
    queryKey: listKey,
    queryFn: () => apiGet<AdminPricingCampaignResponse[]>(BASE),
  })
}

export function usePricingCampaign(id: string | null | undefined) {
  return useQuery({
    queryKey: detailKey(id ?? ''),
    queryFn: () => apiGet<AdminPricingCampaignResponse>(`${BASE}/${id}`),
    enabled: Boolean(id),
  })
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: listKey })
}

export function usePricingCampaignMutations() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: AdminPricingCampaignRequest) =>
      apiPost<AdminPricingCampaignResponse>(BASE, payload),
    onSuccess: (data) => {
      invalidateAll(queryClient)
      queryClient.setQueryData(detailKey(data.id), data)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPricingCampaignRequest }) =>
      apiPut<AdminPricingCampaignResponse>(`${BASE}/${id}`, payload),
    onSuccess: (data) => {
      invalidateAll(queryClient)
      queryClient.setQueryData(detailKey(data.id), data)
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiPost<AdminPricingCampaignResponse>(`${BASE}/${id}/activate`),
    onSuccess: (data) => {
      invalidateAll(queryClient)
      queryClient.setQueryData(detailKey(data.id), data)
    },
  })

  const disableMutation = useMutation({
    mutationFn: (id: string) => apiPost<AdminPricingCampaignResponse>(`${BASE}/${id}/disable`),
    onSuccess: (data) => {
      invalidateAll(queryClient)
      queryClient.setQueryData(detailKey(data.id), data)
    },
  })

  return {
    createCampaign: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCampaign: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    activateCampaign: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    disableCampaign: disableMutation.mutateAsync,
    isDisabling: disableMutation.isPending,
  }
}
