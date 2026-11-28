import { apiGet } from '@/lib/api/client'
import type {
  CustomerGrowthResponse,
  IncomeReportResponse,
  KpiSummaryResponse,
  QrScansReportResponse,
} from './types'
import {
  getDateRangeForPeriod,
  toApiPeriod,
  type DashboardPeriod,
} from './period'

export function fetchKpiSummary() {
  return apiGet<KpiSummaryResponse>('/admin/dashboard/kpi-summary')
}

export function fetchQrScans(period: DashboardPeriod) {
  const { startDate, endDate } = getDateRangeForPeriod(period)
  return apiGet<QrScansReportResponse>('/admin/reports/qr-scans', {
    params: { startDate, endDate },
  })
}

export function fetchIncomeReport(period: DashboardPeriod) {
  const { startDate, endDate } = getDateRangeForPeriod(period)
  return apiGet<IncomeReportResponse>('/admin/reports/income', {
    params: { startDate, endDate },
  })
}

export function fetchCustomerGrowth(period: DashboardPeriod) {
  return apiGet<CustomerGrowthResponse>('/admin/dashboard/customer-growth', {
    params: { period: toApiPeriod(period) },
  })
}