'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import {
  fetchCustomerGrowth,
  fetchDashboardV2Summary,
  fetchIncomeReport,
  fetchKpiSummary,
  fetchQrScans,
} from './api'
import type { DashboardPeriod } from './period'

export function useDashboardKpiSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.kpiSummary(),
    queryFn: fetchKpiSummary,
    staleTime: 60_000,
  })
}

export function useDashboardQrScansQuery(period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.qrScans(period),
    queryFn: () => fetchQrScans(period),
    staleTime: 60_000,
  })
}

export function useDashboardIncomeQuery(period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.income(period),
    queryFn: () => fetchIncomeReport(period),
    staleTime: 60_000,
  })
}

export function useDashboardCustomerGrowthQuery(period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.customerGrowth(period),
    queryFn: () => fetchCustomerGrowth(period),
    staleTime: 60_000,
  })
}

export function useDashboardV2SummaryQuery(period: DashboardPeriod) {
  return useQuery({
    queryKey: queryKeys.dashboard.v2Summary(period),
    queryFn: () => fetchDashboardV2Summary(period),
    staleTime: 60_000,
  })
}