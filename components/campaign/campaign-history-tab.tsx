'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CampaignStatCards } from './campaign-stat-cards'
import { CampaignHistoryTable } from './campaign-history-table'
import {
  COIN_HISTORY_PAGE_SIZE,
  fetchCoinHistoryForExport,
  useCoinHistory,
  type CoinHistoryResponse,
  type CoinTransactionCategory,
  type CoinTransactionHistoryItem,
} from '@/lib/query/use-coin-history'

const FILTERS: CoinTransactionCategory[] = ['ALL', 'EARNED', 'SPENT', 'EXPIRED']

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function CampaignHistoryTab() {
  const t = useT()
  const c = t.campaign

  const [page, setPage] = useState(0)
  const [category, setCategory] = useState<CoinTransactionCategory>('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading, isFetching } = useCoinHistory(
    page,
    COIN_HISTORY_PAGE_SIZE,
    category,
    search,
  )

  const transactions = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / COIN_HISTORY_PAGE_SIZE))

  const handleSearch = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      setSearch(searchInput.trim())
      setPage(0)
    },
    [searchInput],
  )

  const handleCategoryChange = useCallback((next: CoinTransactionCategory) => {
    setCategory(next)
    setPage(0)
  }, [])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const result: CoinHistoryResponse = await fetchCoinHistoryForExport(category, search)
      const header = [
        c.table.id,
        c.detail.userId,
        c.table.customer,
        c.detail.phone,
        c.table.source,
        c.detail.operation,
        c.table.fitCoin,
        c.table.balance,
        c.detail.orderId,
        c.table.date,
      ]
      const rows = result.items.map((item: CoinTransactionHistoryItem) => [
        item.id,
        item.userId,
        item.userName ?? '',
        item.userPhone ?? '',
        item.sourceTitle ?? '',
        item.type,
        item.amount,
        item.balanceAfter,
        item.orderId ?? '',
        item.createdDate,
      ])
      const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
      // BOM keeps Azerbaijani characters readable in Excel.
      const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fitcoin-history-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [category, search, c])

  const filterLabel = (value: CoinTransactionCategory): string => {
    switch (value) {
      case 'EARNED':
        return c.filters.earned
      case 'SPENT':
        return c.filters.spent
      case 'EXPIRED':
        return c.filters.expired
      default:
        return c.filters.all
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-300">
      <CampaignStatCards />

      <div className="flex flex-col sm:flex-row gap-4 w-full items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:w-auto">
          <div className="w-full sm:w-[340px] h-12 px-5 bg-white rounded-xl border border-[#ECECED] flex items-center gap-3">
            <Image
              src="/admin-panel-icons/search-normal.svg"
              alt="search"
              width={22}
              height={22}
              className="object-contain flex-shrink-0"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={c.filters.searchPlaceholder}
              className="flex-1 bg-transparent text-black text-[14px] font-normal leading-[18px] placeholder:text-[#94979C] outline-none"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleCategoryChange(filter)}
              className={cn(
                'h-12 px-5 bg-white rounded-xl border flex items-center justify-center text-[15px] font-normal leading-[24px] transition-all',
                category === filter
                  ? 'border-[#00B4CC] bg-[rgba(0,180,204,0.1)] text-[#00B4CC]'
                  : 'border-[#ECECED] text-black hover:border-[#00B4CC]',
              )}
            >
              {filterLabel(filter)}
            </button>
          ))}

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="h-12 px-5 bg-white rounded-xl border border-[#ECECED] flex items-center justify-center gap-3 text-[15px] font-normal leading-[24px] text-black transition-all hover:border-[#00B4CC] disabled:opacity-50"
          >
            {c.filters.export}
            <Image
              src="/admin-panel-icons/arrow-down.svg"
              alt="export"
              width={18}
              height={18}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      <div className="w-full relative">
        {isLoading ? (
          <div className="w-full py-12 text-center text-[#8A9694] text-[16px]">{c.loading}</div>
        ) : (
          <>
            <CampaignHistoryTable transactions={transactions} />
            {isFetching && (
              <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-[#00B4CC]" />
            )}
          </>
        )}
      </div>

      <div className="w-full h-14 px-4 border border-[#E3E8E7] rounded-xl bg-white flex items-center justify-between">
        <span className="text-[#85918F] text-[14px] font-normal leading-[24px]">
          {c.footer.showing
            .replace('{count}', String(transactions.length))
            .replace('{total}', String(total))}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0 || isFetching}
            className="h-9 w-9 rounded-lg border border-[#DCE2E0] flex items-center justify-center disabled:opacity-40"
            aria-label={c.footer.prev}
          >
            <Image
              src="/admin-panel-icons/chevron-left.svg"
              alt={c.footer.prev}
              width={16}
              height={16}
            />
          </button>
          <span className="text-[#65726F] text-[14px] font-semibold leading-[24px] px-2">
            {c.footer.page.replace('{page}', String(page + 1)).replace('{pages}', String(totalPages))}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={page >= totalPages - 1 || isFetching}
            className="h-9 w-9 rounded-lg border border-[#DCE2E0] flex items-center justify-center disabled:opacity-40"
            aria-label={c.footer.next}
          >
            <Image
              src="/admin-panel-icons/chevron-right.svg"
              alt={c.footer.next}
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
