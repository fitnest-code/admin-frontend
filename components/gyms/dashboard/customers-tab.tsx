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

export function CustomersTab() {
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
    <div className="flex flex-col gap-6 py-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-4">
        <div className="text-[20px] font-semibold text-[#101828] font-['SF_Pro']">Müştəri girişləri</div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 h-12 bg-white rounded-xl border border-[#ececed] flex items-center px-4 gap-3">
            <Image src="/search.svg" width={24} height={24} alt="search" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Axtar..."
              className="flex-1 bg-transparent text-[14px] text-[#94979c] outline-none placeholder:text-[#94979c]"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="h-12 px-4 rounded-xl border border-[#ececed] bg-white flex items-center gap-2 text-[14px] font-medium text-[#101828] hover:border-[#00B4CC] transition-colors"
            >
              <Image src="/filter.png" width={20} height={20} alt="filter" />
              Filter
              <ChevronDown size={16} className={cn('transition-transform text-[#667085]', filterOpen && 'rotate-180')} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#ececed] overflow-hidden animate-in fade-in zoom-in duration-150">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilter(opt.value)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-[14px]"
                  >
                    <span className={cn(filter === opt.value ? "text-[#00B4CC] font-semibold" : "text-[#344054]")}>{opt.label}</span>
                    {filter === opt.value && <Check size={16} className="text-[#00B4CC]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="h-12 px-4 rounded-xl border border-[#ececed] bg-white flex items-center gap-2 text-[14px] font-medium text-[#101828] hover:border-[#00B4CC] transition-colors"
            >
              <Image src="/sort.png" width={20} height={20} alt="sort" />
              Sırala
              <ChevronDown size={16} className={cn('transition-transform text-[#667085]', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#ececed] overflow-hidden animate-in fade-in zoom-in duration-150">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-[14px]"
                  >
                    <span className={cn(sort === opt.value ? "text-[#00B4CC] font-semibold" : "text-[#344054]")}>{opt.label}</span>
                    {sort === opt.value && <Check size={16} className="text-[#00B4CC]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#ececed]">
          <Image src="/empty-state.png" width={120} height={120} alt="no results" className="opacity-20" />
          <div className="mt-4 text-[16px] text-[#667085]">Nəticə tapılmadı</div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl border border-[#ececed] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_180px_180px_120px_100px_100px] items-center gap-4 bg-[#00B4CC14] border-b border-[#ececed] px-6 py-4">
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">ID</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">Ad / Soyad</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">Telefon</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">Tarix / Saat</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro'] text-center">Giriş məbləği</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">Nəticə</span>
            <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro'] text-center">Səbəb</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {paginated.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[80px_1fr_180px_180px_120px_100px_100px] items-center gap-4 border-b border-[#f2f4f7] px-6 py-4 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <span className="text-[14px] text-[#667085] font-medium">{entry.customerId}</span>
                <span className="text-[14px] font-semibold text-[#101828] font-['SF_Pro']">{entry.fullName}</span>
                <span className="text-[14px] text-[#667085] font-medium">{entry.phone}</span>
                <span className="text-[14px] text-[#667085] font-medium">{entry.datetime}</span>
                <span className="text-[14px] text-[#667085] font-medium text-center">0.00 AZN</span>
                <div className="flex">
                  <div className={cn(
                    "flex items-center px-2 py-1 rounded-full gap-1.5",
                    entry.result === 'success' ? "bg-green-50" : "bg-red-50"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", entry.result === 'success' ? "bg-green-600" : "bg-red-600")} />
                    <span className={cn("text-[12px] font-semibold", entry.result === 'success' ? "text-green-700" : "text-red-700")}>
                      {RESULT_LABELS[entry.result]}
                    </span>
                  </div>
                </div>
                <span className="text-[14px] text-[#667085] font-medium text-center">{entry.reason}</span>
              </div>
            ))}
          </div>
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
