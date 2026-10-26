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
  amount: string | number
  balanceAfter: string | number
  orderId: string | null
  createdDate: string
}

export interface CoinHistoryResponse {
  items: CoinTransactionHistoryItem[]
  /** Total rows matching the current filter/search (server-side paging). */
  total: number
  /** 1-based page number returned by the API. */
  page: number
  pageSize: number
}

export interface CoinHistorySummary {
  totalEarned: number
  totalSpent: number
  totalExpired: number
  totalTransactions: number
  activeWallets: number
  totalWallets: number
}

export const COIN_HISTORY_PAGE_SIZE = 10
export const COIN_HISTORY_EXPORT_LIMIT = 500

function buildHistoryQuery(
  page: number,
  size: number,
  category: CoinTransactionCategory,
  search: string,
): string {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (category !== 'ALL') params.set('category', category)
  if (search.trim()) params.set('search', search.trim())
  return `/api/v2/admin/coins/history?${params.toString()}`
}

export function useCoinHistory(
  page: number = 0,
  size: number = COIN_HISTORY_PAGE_SIZE,
  category: CoinTransactionCategory = 'ALL',
  search: string = '',
) {
  return useQuery({
    queryKey: ['coin-history', page, size, category, search],
    queryFn: () => apiGet<CoinHistoryResponse>(buildHistoryQuery(page, size, category, search)),
    placeholderData: (previousData) => previousData,
  })
}

/** Ledger-wide totals for the dashboard cards. Not affected by table filters. */
export function useCoinHistorySummary() {
  return useQuery({
    queryKey: ['coin-history-summary'],
    queryFn: () => apiGet<CoinHistorySummary>('/api/v2/admin/coins/history/summary'),
    staleTime: 60_000,
  })
}

/** Bounded, one-shot fetch used by the CSV export (never paginated through the UI). */
export function fetchCoinHistoryForExport(
  category: CoinTransactionCategory,
  search: string,
): Promise<CoinHistoryResponse> {
  return apiGet<CoinHistoryResponse>(
    buildHistoryQuery(0, COIN_HISTORY_EXPORT_LIMIT, category, search),
  )
}
