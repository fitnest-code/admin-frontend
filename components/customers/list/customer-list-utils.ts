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
  none: 'text-foreground/40',
}

export function normalizeCustomerStatus(status: CustomerStatus): UiCustomerStatus {
  if (status === 'ACTIVE') return 'active'
  if (status === 'INACTIVE') return 'inactive'
  return 'blocked'
}

export function getCustomerStatusLabel(status: UiCustomerStatus, t: { statusActive: string; statusInactive: string; statusBlocked: string }) {
  if (status === 'active') return t.statusActive
  if (status === 'inactive') return t.statusInactive
  return t.statusBlocked
}

export function normalizeSubscriptionStatus(status?: string | null): UiSubscriptionStatus {
  if (!status) return 'none'

  const normalized = status.toLowerCase()
  if (normalized.includes('last_7_days') || normalized.includes('last7days') || normalized.includes('son 7 gün')) return 'last7days'
  if (normalized.includes('upgraded') || normalized.includes('changed') || normalized.includes('dəyişdirilmiş')) return 'changed'
  if (normalized.includes('expired') || normalized.includes('finished') || normalized.includes('cancelled') || normalized.includes('bitmiş') || normalized.includes('bitib')) return 'expired'
  if (normalized.includes('frozen') || normalized.includes('dondurulmuş')) return 'frozen'
  if (normalized.includes('active') || normalized.includes('aktiv')) return 'active'
  
  // If it's something else but not empty, maybe default to none or active? 
  // Given the sample, these cover it.
  return 'none'
}

export function getSubscriptionStatusLabel(
  status: UiSubscriptionStatus,
  t: { subActive: string; subExpired: string; subChanged: string; subLast7: string; subFrozen: string; subNone: string }
) {
  if (status === 'active') return t.subActive
  if (status === 'expired') return t.subExpired
  if (status === 'changed') return t.subChanged
  if (status === 'last7days') return t.subLast7
  if (status === 'frozen') return t.subFrozen
  return t.subNone
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
