'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getCustomerById, getCustomerCurrentSubscription, getCustomers, getSubscriptionPackageNames, getUserPaymentHistory, getUserQrHistory, getUserStatistics } from '@/modules/customers/api/customers.service'
import type { GetCustomersParams } from '@/modules/customers/types/customer.types'

export function useCustomersQuery(params?: GetCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params as Record<string, unknown> | undefined),
    queryFn: () => getCustomers(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useSubscriptionPackageNamesQuery() {
  return useQuery({
    queryKey: queryKeys.customers.packageNames,
    queryFn: getSubscriptionPackageNames,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.byId(id),
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useUserStatisticsQuery() {
  return useQuery({
    queryKey: queryKeys.customers.statistics,
    queryFn: getUserStatistics,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerQrHistoryQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.customers.qrHistory(userId),
    queryFn: () => getUserQrHistory(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerPaymentsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.customers.payments(userId),
    queryFn: () => getUserPaymentHistory(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerCurrentSubscriptionQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.customers.subscription(userId),
    queryFn: () => getCustomerCurrentSubscription(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
