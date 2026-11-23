'use client'

import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import { freezeCustomerSubscription, getCustomerById, getCustomerCurrentSubscription, getCustomers, getSubscriptionPackageNames, getUserPaymentHistory, getUserQrHistory, getUserStatistics, hardDeleteUser, unfreezeCustomerSubscription, updateCustomerEntryLimit, type UpdateEntryLimitBody } from '@/modules/customers/api/customers.service'
import { useI18nStore } from '@/lib/i18n'
import type { GetCustomersParams } from '@/modules/customers/types/customer.types'

export function useCustomersQuery(params?: GetCustomersParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.customers.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getCustomers(params),
    // Keep prior page visible while the next page/sort loads (avoids full-table flash).
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnMount: true,
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

export function useUpdateEntryLimitMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateEntryLimitBody) => updateCustomerEntryLimit(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.subscription(userId) })
    },
  })
}

async function refreshCustomerStats(queryClient: ReturnType<typeof useQueryClient>) {
  // Bust user-backend Caffeine cache so "Dondurulmuş Status" updates immediately after freeze.
  await getUserStatistics(true)
  await queryClient.invalidateQueries({ queryKey: queryKeys.customers.statistics })
  await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
}

export function useFreezeCustomerSubscriptionMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (days: number) => freezeCustomerSubscription(userId, days),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.subscription(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.byId(userId) })
      await refreshCustomerStats(queryClient)
    },
  })
}

export function useUnfreezeCustomerSubscriptionMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => unfreezeCustomerSubscription(userId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.subscription(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.byId(userId) })
      await refreshCustomerStats(queryClient)
    },
  })
}

export function useHardDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => hardDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
    }
  })
}
