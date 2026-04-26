'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
type EntryResult = 'success' | 'error'

interface GymCustomerEntry {
  id: string
  customerId: string
  fullName: string
  phone: string
  datetime: string
  result: EntryResult
  reason: string
}

const MOCK_ENTRIES: GymCustomerEntry[] = [
  { id: 'e1',  customerId: '0000000', fullName: 'Ramil Babayev',   phone: '+994 00 000 00 00', datetime: '24 fevral 2025 / 21:00', result: 'success', reason: '—'       },
  { id: 'e2',  customerId: '0000000', fullName: 'Orxan Nəbiyev',   phone: '+994 00 000 00 00', datetime: '24 fevral 2025 / 21:00', result: 'error',   reason: 'İnternet' },
  { id: 'e3',  customerId: '0000000', fullName: 'Leyla Hüseynova', phone: '+994 00 000 00 00', datetime: '23 fevral 2025 / 18:00', result: 'success', reason: '—'       },
  { id: 'e4',  customerId: '0000000', fullName: 'Kamran Əliyev',   phone: '+994 00 000 00 00', datetime: '23 fevral 2025 / 18:00', result: 'error',   reason: 'Müddəti bitib' },
  { id: 'e5',  customerId: '0000000', fullName: 'Aytən Quliyeva',  phone: '+994 00 000 00 00', datetime: '22 fevral 2025 / 10:00', result: 'success', reason: '—'       },
  { id: 'e6',  customerId: '0000000', fullName: 'Fərid Məmmədov',  phone: '+994 00 000 00 00', datetime: '22 fevral 2025 / 10:00', result: 'error',   reason: 'Limit dolub' },
  { id: 'e7',  customerId: '0000000', fullName: 'Günel Nəsirov',   phone: '+994 00 000 00 00', datetime: '21 fevral 2025 / 09:30', result: 'success', reason: '—'       },
  { id: 'e8',  customerId: '0000000', fullName: 'Elnur Rəsulzadə', phone: '+994 00 000 00 00', datetime: '21 fevral 2025 / 09:30', result: 'error',   reason: 'Yanlış zal' },
  { id: 'e9',  customerId: '0000000', fullName: 'Səbinə Cabbarova', phone: '+994 00 000 00 00', datetime: '20 fevral 2025 / 15:00', result: 'success', reason: '—'      },
  { id: 'e10', customerId: '0000000', fullName: 'Murad İsmayılov', phone: '+994 00 000 00 00', datetime: '20 fevral 2025 / 15:00', result: 'success', reason: '—'       },
  { id: 'e11', customerId: '0000000', fullName: 'Nigar Tağıyeva',  phone: '+994 00 000 00 00', datetime: '19 fevral 2025 / 12:00', result: 'error',   reason: 'İnternet' },
  { id: 'e12', customerId: '0000000', fullName: 'Tural Həsənov',   phone: '+994 00 000 00 00', datetime: '19 fevral 2025 / 12:00', result: 'success', reason: '—'       },
]

const FILTER_OPTIONS: { label: string; value: EntryResult | 'all' }[] = [
  { label: 'Hamısı',  value: 'all'     },
  { label: 'Uğurlu', value: 'success'  },
  { label: 'Xəta',   value: 'error'    },
]

const SORT_OPTIONS = [
  { label: 'Tarix: Yeni → Köhnə', value: 'date_desc' },
  { label: 'Tarix: Köhnə → Yeni', value: 'date_asc'  },
  { label: 'Ad: A-Z',             value: 'name_az'   },
  { label: 'Ad: Z-A',             value: 'name_za'   },
]

const PAGE_SIZE = 5

const RESULT_STYLES: Record<EntryResult, string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-500  text-white',
}

const RESULT_LABELS: Record<EntryResult, string> = {
  success: 'Uğurlu',
  error:   'Xəta',
}

export function GymCustomersTab() {
  const [query,      setQuery]      = useState('')
  const [filter,     setFilter]     = useState<EntryResult | 'all'>('all')
  const [sort,       setSort]       = useState('date_desc')
  const [page,       setPage]       = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen,   setSortOpen]   = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)
  const sortRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
      if (sortRef.current   && !sortRef.current.contains(e.target as Node))   setSortOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Filter + sort
  const filtered = MOCK_ENTRIES
    .filter((e) => {
      if (filter !== 'all' && e.result !== filter) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          e.fullName.toLowerCase().includes(q) ||
          e.customerId.includes(q) ||
          e.phone.includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'name_az') return a.fullName.localeCompare(b.fullName)
      if (sort === 'name_za') return b.fullName.localeCompare(a.fullName)
      return 0 // date order is mock order
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleQueryChange(v: string) { setQuery(v); setPage(1) }
  function handleFilter(v: EntryResult | 'all') { setFilter(v); setPage(1); setFilterOpen(false) }
  function handleSort(v: string)   { setSort(v); setPage(1); setSortOpen(false) }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış...."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-[#00B4CC] transition-colors"
          >
            Filter <ChevronDown size={14} className={cn('transition-transform', filterOpen && 'rotate-180')} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilter(opt.value)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
                >
                  {filter === opt.value && <Check size={13} className="text-[#00B4CC]" />}
                  <span className={cn('text-foreground', filter !== opt.value && 'pl-5')}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-[#00B4CC] transition-colors"
          >
            Sırala <ChevronDown size={14} className={cn('transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
                >
                  {sort === opt.value && <Check size={13} className="text-[#00B4CC]" />}
                  <span className={cn('text-foreground', sort !== opt.value && 'pl-5')}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          Nəticə tapılmadı
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3">
            <span className="text-xs font-semibold text-foreground">ID</span>
            <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
            <span className="text-xs font-semibold text-foreground">Telefon</span>
            <span className="text-xs font-semibold text-foreground">Tarix / Saat</span>
            <span className="text-xs font-semibold text-foreground">Nəticə</span>
            <span className="text-xs font-semibold text-foreground">Səbəb</span>
          </div>

          {/* Rows */}
          {paginated.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_1.5fr_1.5fr_1.5fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3.5 last:border-0"
            >
              <span className="text-sm text-muted-foreground font-mono">{entry.customerId}</span>
              <span className="text-sm font-medium text-foreground">{entry.fullName}</span>
              <span className="text-sm text-muted-foreground">{entry.phone}</span>
              <span className="text-sm text-muted-foreground">{entry.datetime}</span>
              <span>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', RESULT_STYLES[entry.result])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  {RESULT_LABELS[entry.result]}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{entry.reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination total={filtered.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ total, page, perPage, onChange }: {
  total: number; page: number; perPage: number; onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`el-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {p}
          </button>
        ),
      )}
    </div>
  )
}
