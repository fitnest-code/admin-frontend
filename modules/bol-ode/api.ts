import { apiGet, apiPatch } from '@/lib/api/client'
import type {
  BolOdeDetail,
  BolOdeHistoryEntry,
  BolOdeListItem,
  BolOdeListParams,
  BolOdeUpdateBody,
  SpringPage,
} from './types'

// Full /api/... path so the client skips its /api/v1 prefixing; proxied by the existing BFF.
const BASE = '/api/v1/admin/bol-ode'

export function getBolOdeList(params?: BolOdeListParams) {
  return apiGet<SpringPage<BolOdeListItem>>(BASE, { params })
}

export function getBolOde(id: string | number) {
  return apiGet<BolOdeDetail>(`${BASE}/${id}`)
}

export function getBolOdeHistory(id: string | number) {
  return apiGet<BolOdeHistoryEntry[]>(`${BASE}/${id}/history`)
}

export function updateBolOde(id: string | number, body: BolOdeUpdateBody) {
  return apiPatch<BolOdeDetail>(`${BASE}/${id}`, body)
}
