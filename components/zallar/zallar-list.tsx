'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronDown, Eye, Trash2, MoreVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_ZALLAR, SORT_OPTIONS, type Zal } from '@/lib/zallar-data'
import { ZalStatusToggle } from './zal-status-toggle'
import { ConfirmDeleteModal } from './modals/confirm-delete-modal'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export function ZallarList() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sortValue, setSortValue] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [zallar, setZallar] = useState<Zal[]>(MOCK_ZALLAR)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const sortRef = useRef<HTMLDivElement>(null)

  const PER_PAGE = 5
  const TOTAL_PAGES = 34 // mock

  const [colWidths, setColWidths] = useState<number[]>([50, 220, 280, 150, 120]);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const activeColIndexRef = useRef<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerWidthRef = useRef<number>(0);

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const mouseUpRef = useRef<() => void>(null);

  const minWidths = [40, 150, 180, 100, 90];

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return;
    const deltaX = e.clientX - startXRef.current;
    const minW = minWidths[activeColIndexRef.current] || 100;

    const sumOthers = colWidths.reduce((acc, w, idx) => {
      return idx !== activeColIndexRef.current ? acc + w : acc;
    }, 0);

    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 90);
    const newWidth = Math.min(maxW, Math.max(minW, startWidthRef.current + deltaX));
    setColWidths((prev) => {
      const copy = [...prev];
      copy[activeColIndexRef.current] = newWidth;
      return copy;
    });
  };

  mouseUpRef.current = () => {
    activeColIndexRef.current = -1;
    if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeColIndexRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[index];

    if (tableRef.current) {
      containerWidthRef.current = tableRef.current.getBoundingClientRect().width;
    } else {
      containerWidthRef.current = 800;
    }

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current);
  };

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
    };
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
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
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "800px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col style={{ width: `${colWidths[3]}px` }} />
            <col style={{ width: `${colWidths[4]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00B4CC14] text-left text-xs font-semibold text-foreground uppercase tracking-wider">
              <th className="px-4 py-3 text-center">
                <input type="checkbox" className="h-4 w-4 rounded accent-[#00B4CC]" aria-label="Bütün zalları seç" />
              </th>
              <th className="px-4 py-3 relative">
                Zal adı
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 relative">
                Ünvan
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 relative">
                Məsul şəxs
                <div
                  onMouseDown={(e) => handleMouseDown(3, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-center relative">
                Status
                <div
                  onMouseDown={(e) => handleMouseDown(4, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">Ətraflı</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <p className="text-sm font-semibold text-foreground mb-4">Məlumat yoxdur</p>
                  <button
                    onClick={() => router.push('/zallar/yeni')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors mx-auto"
                  >
                    <Plus size={15} />
                    Yeni Zal Əlavə et
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((zal) => (
                <ZalTableRow
                  key={zal.id}
                  zal={zal}
                  onView={() => router.push(`/zallar/${zal.id}`)}
                  onDelete={() => setDeleteTargetId(zal.id)}
                  onToggleStatus={() => handleToggleStatus(zal.id)}
                />
              ))
            )}
          </tbody>
        </table>

        {!isEmpty && (
          <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-border bg-card">
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
  onView: () => void
  onDelete: () => void
  onToggleStatus: () => void
}

function ZalTableRow({
  zal,
  onView,
  onDelete,
  onToggleStatus,
}: ZalTableRowProps) {
  return (
    <tr 
      className="hover:bg-secondary/40 border-b border-border transition-colors relative"
    >
      <td className="px-4 py-3.5 text-center">
        <input type="checkbox" className="h-4 w-4 rounded accent-[#00B4CC]" aria-label={`${zal.name} seç`} />
      </td>
      <td className="px-4 py-3.5 text-sm font-medium text-foreground overflow-hidden">
        <span className="truncate block" title={zal.name}>{zal.name}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-muted-foreground overflow-hidden">
        <span className="truncate block" title={`${zal.city}, ${zal.address}`}>{zal.city}, {zal.address}</span>
      </td>
      <td className="px-4 py-3.5 text-sm text-muted-foreground overflow-hidden">
        <span className="truncate block">Məsul şəxs</span>
      </td>
      <td className="px-4 py-3.5 text-center overflow-hidden">
        {/* Status toggle */}
        <div className="flex justify-center">
          <ZalStatusToggle active={zal.status === 'aktiv'} onToggle={onToggleStatus} />
        </div>
      </td>
      <td className="px-4 py-3.5 text-right">
        {/* Action menu */}
        <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
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
