'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { useI18nStore } from '@/lib/i18n'
import { getPartnerLeadFilterOptions, getPartnerLeads, updatePartnerLead } from './api'
import type { PartnerLeadListParams, PartnerLeadUpdateBody } from './types'

export function usePartnerLeadsQuery(params?: PartnerLeadListParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.partnerApplications.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getPartnerLeads(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function usePartnerLeadFiltersQuery() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.partnerApplications.filters, locale],
    queryFn: getPartnerLeadFilterOptions,
    staleTime: 30_000,
  })
}

export function useUpdatePartnerLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PartnerLeadUpdateBody }) => updatePartnerLead(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerApplications.all })
    },
  })
}
