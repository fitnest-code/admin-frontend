import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api/client'

export type CoinTransactionCategory = 'ALL' | 'EARNED' | 'SPENT' | 'EXPIRED'

export interface CoinTransactionHistoryItem {
  id: number
  userId: number
  userName: string | null
  userPhone: string | null
  type: string
  refundAction: string | null
  sourceType: string
  sourceTitle: string
  amount: string
  balanceAfter: string
  orderId: string | null
  createdDate: string
}

export interface CoinHistoryResponse {
  items: CoinTransactionHistoryItem[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

export function useCoinHistory(
  page: number = 0,
  size: number = 5,
  category: CoinTransactionCategory = 'ALL',
  search: string = '',
) {
  return useQuery({
    queryKey: ['coin-history', page, size, category, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('size', String(size))
      if (category !== 'ALL') params.set('category', category)
      if (search.trim()) params.set('search', search.trim())

      const response = await apiGet<CoinHistoryResponse>(`/api/v1/admin/coins/history?${params.toString()}`)
      return response
    },
    placeholderData: (previousData) => previousData,
  })
}