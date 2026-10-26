'use client'

import { useState, useCallback } from 'react'
import { useT } from '@/lib/i18n'
import {
  useCoinHistory,
  type CoinTransactionCategory,
  type CoinTransactionHistoryItem,
} from '@/lib/query/use-coin-history'
import { CampaignStatCards } from './campaign-stat-cards'
import { CampaignHistoryTable } from './campaign-history-table'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 5

export function CampaignHistoryTab() {
  const t = useT()
  const c = t.campaign

  const [page, setPage] = useState(0)
  const [category, setCategory] = useState<CoinTransactionCategory>('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading, isFetching, refetch } = useCoinHistory(page, PAGE_SIZE, category, search)

  const transactions: CoinTransactionHistoryItem[] = data?.items ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(0)
  }, [searchInput])

  const handleCategoryChange = useCallback((cat: CoinTransactionCategory) => {
    setCategory(cat)
    setPage(0)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const filterButtons: { value: CoinTransactionCategory; label: string }[] = [
    { value: 'ALL', label: c.filters.all },
    { value: 'EARNED', label: c.filters.earned },
    { value: 'SPENT', label: c.filters.spent },
  ]

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-300">
      {/* Stat Cards */}
      <CampaignStatCards />

      {/* Search + Filters + Export */}
      <div className="flex flex-col sm:flex-row gap-4 w-full items-start sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:w-auto">
          <div className="w-full sm:w-[320px] h-12 px-6 bg-white rounded-xl border border-[#ECECED] flex items-center gap-3">
            <Image
              src="/admin-panel-icons/search-normal.svg"
              alt="search"
              width={24}
              height={24}
              className="object-contain flex-shrink-0"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={c.filters.searchPlaceholder}
              className="flex-1 bg-transparent text-black text-[14px] font-normal leading-[18px] placeholder:text-[#94979C] outline-none"
            />
          </div>
        </form>

        <div className="flex gap-3 w-full sm:w-auto">
          {filterButtons.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleCategoryChange(filter.value)}
              className={cn(
                'h-12 px-6 bg-white rounded-xl border flex items-center justify-center gap-3 text-[16px] font-normal leading-[24px] transition-all',
                category === filter.value
                  ? 'border-[#00B4CC] bg-[rgba(0,180,204,0.1)] text-[#00B4CC]'
                  : 'border-[#ECECED] text-black hover:border-[#00B4CC]',
              )}
            >
              {filter.label}
            </button>
          ))}

          <button
            type="button"
            className="h-12 px-6 bg-white rounded-xl border border-[#ECECED] flex items-center justify-center gap-3 text-[16px] font-normal leading-[24px] text-black hover:border-[#00B4CC] transition-all"
          >
            {c.filters.export}
            <Image
              src="/admin-panel-icons/arrow-down.svg"
              alt="export"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="w-full">
        {isLoading ? (
          <div className="w-full py-12 text-center text-[#8A9694] text-[16px]">
            {c.loading}
          </div>
        ) : (
          <CampaignHistoryTable transactions={transactions} />
        )}
      </div>

      {/* Footer */}
      <div className="w-full h-14 min-h-[53px] px-6 border-t border-[#E3E8E7] bg-white flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[#85918F] text-[16px] font-normal leading-[24px] font-sans">
            {c.footer.showing.replace('{count}', String(transactions.length))}
          </span>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-white rounded-lg border border-[#DCE2E0] flex items-center gap-2"
        >
          <span className="text-[#65726F] text-[16px] font-semibold leading-[24px] font-sans">
            {c.footer.viewAll}
          </span>
          <Image
            src="/admin-panel-icons/Icon.svg"
            alt="arrow"
            width={16}
            height={16}
            className="object-contain"
          />
        </button>
      </div>
    </div>
  )
}