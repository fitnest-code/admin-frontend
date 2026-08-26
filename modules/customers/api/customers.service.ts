import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client'
import type {
  CustomerCurrentSubscription,
  CustomerDetailApiResponse,
  CustomerProfile,
  CustomersResponse,
  GetCustomersParams,
  QrHistoryItem,
  SubscriptionPackageName,
  UserPaymentHistoryItem,
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

export function getUserQrHistory(userId: string) {
  return apiGet<QrHistoryItem[]>(`/api/v1/admin/gyms/users/${userId}/qr-history`)
}

export function getUserPaymentHistory(userId: string) {
  return apiGet<UserPaymentHistoryItem[]>(`/api/v1/admin/payments/user/${userId}/history`)
}

export function getCustomerCurrentSubscription(userId: string) {
  return apiGet<CustomerCurrentSubscription>(`/api/v1/admin/subscriptions/users/${userId}/current`)
}

export interface UpdateEntryLimitBody {
  remainingLimit: number
  totalLimit?: number
}

export function updateCustomerEntryLimit(userId: string, body: UpdateEntryLimitBody) {
  return apiPatch<CustomerCurrentSubscription>(
    `/api/v1/admin/subscriptions/users/${userId}/current/entry-limit`,
    body,
  )
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
    userStatus: data.userStatus || data.status || 'ACTIVE',
    subscriptionStatus: null,
    registeredAt: data.registrationDate,
    birthDate: data.birthDate,
    platform: data.platform === 'N/A' ? null : data.platform,
    goal: data.goalTitle,
    height: data.height,
    weight: data.weight,
    bmi: data.bmiIndex,
    photoUrl: null,
    role: data.role || null,
  }
}

export function blockUser(userId: number) {
  return apiPost<void>(`/api/v1/admin/users/${userId}/block`)
}

export function unblockUser(userId: number) {
  return apiPost<void>(`/api/v1/admin/users/${userId}/unblock`)
}

export function resetUserPassword(userId: number, newPassword: string) {
  return apiPost<void>(`/api/v1/admin/users/${userId}/password/reset`, { newPassword })
}

export interface UserRoleDto {
  id: string
  name: string
}

export function getAllRoles() {
  return apiGet<UserRoleDto[]>('/api/v1/admin/roles')
}

export function changeUserRole(userId: number, role: string) {
  return apiPost<void>(`/api/v1/admin/users/${userId}/change-role`, { role })
}

export function deleteUserSubscriptions(userId: string | number) {
  return apiDelete<void>(`/api/v1/admin/subscriptions/users/${userId}/all`)
}

export function resetDeviceLimit(userId: number) {
  return apiPost<void>(`/api/v1/admin/users/${userId}/device-limit/reset`)
}

export function hardDeleteUser(userId: number) {
  return apiDelete<void>(`/api/v1/admin/users/${userId}/hard-delete`)
}

export interface AdminRoleRawDto {
  id: number
  name: string
}

export function getRawRoles() {
  return apiGet<AdminRoleRawDto[]>('/api/v1/admin/roles/raw')
}

export function createRole(name: string) {
  return apiPost<AdminRoleRawDto>(`/api/v1/admin/roles?name=${encodeURIComponent(name)}`)
}

export function deleteRole(roleId: number) {
  return apiDelete<void>(`/api/v1/admin/roles/${roleId}`)
}

