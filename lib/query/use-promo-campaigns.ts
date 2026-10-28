import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/client'

export type PromoCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED' | 'EXPIRED'

export interface PromoCampaignListItem {
  id: string
  name: string
  code: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  maxDiscountAmount?: number | null
  audienceType: 'UPLOADED_LIST' | 'NEW_USERS' | 'ALL_USERS'
  startsAt: string
  endsAt: string
  redeemedCount: number
  totalLimit?: number | null
  status: PromoCampaignStatus
  priority: number
  partnerName?: string | null
  eligibleNumbers?: number | null
}

export interface PromoCampaignSummary {
  activeCampaigns: number
  eligibleNumbers: number
  redeemedLast30Days: number
  redeemedPrevious30Days: number
  discountGivenLast30Days: number
  discountGivenPrevious30Days: number
}

export interface PromoCampaignInput {
  name: string
  code: string
  partnerId?: string
  discountType: 'PERCENT' | 'FIXED'
  discountValue: number
  maxDiscountAmount?: number
  audienceType: 'UPLOADED_LIST' | 'NEW_USERS' | 'ALL_USERS'
  planIds: string[]
  startsAt: string
  endsAt: string
  usesPerUser: number
  totalLimit?: number
  firstPaymentOnly: boolean
  allowFitcoin: boolean
  allowInstallments: boolean
  includeExistingUsers: boolean
  translations: Array<{ locale: 'az'; popupTitle: string; popupBody: string; ctaLabel: string }>
  popup: { ctaTarget: 'PLANS'; imageUrl: string; durationSec: number }
}

interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

export function usePromoCampaignSummary() {
  return useQuery({
    queryKey: ['promo-campaign-summary-v1'],
    queryFn: () => apiGet<PromoCampaignSummary>('/api/v1/admin/promo-campaigns/summary'),
    staleTime: 30_000,
  })
}

export function usePromoCampaigns(search: string, status?: PromoCampaignStatus) {
  return useQuery({
    queryKey: ['promo-campaigns-v1', search, status],
    queryFn: () => apiGet<SpringPage<PromoCampaignListItem>>('/api/v1/admin/promo-campaigns', {
      params: { page: 0, size: 50, ...(search ? { search } : {}), ...(status ? { statuses: status } : {}) },
    }),
  })
}

export function useCreatePromoCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PromoCampaignInput) =>
      apiPost<PromoCampaignListItem>('/api/v1/admin/promo-campaigns', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-campaigns-v1'] })
      queryClient.invalidateQueries({ queryKey: ['promo-campaign-summary-v1'] })
    },
  })
}
