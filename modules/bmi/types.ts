export type BmiLeadStatus = 'NEW' | 'CONTACTING' | 'CONTACTED' | 'CONVERTED' | 'CLOSED'

export interface BmiLead {
  id: number
  createdAt: string
  phone: string
  goalCode: string
  goalTitle: string
  bmi: number
  status: BmiLeadStatus
  assigneeUserId: number | null
  assigneeName: string | null
  lastContactAt: string | null
  age?: number | null
  gender?: string | null
  heightCm?: number | null
  weightKg?: number | null
}

export interface BmiLeadPage {
  items: BmiLead[]
  total: number
  page: number
  pageSize: number
}

export interface BmiLeadFilterOptions {
  goals: { code: string; title: string }[]
  assignees: { id: number; name: string }[]
}

export interface BmiLeadListParams {
  page?: number
  size?: number
  search?: string
  status?: BmiLeadStatus
  goalCode?: string
  assignee?: string
  from?: string
  to?: string
}

export interface BmiLeadUpdateBody {
  status?: BmiLeadStatus
  assigneeUserId?: number
  assigneeName?: string
  unassign?: boolean
  touched?: boolean
}
