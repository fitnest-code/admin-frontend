export interface StoreListItem {
  id: string
  name: string
  city?: string
  address?: string
  phone?: string
  status?: string
}

export interface GetStoresParams {
  page?: number
  pageSize?: number
  search?: string
  sort?: string
}

export type AdminStoreSort = 'name_asc' | 'name_desc' | 'address_asc' | 'newest'

export interface AdminStoreListItem {
  id: number
  name: string
  fullAddress: string
  phone: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface AdminStoresResponse {
  items: AdminStoreListItem[]
  total: number
  page: number
  pageSize: number
}

export interface GetAdminStoresParams {
  query?: string
  sort?: AdminStoreSort
  page?: number
  pageSize?: number
}
