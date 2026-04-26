import type { CustomerSubscriptionType } from '@/modules/customers'

export const PAGE_SIZE = 10

export const SORT_OPTIONS = [
  { value: 'name_az', label: 'Ad : A-Z' },
  { value: 'name_za', label: 'Ad : Z-A' },
] as const

export const DURATION_OPTIONS = [
  { value: 1, label: '1 aylıq' },
  { value: 2, label: '2 aylıq' },
  { value: 3, label: '3 aylıq' },
] as const

export const SUBSCRIPTION_STATUS_OPTIONS: { value: Exclude<CustomerSubscriptionType, 'all'>; label: string }[] = [
  { value: 'active', label: 'Aktiv Abunəlik' },
  { value: 'expired', label: 'Bitmiş Abunəlik' },
  { value: 'upgraded', label: 'Dəyişdirilmiş Abunəlik' },
  { value: 'last_7_days', label: 'Abunəlikdə son 7 gün' },
]
