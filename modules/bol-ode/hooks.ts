'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getBolOde, getBolOdeHistory, getBolOdeList, updateBolOde } from './api'
import type { BolOdeListParams, BolOdeUpdateBody } from './types'

export function useBolOdeListQuery(params?: BolOdeListParams) {
  return useQuery({
    queryKey: queryKeys.bolOde.list(params as Record<string, unknown> | undefined),
    queryFn: () => getBolOdeList(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useBolOdeQuery(id: string | number) {
  return useQuery({
    queryKey: queryKeys.bolOde.detail(id),
    queryFn: () => getBolOde(id),
    staleTime: 0,
  })
}

export function useBolOdeHistoryQuery(id: string | number) {
  return useQuery({
    queryKey: queryKeys.bolOde.history(id),
    queryFn: () => getBolOdeHistory(id),
    staleTime: 0,
  })
}

export function useUpdateBolOdeMutation(id: string | number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: BolOdeUpdateBody) => updateBolOde(id, body),
    onSuccess: (detail) => {
      queryClient.setQueryData(queryKeys.bolOde.detail(id), detail)
      // List rows and the history timeline both change after a status/assign update.
      queryClient.invalidateQueries({ queryKey: queryKeys.bolOde.history(id) })
      queryClient.invalidateQueries({ queryKey: ['bol-ode', 'list'] })
    },
  })
}
