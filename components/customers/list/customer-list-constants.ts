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

export const SUBSCRIPTION_STATUS_OPTIONS: { value: Exclude<CustomerSubscriptionType, 'ALL'>; label: string }[] = [
  { value: 'ACTIVE', label: 'Aktiv Abunəlik' },
  { value: 'FINISHED', label: 'Bitmiş Abunəlik' },
  { value: 'FROZEN', label: 'Donmuş Abunəlik' },
  { value: 'LAST_7_DAYS', label: 'Abunəlikdə son 7 gün' },
]
