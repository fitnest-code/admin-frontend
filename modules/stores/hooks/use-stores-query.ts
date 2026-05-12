'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import {
  getAdminStores,
  getStores,
  getAdminStoreDetail,
  patchAdminStore,
} from '@/modules/stores/api/stores.service'
import type { AdminStorePatchData, GetAdminStoresParams, GetStoresParams } from '@/modules/stores/types/store.types'

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

/** Tam mağaza kartı (GET /admin/stores/{id} və ya siyahı + default sahələr). */
export function useAdminStoreDetailQuery(storeId: number | null) {
  return useQuery({
    queryKey: ['stores', 'admin-detail', storeId] as const,
    queryFn: () => getAdminStoreDetail(storeId!),
    enabled: storeId != null && Number.isFinite(storeId) && storeId > 0,
  })
}

export function useUpdateAdminStoreMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      photo,
    }: {
      id: number
      data: AdminStorePatchData
      photo?: File | null
    }) => patchAdminStore(id, { data, photo }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
      queryClient.invalidateQueries({ queryKey: ['stores', 'admin-detail', id] })
    },
  })
}
