'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Check, MoreVertical, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STORE_SORT_OPTIONS } from '@/lib/stores-data'
import { useAdminStoresQuery, type AdminStoreSort } from '@/modules/stores'

const PAGE_SIZE = 10

// ── Main Component ────────────────────────────────────────────────────────────
export function StoresList() {
  const router = useRouter()
  
  // State-lər
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<AdminStoreSort>('newest')
  const [page, setPage] = useState(1)

  // Axtarış üçün Debounce (Backend-i yormamaq üçün)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1) 
    }, 400)
    return () => window.clearTimeout(timer)
  }, [search])

  // Real API İnteqrasiyası (GET /api/v1/admin/stores/list)
  const { data, isLoading, isError, isFetching } = useAdminStoresQuery({
    query: debouncedSearch || undefined,
    sort: sortBy,
    page,
    pageSize: PAGE_SIZE,
  })

  // Backend-dən gələn data
  const stores = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#111827]">Mağazalar</h1>
        {isFetching && !isLoading && <Loader2 size={18} className="animate-spin text-[#00B4CC]" />}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mağaza adı, Şəhər, Ünvan axtar..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>
        
        <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); setPage(1) }} />
        
        <button
          onClick={() => router.push(`/stores/new`)}
          className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={15} /> Yeni Mağaza
        </button>
      </div>

      {/* Cədvəl Bölməsi */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header - Swagger-dəki parametrlərə uyğun */}
        <div className="grid grid-cols-[1fr_1.5fr_1fr_3rem] items-center gap-3 border-b border-border bg-[#00B4CC]/10 px-4 py-3">
          <span className="text-xs font-bold text-[#111827] uppercase">Mağaza adı</span>
          <span className="text-xs font-bold text-[#111827] uppercase">Ünvan</span>
          <span className="text-xs font-bold text-[#111827] uppercase">Telefon nömrəsi</span>
          <span className="text-xs font-bold text-[#111827] text-right">Ətraflı</span>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 size={32} className="animate-spin text-[#00B4CC]" />
            <p className="text-sm text-muted-foreground animate-pulse">Mağazalar yüklənir...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="flex items-center justify-center py-32 text-sm text-muted-foreground italic">
            {debouncedSearch ? "Axtarışa uyğun mağaza tapılmadı." : "Siyahı boşdur."}
          </div>
        ) : (
          stores.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_1.5fr_1fr_3rem] items-center gap-3 border-b border-border px-4 py-4 last:border-0 hover:bg-slate-50/50 transition-colors"
            >
              <span className="text-sm font-semibold text-[#111827] truncate">{s.name}</span>
              <span className="text-sm text-[#4B5563] line-clamp-1" title={s.fullAddress}>
                {s.fullAddress || '-'}
              </span>
              <span className="text-sm text-[#4B5563] truncate">{s.phone || '-'}</span>
              <RowMenu storeId={s.id} />
            </div>
          ))
        )}
      </div>

      {isError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-medium">
          Məlumat gətirilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.
        </div>
      )}

      {/* Pagination & Total Count */}
      {!isLoading && stores.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-2">
          <Pagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />
          <div className="px-3 py-1 bg-slate-100 rounded-full">
            <p className="text-[10px] text-[#6B7280] font-bold tracking-widest uppercase">
              Cəmi: {total} Mağaza
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Köməkçi Komponentlər (Pagination, Sort, Menu) ─────────────────────────────

function Pagination({ total, page, perPage, onChange }: { total: number; page: number; perPage: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null
  
  const getPages = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center gap-1">
      {getPages().map((p, i) => (
        <button
          key={i}
          disabled={p === '...'}
          onClick={() => typeof p === 'number' && onChange(p)}
          className={cn(
            "h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all",
            p === page ? "bg-[#00B4CC] text-white shadow-md" : "text-gray-500 hover:bg-gray-100",
            p === '...' && "cursor-default"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

function SortDropdown({ value, onChange }: { value: AdminStoreSort; onChange: (v: AdminStoreSort) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:border-[#00B4CC] transition-all">
        {STORE_SORT_OPTIONS.find(o => o.value === value)?.label || 'Sırala'}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
          {STORE_SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value as AdminStoreSort); setOpen(false) }} className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
              <span className={cn(value === o.value && "text-[#00B4CC] font-bold")}>{o.label}</span>
              {value === o.value && <Check size={14} className="text-[#00B4CC]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RowMenu({ storeId }: { storeId: number }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
        <MoreVertical size={16} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-lg border border-border bg-white shadow-lg py-1">
          <button onClick={() => router.push(`/stores/${storeId}`)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Bax</button>
          <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sil</button>
        </div>
      )}
    </div>
  )
}