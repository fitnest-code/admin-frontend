'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
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
]

const FILTER_OPTIONS: { label: string; value: EntryResult | 'all' }[] = [
  { label: 'Bütün statuslar',  value: 'all'     },
  { label: 'Uğurlu', value: 'success'  },
  { label: 'Xəta',   value: 'error'    },
]

const SORT_OPTIONS = [
  { label: 'Tarix: Yeni → Köhnə', value: 'date_desc' },
  { label: 'Tarix: Köhnə → Yeni', value: 'date_asc'  },
]

const PAGE_SIZE = 10

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleQueryChange(v: string) { setQuery(v); setPage(1) }
  function handleFilter(v: EntryResult | 'all') { setFilter(v); setPage(1); setFilterOpen(false) }

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col p-5 gap-6 font-sans shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="text-[18px] font-bold text-black">Müştəri girişləri</div>
        
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Search Bar */}
          <div className="flex-1 w-full lg:w-[527px] h-10 bg-white rounded-lg border border-[#ececed] flex items-center px-4 py-1 gap-3 shadow-sm focus-within:border-[#00B4CC] transition-colors">
            <Image src="/search.svg" width={20} height={20} alt="search" className="opacity-50" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Axtar..."
              className="flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#94979c]"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="h-10 w-[180px] px-4 rounded-lg border border-[#ececed] bg-white flex items-center justify-between text-[13px] font-medium text-[#101828] hover:border-[#00B4CC] transition-all shadow-sm"
              >
                <span>{FILTER_OPTIONS.find(o => o.value === filter)?.label || 'Filter'}</span>
                <ChevronDown size={16} className={cn('transition-transform text-slate-400', filterOpen && 'rotate-180')} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilter(opt.value)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-[14px]"
                    >
                      <span className={cn(filter === opt.value ? "text-[#00B4CC] font-bold" : "text-slate-600")}>{opt.label}</span>
                      {filter === opt.value && <Check size={16} className="text-[#00B4CC]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="h-10 w-[180px] px-4 rounded-lg border border-[#ececed] bg-white flex items-center justify-between text-[13px] font-medium text-[#101828] hover:border-[#00B4CC] transition-all shadow-sm"
              >
                <span>{sort === 'date_desc' ? 'Yeni-Köhnə' : 'Köhnə-Yeni'}</span>
                <ChevronDown size={16} className={cn('transition-transform text-slate-400', sortOpen && 'rotate-180')} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <button onClick={() => { setSort('date_desc'); setSortOpen(false); }} className="w-full px-5 py-3 text-left hover:bg-slate-50 text-[14px]">Yeni-Köhnə</button>
                  <button onClick={() => { setSort('date_asc'); setSortOpen(false); }} className="w-full px-5 py-3 text-left hover:bg-slate-50 text-[14px]">Köhnə-Yeni</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-[12px] border border-[#cecfd2]">
        <div className="min-w-[1000px] flex flex-col bg-white">
          {/* Header */}
          <div className="w-full h-[48px] bg-[rgba(0,180,204,0.1)] flex items-center px-[20px] gap-[48px] text-[14px] font-bold text-[#101828]">
            <div className="w-[71px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">ID</div>
            <div className="w-[110px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Ad / Soyad</div>
            <div className="w-[150px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Telefon</div>
            <div className="w-[111px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Tarix / Saat</div>
            <div className="w-[120px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider text-center">Giriş məbləği</div>
            <div className="w-[73px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider text-center">Nəticə</div>
            <div className="w-[60px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider text-center">Səbəb</div>
          </div>

          <div className="flex flex-col bg-white divide-y divide-[#ececed]">
            {paginated.map((entry) => {
              const s = entry.result?.toString().toUpperCase() || '';
              const isSuccess = s === 'SUCCESS' || s === 'SUCCESSFUL' || s === 'ELIGIBLE' || s === 'UĞURLU' || s === 'UGURLU';
              const [date, time] = entry.datetime.split(' / ');

              return (
                <div key={entry.id} className="w-full h-[64px] flex items-center px-[20px] gap-[48px] text-[14px] hover:bg-slate-50 transition-colors group">
                  <div className="w-[71px] shrink-0 text-slate-400 font-medium">#{entry.id}</div>
                  <div className="w-[110px] shrink-0 font-bold text-[#101828] group-hover:text-[#00B4CC] transition-colors truncate">{entry.fullName}</div>
                  <div className="w-[150px] shrink-0 text-slate-600 font-medium">{entry.phone}</div>
                  <div className="w-[111px] shrink-0 flex flex-col justify-center">
                    <span className="font-bold text-slate-700">{date}</span>
                    <span className="text-[14px] text-slate-400">{time}</span>
                  </div>
                  <div className="w-[120px] shrink-0 font-bold text-[#101828] text-center">60 AZN</div>
                  <div className="w-[73px] shrink-0 flex justify-center">
                    <div className={cn(
                      "h-[26px] w-[73px] rounded-[20px] flex items-center justify-center gap-1.5 px-3 text-[12px] font-bold text-white shadow-xs",
                      isSuccess ? "bg-[#166728]" : "bg-[#c9373a]"
                    )}>
                      <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                      <span className="uppercase tracking-tight text-[10px]">{isSuccess ? 'Uğurlu' : 'Xəta'}</span>
                    </div>
                  </div>
                  <div className="w-[60px] shrink-0 text-center text-slate-400 font-medium truncate">
                    {isSuccess ? (
                      <div className="flex justify-center">
                         <div className="h-[1.5px] w-[18px] bg-[#cecfd2]" />
                      </div>
                    ) : entry.reason || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center gap-[18px] py-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "h-8 w-8 rounded-[4px] flex items-center justify-center text-[16px] font-semibold transition-all",
                page === p 
                  ? "bg-[#00B4CC] text-white shadow-md" 
                  : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
