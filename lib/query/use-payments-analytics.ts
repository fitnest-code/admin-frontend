'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/api/client'

export interface PaymentsAnalyticsResponse {
  accumulatedAmount: number
  totalPaymentsAmount: number
  totalPaymentsCount: number
  paymentsTrendPct: number
  isPaymentsPositive: boolean
  totalTransfersAmount: number
  totalTransfersCount: number
  transfersTrendPct: number
  isTransfersPositive: boolean
  operationLogsCount: number
  operationLogsTrendPct: number
  isOperationLogsPositive: boolean
  paymentTrendPoints?: number[]
  operationLogsTrendPoints?: number[]
}

export interface TransferRequestPayload {
  amount: number
}

export interface TransferRequestResponse {
  requestId: string
  amount: number
  commission: number
  netAmount: number
  status: string
  createdAt: string
}

export interface PaymentRecordResponse {
  paymentId: number
  amount: number
  currency: string
  occurredAt?: string
  cardBrand?: string
  maskedPan?: string
  type?: string
  status?: string
  failureCode?: string
  transactionId?: string
  owner?: string
  description?: string
}

export function usePaymentsAnalytics() {
  return useQuery<PaymentsAnalyticsResponse>({
    queryKey: ['admin', 'payments', 'analytics'],
    queryFn: async () => {
      return apiRequest<PaymentsAnalyticsResponse>('/api/v1/admin/reports/analytics')
    },
    staleTime: 60 * 1000,
  })
}

export function useAdminPaymentsHistory() {
  return useQuery<PaymentRecordResponse[]>({
    queryKey: ['admin', 'payments', 'history'],
    queryFn: async () => {
      return apiRequest<PaymentRecordResponse[]>('/api/v1/admin/payments')
    },
    staleTime: 30 * 1000,
  })
}

export function useRequestTransfer() {
  const queryClient = useQueryClient()
  return useMutation<TransferRequestResponse, Error, TransferRequestPayload>({
    mutationFn: async (payload) => {
      return apiRequest<TransferRequestResponse>('/api/v1/admin/transfers/request', {
        method: 'POST',
        body: payload,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'analytics'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments', 'history'] })
    },
  })
}
