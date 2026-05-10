export type GymStatus = 'active' | 'inactive'
export type AdminGymStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'DRAFT'
export type AdminGymSort = 'name_asc' | 'name_desc' | 'address_asc' | 'newest' | 'deactivated'

export interface GymListItem {
  id: string
  name: string
  city?: string
  address?: string
  status?: GymStatus
  stars?: number
  isNew?: boolean
  isSaved?: boolean
  distanceKm?: number | null
}

export interface AdminGymListItem {
  id: number
  name: string
  fullAddress: string
  ownerName: string
  status: AdminGymStatus
}

export interface AdminGymsResponse {
  items: AdminGymListItem[]
  total: number
  page: number
  pageSize: number
}

export interface GetAdminGymsParams {
  query?: string
  sort?: AdminGymSort
  page?: number
  pageSize?: number
}

export interface GetGymsParams {
  q?: string
  type?: 'ALL' | 'NEW' | 'CLOSEST' | 'SAVED'
  category?: number
  subscriptionId?: number
  page?: number
  page_size?: number
  lat?: number
  lng?: number
  sort_dir?: 'ASC' | 'DESC'
}

export interface GymsResponse {
  items: {
    gymId: string
    name: string
    stars?: number
    isNew?: boolean
    location?: string
    city?: string
    distanceKm?: number | null
    isSaved?: boolean
  }[]
  total: number
  page: number
  pageSize: number
}

export interface GymDetailResponse {
  gym_id: string
  name: string
  description?: string
  address?: {
    latitude?: number
    longitude?: number
    addressText?: string
    city?: string
  }
  phone?: string
  email?: string
  trainers?: {
    trainer_id: string
    name: string
    surname: string
    phone?: string
    email?: string
    profession?: { name?: string }
    picture?: string
  }[]
  coverImageUrl?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  supportedSubscriptions?: {
    plan_id: string
    packageName: string
    dailyPrice: number
    benefits?: { description: string }[]
  }[]
}

export interface GymTrainersResponse {
  items: {
    trainer_id: string
    name: string
    surname: string
    profession?: {
      id?: number
      name?: string
    }
    picture?: string
    phone?: string
    email?: string
  }[]
  total: number
  page: number
  pageSize: number
}

export interface GymReviewsResponse {
  items: {
    review_id: string
    rating: number
    comment?: string
    author?: {
      user_id?: string
      full_name?: string
      avatar_url?: string
    }
    created_at?: string
  }[]
  total: number
  page: number
  pageSize: number
}

export interface GymQrResponse {
  qrCodeUrl: string
}

export interface GymLocationResponse {
  latitude: number
  longitude: number
  addressText: string
}

export interface GymReservationRulesResponse {
  rules?: {
    max_reservations_per_day?: number
    cancel_before_minutes?: number
  }
  reservation_required?: boolean
}

export interface GymWorkHourResponse {
  period: string
  from: string
  to: string
}

export interface RestDayRequest {
  period: string
}

export interface RoomImageDto {
  id: number
  name: string
  imageUrl?: string
}

export interface GymInfoAdminResponse {
  id: number
  categoryId?: number
  categoryName?: string
  name: string
  description?: string
  coverImageUrl?: string
  rooms?: RoomImageDto[]
  phone?: string
  email?: string
  city?: string
  address?: string
  latitude?: number
  longitude?: number
  generalWorkHours?: GymWorkHourResponse[]
  workHoursWoman?: GymWorkHourResponse[]
  workHoursMan?: GymWorkHourResponse[]
  restDays?: RestDayRequest[]
  status?: AdminGymStatus
  createdAt?: string
}

export interface GymSubscriptionsAdminResponse {
  gymId: number
  subscriptions: {
    plan_id: string
    packageName: string
    dailyPrice: number
    benefits?: { description: string }[]
  }[]
}
