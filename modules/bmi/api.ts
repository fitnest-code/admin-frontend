import { apiGet, apiPatch } from '@/lib/api/client'
import type {
  BmiLead,
  BmiLeadFilterOptions,
  BmiLeadListParams,
  BmiLeadPage,
  BmiLeadUpdateBody,
} from './types'

export function getBmiLeads(params?: BmiLeadListParams) {
  return apiGet<BmiLeadPage>('/api/v1/admin/bmi-requests', { params })
}

export function getBmiLeadFilterOptions() {
  return apiGet<BmiLeadFilterOptions>('/api/v1/admin/bmi-requests/filter-options')
}

export function updateBmiLead(id: number, body: BmiLeadUpdateBody) {
  return apiPatch<BmiLead>(`/api/v1/admin/bmi-requests/${id}`, body)
}
