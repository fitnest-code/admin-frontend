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

/** Mağaza detalı / redaktə UI (GET /admin/stores/{id} və ya siyahı fallback). */
export interface AdminStoreDetailViewModel {
  id: number
  name: string
  coverImageUrl: string | null
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  socialUrl: string
  workHours: { from: string; to: string }
  discounts: { packageId: number; discountPercent: number }[]
  status: 'ACTIVE' | 'INACTIVE'
}

/** PATCH /admin/stores/{id} — multipart: `data` (JSON string), `photo` (optional). */
export interface AdminStorePatchData {
  name: string
  latitude: number
  longitude: number
  phone: string
  email: string
  socialUrl: string
  socialUrlProvided: boolean
  workHours: { from: string; to: string }
  workHoursProvided: boolean
  discounts: { packageId: number; discountPercent: number }[]
  /** Backend ünvan üçün əlavə sahə istifadə edə bilər */
  address?: string
}
