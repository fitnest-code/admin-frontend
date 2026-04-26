'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MOCK_ACCESS_LOGS, ACCESS_SORT_OPTIONS,
  type AccessLog, type AccessResult,
} from '@/lib/customers-data'

const PAGE_SIZE = 5

const RESULT_BADGE: Record<AccessResult, string> = {
  approved: 'bg-green-600 text-white',
  rejected: 'bg-red-500 text-white',
}
const RESULT_LABEL: Record<AccessResult, string> = {
  approved: 'Təsdiqləndı',
  rejected: 'Rədd edildi',
}

export function AccessTab() {
  const [search, setSearch]   = useState('')
  const [sort,   setSort]     = useState('zal')
  const [sortOpen, setSortOpen] = useState(false)
  const [page,   setPage]     = useState(1)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered: AccessLog[] = MOCK_ACCESS_LOGS.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.gymName.toLowerCase().includes(q) ||
      l.platform.toLowerCase().includes(q) ||
      l.reason.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const currentSortLabel = ACCESS_SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sırala'

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış...."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Sort popover */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {currentSortLabel}
            <ChevronDown size={14} className={cn('transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <p className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">Sırala</p>
              {ACCESS_SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setSortOpen(false) }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  {o.label}
                  {sort === o.value && <Check size={13} className="text-[#00B4CC] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8F9FB] text-left">
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Tarix / Saat</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Zal Adı</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Nəticə</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Səbəb</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Platforma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  Heç bir giriş qeydi tapılmadı.
                </td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="bg-card hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.datetime}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.gymName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', RESULT_BADGE[row.result])}>
                    {RESULT_LABEL[row.result]}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.reason}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.platform}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  function pages(): (number | '...')[] {
    const result: (number | '...')[] = []
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) result.push(i)
    } else {
      result.push(1, 2, 3, 4)
      if (page > 5) result.push('...')
      if (page > 4 && page < totalPages - 1) result.push(page)
      result.push('...')
      result.push(totalPages)
    }
    return result
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {pages().map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-1 text-muted-foreground">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              page === p
                ? 'bg-[#00B4CC] text-white'
                : 'text-foreground hover:bg-secondary',
            )}
          >
            {p}
          </button>
        ),
      )}
    </div>
  )
}
