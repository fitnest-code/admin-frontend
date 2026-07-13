'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomerQrHistoryQuery } from '@/modules/customers/hooks/use-customers-query'
import type { QrHistoryItem } from '@/modules/customers/types/customer.types'

const PAGE_SIZE = 5

const FAILED_REASON_LABELS: Record<string, string> = {
  OUT_OF_WORKING_HOURS: 'İş saatlarından kənar',
  TOO_FAR_FROM_GYM:     'Zaldan uzaqdır',
  GYM_NOT_SUPPORTED:    'Zal dəstəklənmir',
  SUBSCRIPTION_EXPIRED: 'Abunəlik bitib',
  LIMIT_EXCEEDED:       'Limit dolub',
  WRONG_GYM:            'Yanlış zal',
  NO_ACTIVE_SUBSCRIPTION: 'Aktiv abunəlik yoxdur',
}

const SORT_OPTIONS = [
  { value: 'zal',      label: 'Zal' },
  { value: 'date',     label: 'Tarix aralığı' },
  { value: 'result',   label: 'Nəticə' },
  { value: 'platform', label: 'Platforma' },
]

function sortRows(rows: QrHistoryItem[], sort: string): QrHistoryItem[] {
  return [...rows].sort((a, b) => {
    if (sort === 'zal')      return a.gymName.localeCompare(b.gymName)
    if (sort === 'result')   return a.status.localeCompare(b.status)
    if (sort === 'platform') return a.platform.localeCompare(b.platform)
    // date: newest first (strings are in dd.mm.yyyy HH:MM format — sort lexically reversed)
    return b.dateTime.localeCompare(a.dateTime)
  })
}

function reasonLabel(item: QrHistoryItem): string {
  if (item.status === 'Uğurlu') return 'Uğurlu giriş'
  if (!item.failedReason) return '—'
  return FAILED_REASON_LABELS[item.failedReason] ?? item.failedReason
}

export function AccessTab({ userId }: { userId: string }) {
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState('date')
  const [sortOpen, setSortOpen] = useState(false)
  const [page,     setPage]     = useState(1)
  const sortRef = useRef<HTMLDivElement>(null)

  const { data = [], isLoading, isError } = useCustomerQrHistoryQuery(userId)

  const [colWidths, setColWidths] = useState<number[]>([160, 200, 130, 200]);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const activeColIndexRef = useRef<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerWidthRef = useRef<number>(0);

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const mouseUpRef = useRef<() => void>(null);

  const minWidths = [140, 150, 100, 150];

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return;
    const deltaX = e.clientX - startXRef.current;
    const minW = minWidths[activeColIndexRef.current] || 100;

    const sumOthers = colWidths.reduce((acc, w, idx) => {
      return idx !== activeColIndexRef.current ? acc + w : acc;
    }, 0);

    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 100);
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
      containerWidthRef.current = 750;
    }

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current);
  };

  useEffect(() => {
    function h(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => {
      document.removeEventListener('mousedown', h)
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? data.filter((r) =>
          r.gymName.toLowerCase().includes(q) ||
          r.platform.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q),
        )
      : data
    return sortRows(base, sort)
  }, [data, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sırala'

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Zal adı, platforma üzrə axtarış..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

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
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setSortOpen(false); setPage(1) }}
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
        <table ref={tableRef} className="w-full text-sm border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col style={{ width: `${colWidths[3]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#E8F9FB] text-left">
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap relative">
                Tarix / Saat
                <div
                  onMouseDown={(e) => handleMouseDown(0, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap relative">
                Zal Adı
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap relative">
                Nəticə
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap relative">
                Səbəb
                <div
                  onMouseDown={(e) => handleMouseDown(3, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap relative">Platforma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="bg-card">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                  </td>
                ))}
              </tr>
            ))}
            {isError && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  Giriş tarixçəsi yüklənmədi.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  Heç bir giriş qeydi tapılmadı.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.map((row, i) => (
              <tr key={i} className="bg-card hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 overflow-hidden">
                  <span className="text-foreground whitespace-nowrap truncate block" title={row.dateTime}>{row.dateTime}</span>
                </td>
                <td className="px-4 py-3 overflow-hidden">
                  <span className="text-foreground whitespace-nowrap truncate block" title={row.gymName}>{row.gymName}</span>
                </td>
                <td className="px-4 py-3 overflow-hidden">
                  <span className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold truncate block w-fit',
                    row.status === 'Uğurlu' ? 'bg-green-600 text-white' : 'bg-red-500 text-white',
                  )}>
                    • {row.status === 'Uğurlu' ? 'Təsdiqləndı' : 'Rədd edildi'}
                  </span>
                </td>
                <td className="px-4 py-3 overflow-hidden">
                  <span className="text-foreground whitespace-nowrap truncate block" title={reasonLabel(row)}>{reasonLabel(row)}</span>
                </td>
                <td className="px-4 py-3 overflow-hidden">
                  <span className="text-foreground whitespace-nowrap truncate block" title={row.platform}>{row.platform}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

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
              page === p ? 'bg-[#00B4CC] text-white' : 'text-foreground hover:bg-secondary',
            )}
          >
            {p}
          </button>
        ),
      )}
    </div>
  )
}
