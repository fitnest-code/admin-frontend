export type PartnerLeadStatus =
  | 'NEW'
  | 'CONTACTED_WAITING'
  | 'REJECTED'
  | 'AWAITING_DETAILS'
  | 'APPROVED'
  | 'CONTRACT_SIGNED'

export interface PartnerLead {
  id: number
  createdAt: string
  gymName: string
  contactName: string
  phone: string
  email: string | null
  activity: string
  status: PartnerLeadStatus
  assigneeUserId: number | null
  assigneeName: string | null
  lastContactAt: string | null
}

export interface PartnerLeadPage {
  items: PartnerLead[]
  total: number
  page: number
  pageSize: number
}

export interface PartnerLeadFilterOptions {
  activities: { value: string; label: string }[]
  assignees: { id: number; name: string }[]
}

export interface PartnerLeadListParams {
  page?: number
  size?: number
  search?: string
  status?: PartnerLeadStatus
  activity?: string
  assignee?: string
  from?: string
  to?: string
}

export interface PartnerLeadUpdateBody {
  status?: PartnerLeadStatus
  assigneeUserId?: number
  assigneeName?: string
  unassign?: boolean
  touched?: boolean
}
