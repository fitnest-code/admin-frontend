import { apiGet } from '@/lib/api/client'
import type {
  CustomerGrowthResponse,
  DashboardV2CustomerPage,
  DashboardV2SummaryResponse,
  IncomeReportResponse,
  KpiSummaryResponse,
  QrScansReportResponse,
} from './types'
import {
  getDateRangeForPeriod,
  getLocalDateRangeForPeriod,
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

/** Parallel Dashboard V2 BFF summary (income / obligations / subscriptions / top gyms). */
export function fetchDashboardV2Summary(period: DashboardPeriod) {
  const { dateFrom, dateTo } = getLocalDateRangeForPeriod(period)
  return apiGet<DashboardV2SummaryResponse>('/admin/dashboard/summary', {
    params: { dateFrom, dateTo },
  })
}

export function fetchDashboardV2Customers(params: {
  page?: number
  size?: number
  packageId?: number
  subscriptionStatus?: string
  search?: string
  platform?: string
  registrationFrom?: string
  registrationTo?: string
  purchaseFrom?: string
  purchaseTo?: string
}) {
  return apiGet<DashboardV2CustomerPage>('/admin/dashboard/customers', {
    params,
  })
}