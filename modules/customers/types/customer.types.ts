export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export type CustomerSubscriptionType = 'ALL' | 'ACTIVE' | 'FINISHED' | 'FROZEN' | 'LAST_7_DAYS'

export interface CustomerListItem {
  id: number
  fullName: string | null
  phoneNumber?: string | null
  email?: string | null
  userStatus: CustomerStatus
  subscriptionStatus?: string | null
}

export interface CustomerDetailApiResponse {
  userId: number
  fullName: string
  registrationDate: string
  platform: string
  phoneNumber: string
  email: string
  birthDate: string
  goalTitle: string
  height: number
  weight: number
  bmiIndex: number
}

export interface CustomerProfile extends CustomerListItem {
  name?: string | null
  surname?: string | null
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
  search?: string
  packageId?: number
  packageDuration?: number
  subscriptionStatus?: CustomerSubscriptionType
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

export interface QrHistoryItem {
  dateTime: string
  gymName: string
  status: string
  failedReason?: string
  platform: string
}

export interface UserPaymentHistoryItem {
  transactionId: string
  dateTime: string
  amount: string
  paymentMethod: string
  status: string
}

export interface CustomerCurrentSubscription {
  packageId: number
  packageName: string
  optionId: number
  optionDuration: number
  price: number
  discountedPrice: number
  startDate: string
  endDate: string
  totalEntryLimit: number
  userRemainingLimit: number
}
