import { apiGet } from '@/lib/api/client'
import type {
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

export async function getCustomerById(id: string) {
  const response = await getCustomers({ search: id, size: 20 })
  const rawCustomer = response.items.find((customer) => String(customer.id) === id)

  if (!rawCustomer) return null

  return {
    ...rawCustomer,
    registeredAt: null,
    birthDate: null,
    platform: null,
    goal: null,
    height: null,
    weight: null,
    bmi: null,
    photoUrl: null,
  } satisfies CustomerProfile
}
