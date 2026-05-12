import type { CustomerListItem, CustomerStatus } from '@/modules/customers'

export type CustomerSortValue =
  | 'newest'
  | 'name_asc'
  | 'name_desc'
  | 'finishDate_asc'
  | 'finishDate_desc'
  | 'registrationDate_desc'
  | 'registrationDate_asc'

export type UiCustomerStatus = 'active' | 'inactive' | 'blocked'
export type UiSubscriptionStatus = 'active' | 'expired' | 'changed' | 'last7days' | 'frozen' | 'none'

export const CUSTOMER_STATUS_STYLES: Record<UiCustomerStatus, string> = {
  active: 'bg-green-600 text-white',
  inactive: 'bg-[#6B7280] text-white',
  blocked: 'bg-red-600 text-white',
}

export const SUBSCRIPTION_STATUS_TEXT_STYLES: Record<UiSubscriptionStatus, string> = {
  active: 'text-[#00B4CC]',
  expired: 'text-red-500',
  changed: 'text-orange-500',
  last7days: 'text-[#00B4CC]',
  frozen: 'text-blue-500',
  none: 'text-muted-foreground',
}

export function normalizeCustomerStatus(status: CustomerStatus): UiCustomerStatus {
  if (status === 'ACTIVE') return 'active'
  if (status === 'INACTIVE') return 'inactive'
  return 'blocked'
}

export function getCustomerStatusLabel(status: UiCustomerStatus) {
  if (status === 'active') return 'Aktiv'
  if (status === 'inactive') return 'Deaktiv'
  return 'Blok'
}

export function normalizeSubscriptionStatus(status?: string | null): UiSubscriptionStatus {
  if (!status) return 'none'

  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'active'
  if (normalized === 'expired' || normalized === 'finished' || normalized === 'cancelled') return 'expired'
  if (normalized === 'upgraded' || normalized === 'changed') return 'changed'
  if (normalized === 'last_7_days' || normalized === 'last7days') return 'last7days'
  if (normalized === 'frozen') return 'frozen'
  return 'none'
}

export function getSubscriptionStatusLabel(status: UiSubscriptionStatus) {
  if (status === 'active') return 'Aktiv'
  if (status === 'expired') return 'Bitmiş'
  if (status === 'changed') return 'Dəyişdirilmiş'
  if (status === 'last7days') return 'Son 7 gün'
  if (status === 'frozen') return 'Dondurulmuş'
  return 'Yoxdur'
}

export function sortCustomers(customers: CustomerListItem[], sortBy: CustomerSortValue | null) {
  const list = [...customers]

  if (sortBy === 'name_asc') {
    list.sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''))
  }

  if (sortBy === 'name_desc') {
    list.sort((a, b) => (b.fullName ?? '').localeCompare(a.fullName ?? ''))
  }

  return list
}
