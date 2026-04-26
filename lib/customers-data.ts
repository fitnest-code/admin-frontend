// lib/customers-data.ts

export type CustomerStatus = 'active' | 'inactive' | 'blocked'
export type SubscriptionStatus = 'active' | 'expired' | 'changed' | 'last7days'
export type SubscriptionPackage = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type SubscriptionDuration = '1 aylıq' | '2 aylıq' | '3 aylıq'
export type Platform = 'iOS' | 'Android'
export type Goal = 'Çəki azaltmaq' | 'Kütlə yığmaq' | 'Forma saxlamaq' | 'Güc artırmaq'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  status: CustomerStatus
  subscriptionStatus: SubscriptionStatus
  subscriptionPackage: SubscriptionPackage
  subscriptionDuration: SubscriptionDuration
  registeredAt: string
  birthDate: string
  platform: Platform
  goal: Goal
  height: number
  weight: number
  bmi: number
  photo?: string
  gymId: string
}

export const QUICK_REPLIES = [
  { id: 'q1', title: 'Salamlama',             body: 'Salam! Bizimlə əlaqə saxladığınız üçün təşəkkür edirik.' },
  { id: 'q2', title: 'Sifarişin statusu',     body: 'Sifarişin statusunu dərhal yoxlayacağam.' },
  { id: 'q3', title: 'Geri ödəniş prosesi',   body: 'Anlayıram ki, geri ödəniş etmək istəyirsiz. Geri ödəniş prosesi...' },
  { id: 'q4', title: 'Təşəkkür',              body: 'Bizimlə əlaqə saxladığınız üçün təşəkkür etdik! Ba...' },
  { id: 'q5', title: 'Zəhmət olmasa gözləyin',body: 'Bunu yoxlayarkən zəhmət olmasa bir az gözləyin.' },
]

export const SORT_OPTIONS = [
  { value: 'newest',       label: 'Yeni əlavə olunanlar' },
  { value: 'name_az',      label: 'Ad : A-Z' },
  { value: 'name_za',      label: 'Ad : Z-A' },
  { value: 'sub_asc',      label: 'Abunəlik bitmə tarixi (tez bitən yuxarıda)' },
  { value: 'sub_desc',     label: 'Abunəlik bitmə tarixi (gec bitən yuxarıda)' },
  { value: 'reg_new',      label: 'Qeydiyyat tarixi (yeni → köhnə)' },
  { value: 'reg_old',      label: 'Qeydiyyat tarixi (köhnə → yeni)' },
]

export const SUBSCRIPTION_STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active',    label: 'Aktiv Abunəlik' },
  { value: 'expired',   label: 'Bitmiş Abunəlik' },
  { value: 'changed',   label: 'Dəyişdirilmiş Abunəlik' },
  { value: 'last7days', label: 'Abunəlikdə son 7 gün' },
]

export const PACKAGES: SubscriptionPackage[] = ['Bronze', 'Silver', 'Gold', 'Platinum']
export const DURATIONS: SubscriptionDuration[] = ['1 aylıq', '2 aylıq', '3 aylıq']

const STATUS_LABELS: Record<CustomerStatus, string> = {
  active:   'Aktiv',
  inactive: 'Deaktiv',
  blocked:  'Blok',
}

export function getStatusLabel(s: CustomerStatus) { return STATUS_LABELS[s] }

const SUB_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active:    'Aktiv',
  expired:   'Bitmiş',
  changed:   'Dəyişdirilmiş',
  last7days: 'Son 7 gün',
}

export function getSubStatusLabel(s: SubscriptionStatus) { return SUB_STATUS_LABELS[s] }

// ── Access log ───────────────────────────────────────────────────────────────
export type AccessResult = 'approved' | 'rejected'
export type AccessReason = 'Müddəti bitib' | 'Limit dolub' | 'Yanlış zal' | 'Uğurlu giriş'

export interface AccessLog {
  id: string
  datetime: string
  gymName: string
  result: AccessResult
  reason: AccessReason
  platform: Platform
}

export const MOCK_ACCESS_LOGS: AccessLog[] = [
  { id: 'a1',  datetime: '25.07.26 / 18:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'Android' },
  { id: 'a2',  datetime: '25.07.26 / 18:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'Android' },
  { id: 'a3',  datetime: '25.07.26 / 18:00', gymName: 'FIT CLUB-Nərimanov', result: 'rejected', reason: 'Yanlış zal',   platform: 'Android' },
  { id: 'a4',  datetime: '24.07.26 / 10:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'iOS' },
  { id: 'a5',  datetime: '24.07.26 / 10:00', gymName: 'FIT CLUB-Nərimanov', result: 'rejected', reason: 'Müddəti bitib', platform: 'iOS' },
  { id: 'a6',  datetime: '23.07.26 / 09:30', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'Android' },
  { id: 'a7',  datetime: '23.07.26 / 09:30', gymName: 'FIT CLUB-Nərimanov', result: 'rejected', reason: 'Limit dolub',  platform: 'Android' },
  { id: 'a8',  datetime: '22.07.26 / 14:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'iOS' },
  { id: 'a9',  datetime: '22.07.26 / 14:00', gymName: 'FIT CLUB-Nərimanov', result: 'rejected', reason: 'Müddəti bitib', platform: 'Android' },
  { id: 'a10', datetime: '21.07.26 / 11:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'iOS' },
  { id: 'a11', datetime: '21.07.26 / 11:00', gymName: 'FIT CLUB-Nərimanov', result: 'rejected', reason: 'Yanlış zal',   platform: 'Android' },
  { id: 'a12', datetime: '20.07.26 / 16:00', gymName: 'FIT CLUB-Nərimanov', result: 'approved', reason: 'Uğurlu giriş', platform: 'iOS' },
]

export const ACCESS_SORT_OPTIONS = [
  { value: 'zal',      label: 'Zal' },
  { value: 'date_asc', label: 'Tarix aralığı' },
  { value: 'result',   label: 'Nəticə' },
  { value: 'platform', label: 'Platforma' },
]

// ── Payment ───────────────────────────────────────────────────────────────────
export type PaymentStatus = 'success' | 'pending' | 'error' | 'refunded'
export type PaymentMethod = 'Apple Pay' | 'Kapital Bank' | 'Google Pay'

export interface Payment {
  id: string
  datetime: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  errorReason?: string
}

export const MOCK_PAYMENTS: Payment[] = [
  { id: '000000000000001', datetime: '20.08.26 / 13:00', amount: 1000, method: 'Apple Pay',   status: 'success'  },
  { id: '000000000000002', datetime: '20.08.26 / 13:00', amount: 1000, method: 'Kapital Bank', status: 'pending'  },
  { id: '000000000000003', datetime: '20.08.26 / 13:00', amount: 1000, method: 'Google Pay',   status: 'error',   errorReason: 'Bank tərəfindən imtina edilib.' },
  { id: '000000000000004', datetime: '20.08.26 / 13:00', amount: 1000, method: 'Google Pay',   status: 'refunded' },
  { id: '000000000000005', datetime: '19.08.26 / 10:00', amount: 1000, method: 'Apple Pay',   status: 'success'  },
  { id: '000000000000006', datetime: '19.08.26 / 10:00', amount: 1000, method: 'Kapital Bank', status: 'pending'  },
  { id: '000000000000007', datetime: '18.08.26 / 09:00', amount: 1000, method: 'Google Pay',   status: 'error',   errorReason: 'Kartın balansı kifayət deyil.' },
  { id: '000000000000008', datetime: '18.08.26 / 09:00', amount: 1000, method: 'Apple Pay',   status: 'success'  },
  { id: '000000000000009', datetime: '17.08.26 / 15:00', amount: 1000, method: 'Kapital Bank', status: 'refunded' },
  { id: '000000000000010', datetime: '17.08.26 / 15:00', amount: 1000, method: 'Google Pay',   status: 'success'  },
]

// ── Subscription info ─────────────────────────────────────────────────────────
export interface SubscriptionInfo {
  tier: string
  plan: string
  price: number
  startDate: string
  nextPayment: string
  limitUsed: number
  limitTotal: number
  isFrozen: boolean
  daysLeft: number
}

export const MOCK_SUBSCRIPTION: SubscriptionInfo = {
  tier: 'Bronze',
  plan: '1 Aylıq',
  price: 165,
  startDate: '25 Dekabr 2026',
  nextPayment: '26 Yanvar 2026',
  limitUsed: 8,
  limitTotal: 20,
  isFrozen: false,
  daysLeft: 7,
}