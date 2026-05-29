import { apiGet, apiPatch, ApiError } from '@/lib/api/client'
import type { PaginatedResponse } from '@/lib/types/api'
import type {
  AdminStoreDetailViewModel,
  AdminStoreListItem,
  AdminStorePatchData,
  AdminStoresResponse,
  GetAdminStoresParams,
  GetStoresParams,
  StoreListItem,
} from '@/modules/stores/types/store.types'

export function getAdminStores(params?: GetAdminStoresParams) {
  return apiGet<AdminStoresResponse>('/api/v1/admin/stores/list', { params })
}

export async function findAdminStoreListItem(id: number): Promise<AdminStoreListItem> {
  const pageSize = 100
  let page = 1
  for (let i = 0; i < 50; i++) {
    const res = await getAdminStores({ page, pageSize, sort: 'newest' })
    const hit = res.items.find((s) => s.id === id)
    if (hit) return hit
    if (res.items.length === 0 || page * pageSize >= res.total) break
    page++
  }
  throw new Error('Mağaza tapılmadı')
}

function mapListItemToDetail(item: AdminStoreListItem): AdminStoreDetailViewModel {
  return {
    id: item.id,
    name: item.name,
    coverImageUrl: null,
    address: item.fullAddress ?? '',
    latitude: 0,
    longitude: 0,
    phone: item.phone ?? '',
    email: '',
    socialUrl: '',
    workHours: { from: '09:00', to: '18:00' },
    discounts: [],
    status: item.status,
  }
}

function mergeDetailFromApi(
  raw: Record<string, unknown>,
  fallbackId: number,
): AdminStoreDetailViewModel {
  const num = (v: unknown, d: number) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : d
  }
  const str = (v: unknown, d = '') => (typeof v === 'string' ? v : v != null ? String(v) : d)
  const id = num(raw.id, fallbackId)
  
  const addrObj = raw.address && typeof raw.address === 'object' ? (raw.address as Record<string, unknown>) : null
  const addressText = addrObj ? str(addrObj.addressText ?? addrObj.fullAddress ?? '', '') : str(raw.address ?? raw.fullAddress, '')
  const latitude = addrObj ? num(addrObj.latitude, 0) : num(raw.latitude, 0)
  const longitude = addrObj ? num(addrObj.longitude, 0) : num(raw.longitude, 0)

  const wh = raw.workHours as Record<string, unknown> | undefined
  const socialObj = raw.socialLink && typeof raw.socialLink === 'object' ? (raw.socialLink as Record<string, unknown>) : null
  const socialUrl = socialObj ? str(socialObj.url ?? socialObj.socialUrl ?? socialObj.social_url, '') : str(raw.socialUrl ?? raw.social_url, '')

  return {
    id,
    name: str(raw.name, ''),
    coverImageUrl: str(raw.coverImageUrl ?? raw.photoUrl ?? raw.imageUrl, '') || null,
    address: addressText,
    latitude,
    longitude,
    phone: str(raw.phone, ''),
    email: str(raw.email, ''),
    socialUrl,
    workHours: {
      from: str(wh?.from ?? raw.workHoursFrom, '09:00'),
      to: str(wh?.to ?? raw.workHoursTo, '18:00'),
    },
    discounts: Array.isArray(raw.discounts)
      ? (raw.discounts as Record<string, unknown>[])
          .map((d) => ({
            packageId: num(d.packageId, 0),
            discountPercent: num(d.discountPercent, 0),
          }))
          .filter((d) => d.packageId > 0)
      : [],
    status: raw.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  }
}

export async function getAdminStoreDetail(id: number): Promise<AdminStoreDetailViewModel> {
  try {
    const raw = await apiGet<Record<string, unknown>>(`/api/v1/admin/stores/${id}`)
    return mergeDetailFromApi(raw, id)
  } catch (e) {
    if (e instanceof ApiError) {
      const item = await findAdminStoreListItem(id)
      return mapListItemToDetail(item)
    }
    throw e
  }
}

function safePatchPhotoFilename(file: File): string {
  let n = (file.name || '').trim().replace(/[^\w.\-()+]/g, '_').slice(0, 120)
  if (!n || !/\.(jpe?g|png|gif|webp)$/i.test(n)) {
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
    n = `store-cover.${ext}`
  }
  return n
}

/** multipart: `data` — JSON string; `photo` — ixtiyari. */
export function patchAdminStore(
  id: number,
  payload: { data: AdminStorePatchData; photo?: File | null },
) {
  const formData = new FormData()
  formData.append('data', JSON.stringify(payload.data))
  if (payload.photo instanceof File) {
    formData.append('photo', payload.photo, safePatchPhotoFilename(payload.photo))
  }
  return apiPatch<{ message?: string }>(`/api/v1/admin/stores/${id}`, formData)
}

export function getStores(params?: GetStoresParams) {
  return apiGet<PaginatedResponse<StoreListItem>>('/api/v1/stores', { params })
}
