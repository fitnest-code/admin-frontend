import { apiGet } from '@/lib/api/client'
import type {
  CustomerDetailApiResponse,
  CustomerProfile,
  CustomersResponse,
  GetCustomersParams,
  SubscriptionPackageName,
  UserStatistics,
} from '@/modules/customers/types/customer.types'

export function getCustomers(params?: GetCustomersParams) {
  return apiGet<CustomersResponse>('/api/v1/admin/users', { params })
}

export function getSubscriptionPackageNames() {
  return apiGet<SubscriptionPackageName[]>('/api/v1/admin/subscription-packages/names')
}

export function getUserStatistics() {
  return apiGet<UserStatistics>('/api/v1/admin/users/statistics')
}

export async function getCustomerById(id: string): Promise<CustomerProfile> {
  const data = await apiGet<CustomerDetailApiResponse>(`/api/v1/admin/users/${id}`)
  
  // Parse fullName into name and surname
  const nameParts = (data.fullName || '').split(' ')
  const name = nameParts[0] || null
  const surname = nameParts.slice(1).join(' ') || null
  
  return {
    id: data.userId,
    name,
    surname,
    fullName: data.fullName || null,
    phoneNumber: data.phoneNumber || null,
    email: data.email || null,
    userStatus: 'ACTIVE',
    subscriptionStatus: null,
    registeredAt: data.registrationDate,
    birthDate: data.birthDate,
    platform: data.platform === 'N/A' ? null : data.platform,
    goal: data.goalTitle,
    height: data.height,
    weight: data.weight,
    bmi: data.bmiIndex,
    photoUrl: null,
  }
}
