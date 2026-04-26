'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getAdminStores, getStores } from '@/modules/stores/api/stores.service'
import type { GetAdminStoresParams, GetStoresParams } from '@/modules/stores/types/store.types'

export function useAdminStoresQuery(params?: GetAdminStoresParams) {
  return useQuery({
    queryKey: queryKeys.stores.list(params as Record<string, unknown> | undefined),
    queryFn: () => getAdminStores(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useStoresQuery(params?: GetStoresParams) {
  return useQuery({
    queryKey: queryKeys.stores.list(params as Record<string, unknown> | undefined),
    queryFn: () => getStores(params),
  })
}
