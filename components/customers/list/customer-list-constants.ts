import type { CustomerSubscriptionType } from '@/modules/customers'

export const PAGE_SIZE = 10

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc', label: 'Ad :  A-Z' },
  { value: 'name_desc', label: 'Ad :  Z-A' },
  { value: 'finishDate_asc', label: 'Abunəlik bitmə tarixi ( tez bitən yuxarıda)' },
  { value: 'finishDate_desc', label: 'Abunəlik bitmə tarixi ( gec bitən yuxarıda)' },
  { value: 'registrationDate_desc', label: 'Qeydiyyat tarixi (yeni → köhnə)' },
  { value: 'registrationDate_asc', label: 'Qeydiyyat tarixi (köhnə → yeni)' },
] as const

export const DURATION_OPTIONS = [
  { value: 1, label: '1 aylıq' },
  { value: 3, label: '3 aylıq' },
  { value: 6, label: '6 aylıq' },
  { value: 12, label: '12 aylıq' },
] as const

export const SUBSCRIPTION_STATUS_OPTIONS: { value: Exclude<CustomerSubscriptionType, 'ALL'>; label: string }[] = [
  { value: 'ACTIVE', label: 'Aktiv Abunəlik' },
  { value: 'FINISHED', label: 'Bitmiş Abunəlik' },
  { value: 'CHANGED', label: 'Dəyişdirilmiş Abunəlik' },
  { value: 'LAST_7_DAYS', label: 'Abunəlikdə son 7 gün' },
]
