import type { CustomerSubscriptionType } from '@/modules/customers'
import type { TranslationKeys } from '@/lib/i18n/locales/az'

export const PAGE_SIZE = 10

// Value arrays stay constant; labels are derived at render-time from t.lists
export const SORT_OPTION_VALUES = [
  'newest',
  'name_asc',
  'name_desc',
  'finishDate_asc',
  'finishDate_desc',
  'registrationDate_desc',
  'registrationDate_asc',
] as const

export type SortOptionValue = (typeof SORT_OPTION_VALUES)[number]

export function getSortOptions(t: TranslationKeys['lists']) {
  return [
    { value: 'newest' as const, label: t.sortNewest },
    { value: 'name_asc' as const, label: t.sortNameAsc },
    { value: 'name_desc' as const, label: t.sortNameDesc },
    { value: 'finishDate_asc' as const, label: t.sortFinishAsc },
    { value: 'finishDate_desc' as const, label: t.sortFinishDesc },
    { value: 'registrationDate_desc' as const, label: t.sortRegDateDesc },
    { value: 'registrationDate_asc' as const, label: t.sortRegDateAsc },
  ]
}

export function getDurationOptions(t: TranslationKeys['lists']) {
  return [
    { value: 1, label: t.duration1 },
    { value: 3, label: t.duration3 },
    { value: 6, label: t.duration6 },
    { value: 12, label: t.duration12 },
  ]
}

export function getSubscriptionStatusOptions(
  t: TranslationKeys['lists'],
): { value: Exclude<CustomerSubscriptionType, 'ALL'>; label: string }[] {
  return [
    { value: 'ACTIVE', label: t.subFilterActive },
    { value: 'FINISHED', label: t.subFilterFinished },
    { value: 'CHANGED', label: t.subFilterChanged },
    { value: 'LAST_7_DAYS', label: t.subFilterLast7 },
  ]
}

// Legacy static exports kept for backward-compat with staff/admin/partner sort dropdowns
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc', label: 'Ad: A-Z' },
  { value: 'name_desc', label: 'Ad: Z-A' },
  { value: 'finishDate_asc', label: 'Abunəlik bitmə tarixi (tez bitən yuxarıda)' },
  { value: 'finishDate_desc', label: 'Abunəlik bitmə tarixi (gec bitən yuxarıda)' },
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
