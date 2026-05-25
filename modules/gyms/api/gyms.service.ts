import { apiGet, apiPatch, apiRequest } from '@/lib/api/client'
import { DEFAULT_WORKING_HOURS, type Gym, type Review, type Trainer } from '@/lib/gyms-data'
import type {
  AdminGymsResponse,
  GetAdminGymsParams,
  GetGymsParams,
  GymDetailResponse,
  GymInfoAdminResponse,
  GymListItem,
  GymLocationResponse,
  GymQrResponse,
  GymReservationRulesResponse,
  GymReviewsResponse,
  GymTrainersResponse,
  GymsResponse,
} from '@/modules/gyms/types/gym.types'

export function getAdminGyms(params?: GetAdminGymsParams) {
  return apiGet<AdminGymsResponse>('/api/v1/admin/gyms/list', { params })
}

export async function getGyms(params?: GetGymsParams) {
  const response = await apiGet<GymsResponse>('/api/v1/gyms', {
    params: {
      type: 'ALL',
      page: 1,
      page_size: 50,
      sort_dir: 'DESC',
      ...params,
    },
  })

  const items: GymListItem[] = response.items.map((item) => ({
    id: String(item.gymId),
    name: item.name,
    city: item.city,
    address: item.location,
    status: 'active',
    stars: item.stars,
    isNew: item.isNew,
    isSaved: item.isSaved,
    distanceKm: item.distanceKm ?? null,
  }))

  return {
    ...response,
    items,
  }
}

export async function getGymById(id: string): Promise<Gym> {
  const response = await apiGet<GymInfoAdminResponse>(`/api/v1/admin/gyms/${id}/details`)

  return {
    id: String(response.id),
    name: response.name,
    about: response.description ?? '',
    city: response.city ?? '',
    address: response.address ?? '',
    phone: response.phone ?? '',
    email: response.email ?? '',
    status: response.status === 'INACTIVE' || response.status === 'DELETED' ? 'inactive' : 'active',
    createdAt: response.createdAt ?? new Date().toLocaleDateString('az-AZ'),
    coverImage: response.coverImageUrl,
    images: [],
    genderType: 'mixed',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: [],
    services: [],
    trainers: [],
    admins: [],
    supportedSubscriptions: [],
    categoryId: response.categoryId,
    categoryName: response.categoryName,
  }
}

export async function getGymTrainers(gymId: string, params?: { page?: number; page_size?: number; sort_dir?: 'ASC' | 'DESC' }) {
  const response = await apiGet<GymTrainersResponse>(`/api/v1/gyms/${gymId}/trainers`, {
    params: {
      page: 1,
      page_size: 10,
      sort_dir: 'DESC',
      ...params,
    },
  })

  const items: Trainer[] = response.items.map((trainer) => ({
    id: trainer.trainer_id,
    firstName: trainer.name,
    lastName: trainer.surname,
    phone: trainer.phone ?? '',
    email: trainer.email ?? '',
    role: trainer.profession?.name ?? 'Trainer',
    gymId,
    photo: trainer.picture,
  }))

  return {
    ...response,
    items,
  }
}

export async function getGymReviews(gymId: string, params?: { page?: number; page_size?: number; sort?: string }) {
  const response = await apiGet<GymReviewsResponse>(`/api/v1/gyms/${gymId}/reviews`, {
    params: {
      page: 1,
      page_size: 10,
      ...params,
    },
  })

  const items: Review[] = response.items.map((review) => ({
    id: review.review_id,
    gymId,
    gymName: '',
    userName: review.author?.full_name ?? 'Unknown user',
    rating: review.rating,
    comment: review.comment ?? '',
    status: 'approved',
    date: review.created_at ?? '',
  }))

  return {
    ...response,
    items,
  }
}

export async function getGymQr(gymId: string) {
  return apiGet<GymQrResponse>(`/api/v1/gyms/${gymId}/qr`)
}

export async function getGymLocation(gymId: string) {
  return apiGet<GymLocationResponse>(`/api/v1/gyms/${gymId}/location`)
}

export async function getGymReservationRules(gymId: string) {
  return apiGet<GymReservationRulesResponse>(`/api/v1/gyms/${gymId}/reservation-rules`)
}

export function toggleGymStatus(id: string, enabled: boolean) {
  return apiRequest<void>(`/admin/gyms/${id}/status`, {
    method: 'PATCH',
    params: { enabled }
  })
}
