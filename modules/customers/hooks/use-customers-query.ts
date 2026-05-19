'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { getCustomerById, getCustomerCurrentSubscription, getCustomers, getSubscriptionPackageNames, getUserPaymentHistory, getUserQrHistory, getUserStatistics } from '@/modules/customers/api/customers.service'
import { useI18nStore } from '@/lib/i18n'
import type { GetCustomersParams } from '@/modules/customers/types/customer.types'

export function useCustomersQuery(params?: GetCustomersParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getCustomers(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useSubscriptionPackageNamesQuery() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.packageNames, locale],
    queryFn: getSubscriptionPackageNames,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerQuery(id: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.byId(id), locale],
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useUserStatisticsQuery() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.statistics, locale],
    queryFn: getUserStatistics,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerQrHistoryQuery(userId: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.qrHistory(userId), locale],
    queryFn: () => getUserQrHistory(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerPaymentsQuery(userId: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.payments(userId), locale],
    queryFn: () => getUserPaymentHistory(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCustomerCurrentSubscriptionQuery(userId: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.subscription(userId), locale],
    queryFn: () => getCustomerCurrentSubscription(userId),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
