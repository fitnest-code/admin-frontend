'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronDown, Eye, Trash2, MoreVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_ZALLAR, SORT_OPTIONS, type Zal } from '@/lib/zallar-data'
import { ZalStatusToggle } from './zal-status-toggle'
import { ConfirmDeleteModal } from './modals/confirm-delete-modal'

export function ZallarList() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sortValue, setSortValue] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [zallar, setZallar] = useState<Zal[]>(MOCK_ZALLAR)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const sortRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const PER_PAGE = 5
  const TOTAL_PAGES = 34 // mock

  // Close popovers on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() => {
    let list = [...zallar]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.city.toLowerCase().includes(q) ||
          z.address.toLowerCase().includes(q),
      )
    }
    switch (sortValue) {
      case 'az':      list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'za':      list.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'deaktiv': list = list.filter((z) => z.status === 'deaktiv'); break
      case 'sehir':   list.sort((a, b) => a.city.localeCompare(b.city)); break
    }
    return list
  }, [zallar, query, sortValue])

  function handleToggleStatus(id: string) {
    setZallar((prev) =>
      prev.map((z) =>
        z.id === id ? { ...z, status: z.status === 'aktiv' ? 'deaktiv' : 'aktiv' } : z,
      ),
    )
  }

  function handleDelete(id: string) {
    setZallar((prev) => prev.filter((z) => z.id !== id))
    setDeleteTargetId(null)
  }

  const isEmpty = filtered.length === 0

  // Pagination pages array
  const pages = [1, 2, 3, 4, '...', TOTAL_PAGES]

  return (
    <div className="flex flex-col gap-5">
      {/* Page title */}
      <h1 className="text-xl font-semibold text-foreground">Zallar</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
            placeholder="Zal adı, Şəhər, Ünvan axtar......"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Zal axtar"
          />
        </div>

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((p) => !p)}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground',
              'transition-colors hover:border-[#00B4CC] hover:text-[#00B4CC]',
              sortOpen && 'border-[#00B4CC] text-[#00B4CC]',
            )}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            Sırala
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', sortOpen && 'rotate-180')}
            />
          </button>
          {sortOpen && (
            <ul
              role="listbox"
              className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              {SORT_OPTIONS.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === sortValue}
                  onClick={() => { setSortValue(opt.value); setSortOpen(false) }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                    opt.value === sortValue
                      ? 'bg-[#00B4CC26] text-[#00B4CC] font-medium'
                      : 'text-foreground hover:bg-secondary',
                  )}
                >
                  {opt.label}
                  {opt.value === sortValue && <Check size={13} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New Zal button */}
        <button
          onClick={() => router.push('/zallar/yeni')}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#008799]"
        >
          <Plus size={15} aria-hidden />
          Yeni zal
        </button>
      </div>

      {/* Table - removed overflow-hidden to prevent dropdown clipping */}
      <div className="rounded-xl border border-border bg-card">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_6rem_4rem] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3 rounded-t-xl">
          <input type="checkbox" className="h-4 w-4 rounded accent-[#00B4CC]" aria-label="Bütün zalları seç" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Zal adı</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Ünvan</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Məsul şəxs</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-center">Status</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-right">Ətraflı</span>
        </div>

        {/* Empty state */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <p className="text-sm font-semibold text-foreground">Məlumat yoxdur</p>
            <button
              onClick={() => router.push('/zallar/yeni')}
              className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
            >
              <Plus size={15} />
              Yeni Zal Əlavə et
            </button>
          </div>
        ) : (
          <>
            {filtered.map((zal) => (
              <ZalTableRow
                key={zal.id}
                zal={zal}
                openMenuId={openMenuId}
                menuRef={menuRef}
                onToggleMenu={(id) => setOpenMenuId((prev) => (prev === id ? null : id))}
                onView={() => router.push(`/zallar/${zal.id}`)}
                onDelete={() => setDeleteTargetId(zal.id)}
                onToggleStatus={() => handleToggleStatus(zal.id)}
              />
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-border">
              {pages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => typeof p === 'number' && setCurrentPage(p)}
                  disabled={p === '...'}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                    p === currentPage
                      ? 'bg-[#00B4CC] text-white'
                      : p === '...'
                      ? 'cursor-default text-muted-foreground'
                      : 'text-foreground hover:bg-secondary',
                  )}
                  aria-label={typeof p === 'number' ? `Səhifə ${p}` : 'Daha çox'}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirm delete modal */}
      {deleteTargetId && (
        <ConfirmDeleteModal
          name={zallar.find((z) => z.id === deleteTargetId)?.name ?? ''}
          onConfirm={() => handleDelete(deleteTargetId)}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

// ─── Table Row ──────────────────────────────────────────────────────────────

interface ZalTableRowProps {
  zal: Zal
  openMenuId: string | null
  menuRef: React.RefObject<HTMLDivElement | null>
  onToggleMenu: (id: string) => void
  onView: () => void
  onDelete: () => void
  onToggleStatus: () => void
}

function ZalTableRow({
  zal,
  openMenuId,
  menuRef,
  onToggleMenu,
  onView,
  onDelete,
  onToggleStatus,
}: ZalTableRowProps) {
  const isMenuOpen = openMenuId === zal.id

  return (
    <div 
      className={cn(
        "grid grid-cols-[2rem_1fr_1fr_1fr_6rem_4rem] items-center gap-4 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/40 transition-colors relative",
        isMenuOpen ? "z-50 shadow-sm" : "z-0"
      )}
    >
      <input type="checkbox" className="h-4 w-4 rounded accent-[#00B4CC]" aria-label={`${zal.name} seç`} />
      <span className="text-sm font-medium text-foreground truncate">{zal.name}</span>
      <span className="text-sm text-muted-foreground truncate">{zal.city}, {zal.address}</span>
      <span className="text-sm text-muted-foreground truncate">Məsul şəxs</span>

      {/* Status toggle */}
      <div className="flex justify-center">
        <ZalStatusToggle active={zal.status === 'aktiv'} onToggle={onToggleStatus} />
      </div>

      {/* Action menu */}
      <div className="relative flex justify-end" ref={isMenuOpen ? menuRef : undefined}>
        <button
          onClick={() => onToggleMenu(zal.id)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
            isMenuOpen ? "bg-secondary text-[#00B4CC]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          aria-label="Ətraflı seçimlər"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-11 z-50 w-[180px] flex flex-col gap-3 rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={onView}
              className="flex w-full items-center gap-2 border-b border-[#ECECED] pb-3 text-base font-normal text-black hover:opacity-70 transition-opacity"
            >
              <Eye size={16} className="text-[#333333]" />
              <span className="leading-none">Detallı bax</span>
            </button>
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 text-base font-normal text-[#F10303] hover:opacity-70 transition-opacity"
            >
              <Trash2 size={16} />
              <span className="leading-none">Sil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
