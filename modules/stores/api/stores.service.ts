import { apiGet } from '@/lib/api/client'
import type { PaginatedResponse } from '@/lib/types/api'
import type {
  AdminStoresResponse,
  GetAdminStoresParams,
  GetStoresParams,
  StoreListItem,
} from '@/modules/stores/types/store.types'

export function getAdminStores(params?: GetAdminStoresParams) {
  return apiGet<AdminStoresResponse>('/api/v1/admin/stores/list', { params })
}

export function getStores(params?: GetStoresParams) {
  return apiGet<PaginatedResponse<StoreListItem>>('/api/v1/stores', { params })
}
