'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Check, MoreVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STORE_SORT_OPTIONS } from '@/lib/stores-data'
import { useAdminStoresQuery, type AdminStoreListItem, type AdminStoreSort } from '@/modules/stores'

const PAGE_SIZE = 10

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
          <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
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

// ── Sort dropdown ─────────────────────────────────────────────────────────────
function SortDropdown({ value, onChange }: { value: AdminStoreSort; onChange: (v: AdminStoreSort) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const current = STORE_SORT_OPTIONS.find((o) => o.value === value)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
      >
        {current ? current.label : 'Sırala'}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <p className="border-b border-border px-4 py-2 text-xs font-semibold text-muted-foreground">Sırala</p>
          {STORE_SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value as AdminStoreSort); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                value === o.value && 'text-[#00B4CC] font-medium',
              )}
            >
              <Check size={13} className={cn('shrink-0', value === o.value ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Row menu ──────────────────────────────────────────────────────────────────
function RowMenu({ storeId }: { storeId: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <button
            onClick={() => router.push(`/stores/${storeId}`)}
            className="flex w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            Bax
          </button>
          <button className="flex w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
            Sil
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function StoresList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<AdminStoreSort>('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const storesQuery = useAdminStoresQuery({
    query: debouncedSearch || undefined,
    sort: sortBy,
    page,
    pageSize: PAGE_SIZE,
  })

  const stores: AdminStoreListItem[] = storesQuery.data?.items ?? []
  const total = storesQuery.data?.total ?? 0

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-foreground">Mağazalar</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Mağaza adı, Şəhər, Ünvan axtar..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>
        <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); setPage(1) }} />
        <button
          onClick={() => router.push('/stores/new')}
          className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={15} /> Yeni Mağaza
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_1fr_1fr_3rem] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
          <span className="text-xs font-semibold text-foreground">Mağaza adı</span>
          <span className="text-xs font-semibold text-foreground">Ünvan</span>
          <span className="text-xs font-semibold text-foreground">Telefon nömrəsi</span>
          <span className="text-xs font-semibold text-foreground">Ətraflı</span>
        </div>

        {storesQuery.isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Mağazalar yüklənir...
          </div>
        ) : stores.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Mağaza əlavə edilməyib
          </div>
        ) : (
          stores.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_1fr_1fr_3rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors"
            >
              <span className="text-sm font-medium text-foreground truncate">{s.name}</span>
              <span className="text-sm text-muted-foreground truncate">{s.fullAddress || '-'}</span>
              <span className="text-sm text-muted-foreground truncate">{s.phone || '-'}</span>
              <RowMenu storeId={s.id} />
            </div>
          ))
        )}
      </div>

      {storesQuery.isError && (
        <p className="text-sm text-red-500">Mağaza siyahısı yüklənmədi. Yenidən cəhd edin.</p>
      )}

      <Pagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}
