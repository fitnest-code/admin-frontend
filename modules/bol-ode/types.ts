export type BolOdeStatus = 'NEW' | 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'DECLINED' | 'CANCELLED'

export const BOL_ODE_STATUSES: BolOdeStatus[] = [
  'NEW',
  'PENDING',
  'IN_REVIEW',
  'APPROVED',
  'DECLINED',
  'CANCELLED',
]

// Statuses where the customer-facing wait countdown is still meaningful.
export const BOL_ODE_WAITING_STATUSES: BolOdeStatus[] = ['NEW', 'PENDING', 'IN_REVIEW']

/** Spring Data `Page` envelope as serialized by payment-backend. */
export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface BolOdeListItem {
  id: number
  displayId: string
  userId: number | null
  maskedFin: string | null
  contactPhone: string | null
  packageName: string | null
  durationMonths: number | null
  finalAmount: number | null
  status: BolOdeStatus
  assignedAdminUserId: number | null
  waitRemainingSeconds: number | null
  createdAt: string
  updatedAt: string | null
}

export interface BolOdeDetail {
  id: number
  displayId: string
  paymentId: number | null
  paymentReference: string | null
  userId: number | null
  finCode: string | null
  birthDate: string | null
  contactPhone: string | null
  extraPhone1: string | null
  extraPhone2: string | null
  birbankConsentAccepted: boolean
  mygovConsentAccepted: boolean
  packageId: number | null
  optionId: number | null
  packageName: string | null
  durationMonths: number | null
  finalAmount: number | null
  status: BolOdeStatus
  declineReason: string | null
  declineReasonVisibleToCustomer: boolean
  assignedAdminUserId: number | null
  internalNote: string | null
  waitRemainingSeconds: number | null
  createdAt: string
  updatedAt: string | null
}

export interface BolOdeHistoryEntry {
  id: number
  actorType: string | null
  actorUserId: number | null
  fromStatus: BolOdeStatus | null
  toStatus: BolOdeStatus | null
  message: string | null
  declineReason: string | null
  createdAt: string
}

export interface BolOdeListParams {
  status?: BolOdeStatus
  q?: string
  page?: number
  size?: number
}

export interface BolOdeUpdateBody {
  status?: BolOdeStatus
  assignedAdminUserId?: number
  declineReason?: string
  declineReasonVisibleToCustomer?: boolean
  internalNote?: string
}
