'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { useI18nStore } from '@/lib/i18n'
import { getBmiLeadFilterOptions, getBmiLeads, updateBmiLead } from './api'
import type { BmiLeadListParams, BmiLeadUpdateBody } from './types'

export function useBmiLeadsQuery(params?: BmiLeadListParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.bmiRequests.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getBmiLeads(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useBmiLeadFiltersQuery() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.bmiRequests.filters, locale],
    queryFn: getBmiLeadFilterOptions,
    staleTime: 30_000,
  })
}

export function useUpdateBmiLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: BmiLeadUpdateBody }) => updateBmiLead(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bmiRequests.all })
    },
  })
}
