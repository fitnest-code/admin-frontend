'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Check, MoreVertical, Plus, Loader2, Eye, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STORE_SORT_OPTIONS } from '@/lib/stores-data'
import { useAdminStoresQuery, type AdminStoreSort, type AdminStoreListItem } from '@/modules/stores'
import { ConfirmDeleteModal } from '../gyms/modals/confirm-delete-modal'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { useDeleteStore } from '@/lib/query/store-query'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useResizableColumns } from '@/hooks/use-resizable-columns'

const PAGE_SIZE = 10

// ── Main Component ────────────────────────────────────────────────────────────
export function StoresList() {
  const router = useRouter()
  const deleteStoreMutation = useDeleteStore()
  
  // State-lər
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<AdminStoreSort>('newest')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  })

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

  const { colWidths, tableRef, handleMouseDown } = useResizableColumns(
    [220, 300, 220],
    [150, 150, 150]
  )

  function handleDelete() {
    if (!deleteId) return
    deleteStoreMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        setModalConfig({ isOpen: true, message: "Mağaza uğurla silindi!", type: "success" })
      },
      onError: (error: any) => {
        const msg = error?.message || "Mağazanı silmək mümkün olmadı"
        setModalConfig({ isOpen: true, message: msg, type: "error" })
      },
    })
  }

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
          <Plus size={15} /> Mağaza yarat
        </button>
      </div>

      {/* Cədvəl Bölməsi - menyunun kəsilməməsi üçün overflow-hidden çıxarıldı */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00B4CC]/10 text-left">
              <th className="px-4 py-3 text-xs font-bold text-[#111827] uppercase tracking-wider relative">
                Mağaza adı
                <div
                  onMouseDown={(e) => handleMouseDown(0, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-[#111827] uppercase tracking-wider relative">
                Ünvan
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-[#111827] uppercase tracking-wider relative">
                Telefon nömrəsi
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-[#111827] uppercase tracking-wider text-center">Ətraflı</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-[#00B4CC]" />
                    <p className="text-sm text-muted-foreground animate-pulse">Mağazalar yüklənir...</p>
                  </div>
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-32 text-center text-sm text-muted-foreground italic">
                  {debouncedSearch ? "Axtarışa uyğun mağaza tapılmadı." : "Siyahı boşdur."}
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <StoreRow
                  key={s.id}
                  store={s}
                  onView={() => router.push(`/stores/${s.id}`)}
                  onDelete={() => setDeleteId(s.id)}
                />
              ))
            )}
          </tbody>
        </table>

        {total > PAGE_SIZE && !isLoading && (
          <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4">
            {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                  p === page ? 'bg-[#00B4CC] text-white shadow-sm' : 'text-foreground hover:bg-secondary',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {isError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-medium">
          Məlumat gətirilərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.
        </div>
      )}

      {deleteId !== null && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Mağazanı sil"
          description="Bu mağazanı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        />
      )}

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )
}

// ── StoreRow Component (Zallardakı dizayna tam uyğun) ─────────────────────────
function StoreRow({
  store,
  onView,
  onDelete,
}: {
  store: AdminStoreListItem
  onView: () => void
  onDelete: () => void
}) {
  return (
    <tr
      onClick={onView}
      className="hover:bg-secondary/40 border-b border-border transition-colors relative cursor-pointer"
    >
      <td className="px-4 py-3.5 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={store.name}>{store.name}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-black overflow-hidden">
        <span className="line-clamp-1 block" title={store.fullAddress}>{store.fullAddress}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-black overflow-hidden">
        <span className="truncate block" title={store.phone}>{store.phone}</span>
      </td>
      <td className="px-4 py-3.5 text-center">
        {/* Action menu */}
        <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 outline-none"
                aria-label="Ətraflı seçimlər"
              >
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[180px] flex flex-col gap-3 rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg">
              <DropdownMenuItem
                onClick={onView}
                className="flex w-full items-center gap-2 border-b border-[#ECECED] pb-3 text-base font-normal text-black hover:opacity-70 transition-opacity cursor-pointer focus:bg-transparent px-0 py-0 rounded-none"
              >
                <Eye size={16} className="text-[#333333]" />
                <span className="leading-none">Detallı bax</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="flex w-full items-center gap-2 text-base font-normal text-[#F10303] hover:opacity-70 transition-opacity cursor-pointer focus:bg-transparent px-0 py-0"
              >
                <Trash2 size={16} />
                <span className="leading-none">Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}

// ── Köməkçi Komponentlər (Sort) ───────────────────────────────────

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