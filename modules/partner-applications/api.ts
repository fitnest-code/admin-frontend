import { apiGet, apiPatch } from '@/lib/api/client'
import type {
  PartnerLead,
  PartnerLeadFilterOptions,
  PartnerLeadListParams,
  PartnerLeadPage,
  PartnerLeadUpdateBody,
} from './types'

export function getPartnerLeads(params?: PartnerLeadListParams) {
  return apiGet<PartnerLeadPage>('/api/v1/admin/partner-applications', { params })
}

export function getPartnerLeadFilterOptions() {
  return apiGet<PartnerLeadFilterOptions>('/api/v1/admin/partner-applications/filter-options')
}

export function updatePartnerLead(id: number, body: PartnerLeadUpdateBody) {
  return apiPatch<PartnerLead>(`/api/v1/admin/partner-applications/${id}`, body)
}
