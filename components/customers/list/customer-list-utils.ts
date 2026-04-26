import type { CustomerListItem, CustomerStatus } from '@/modules/customers'

export type CustomerSortValue = 'name_az' | 'name_za'
export type UiCustomerStatus = 'active' | 'inactive' | 'blocked'
export type UiSubscriptionStatus = 'active' | 'expired' | 'changed' | 'last7days' | 'none'

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
  if (normalized === 'expired') return 'expired'
  if (normalized === 'upgraded' || normalized === 'changed') return 'changed'
  if (normalized === 'last_7_days' || normalized === 'last7days') return 'last7days'
  return 'none'
}

export function getSubscriptionStatusLabel(status: UiSubscriptionStatus) {
  if (status === 'active') return 'Aktiv'
  if (status === 'expired') return 'Bitmiş'
  if (status === 'changed') return 'Dəyişdirilmiş'
  if (status === 'last7days') return 'Son 7 gün'
  return 'Yoxdur'
}

export function sortCustomers(customers: CustomerListItem[], sortBy: CustomerSortValue | null) {
  const list = [...customers]

  if (sortBy === 'name_az') {
    list.sort((a, b) => `${a.name ?? ''}${a.surname ?? ''}`.localeCompare(`${b.name ?? ''}${b.surname ?? ''}`))
  }

  if (sortBy === 'name_za') {
    list.sort((a, b) => `${b.name ?? ''}${b.surname ?? ''}`.localeCompare(`${a.name ?? ''}${a.surname ?? ''}`))
  }

  return list
}
