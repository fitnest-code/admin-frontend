export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export type CustomerSubscriptionType = 'all' | 'active' | 'expired' | 'upgraded' | 'last_7_days'

export interface CustomerListItem {
  id: number
  name: string | null
  surname: string | null
  phoneNumber?: string | null
  email?: string | null
  status: CustomerStatus
  subscriptionStatus?: string | null
}

export interface CustomerProfile extends CustomerListItem {
  registeredAt?: string | null
  birthDate?: string | null
  platform?: string | null
  goal?: string | null
  height?: number | null
  weight?: number | null
  bmi?: number | null
  photoUrl?: string | null
}

export interface CustomersResponse {
  items: CustomerListItem[]
  total: number
  page: number
  pageSize: number
}

export interface GetCustomersParams {
  page?: number
  size?: number
  query?: string
  packageID?: number
  durationMonths?: number
  type?: CustomerSubscriptionType
}

export interface SubscriptionPackageName {
  id: number
  name: string
}

export interface UserStatistics {
  totalUsers: number
  usersWithLast7Days: number
  finishedSubscriptions: number
  activeOrFrozenSubscriptions: number
}
