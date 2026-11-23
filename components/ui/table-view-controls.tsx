'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Columns3, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TableViewColumn = {
  id: string
  label: string
  reorderable?: boolean
  hideable?: boolean
}

/** ASPM-style bar: hint + “Table view” panel (visibility, reorder, reset). */
export function TableViewControls({
  columns,
  visibility = {},
  onVisibilityChange,
  onMove,
  onReset,
  hint,
  viewLabel,
  resetLabel,
  columnsLabel,
  visibleLabel,
  moveLeftLabel,
  moveRightLabel,
}: {
  columns: TableViewColumn[]
  visibility?: Record<string, boolean>
  onVisibilityChange: (next: Record<string, boolean>) => void
  onMove?: (fromId: string, toId: string) => void
  onReset: () => void
  hint: string
  viewLabel: string
  resetLabel: string
  columnsLabel: string
  visibleLabel: (count: number) => string
  moveLeftLabel: (column: string) => string
  moveRightLabel: (column: string) => string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const visibleCount = columns.filter((column) => visibility[column.id] !== false).length

  useEffect(() => {
    if (!open) return
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative flex items-center justify-between gap-3 px-0.5">
      <span className="text-[11px] text-muted-foreground">{hint}</span>
      <div className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm transition-colors',
            'hover:bg-secondary',
            open && 'border-[#00B4CC]/40 bg-[#00B4CC]/5 text-foreground',
          )}
        >
          <Columns3 className="h-3.5 w-3.5" aria-hidden />
          {viewLabel}
        </button>
        {open && (
          <div
            role="dialog"
            aria-label={viewLabel}
            className="absolute right-0 top-[calc(100%+6px)] z-40 w-72 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
              <strong className="text-sm font-semibold text-foreground">{viewLabel}</strong>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                {resetLabel}
              </button>
            </header>
            <p className="px-3 pt-2 text-[11px] text-muted-foreground">
              {columnsLabel} <span className="text-foreground/70">{visibleLabel(visibleCount)}</span>
            </p>
            <div className="max-h-64 space-y-0.5 overflow-y-auto p-2">
              {columns.map((column, index) => {
                const checked = visibility[column.id] !== false
                return (
                  <div
                    key={column.id}
                    className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-secondary/60"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={
                          column.hideable === false || (checked && visibleCount === 1)
                        }
                        onChange={() =>
                          onVisibilityChange({
                            ...visibility,
                            [column.id]: !checked,
                          })
                        }
                        className="h-3.5 w-3.5 rounded accent-[#00B4CC]"
                      />
                      <span className="truncate">{column.label}</span>
                    </label>
                    <button
                      type="button"
                      aria-label={moveLeftLabel(column.label)}
                      disabled={
                        !onMove ||
                        index === 0 ||
                        column.reorderable === false ||
                        columns[index - 1]?.reorderable === false
                      }
                      onClick={() => onMove?.(column.id, columns[index - 1].id)}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={moveRightLabel(column.label)}
                      disabled={
                        !onMove ||
                        index === columns.length - 1 ||
                        column.reorderable === false ||
                        columns[index + 1]?.reorderable === false
                      }
                      onClick={() => onMove?.(column.id, columns[index + 1].id)}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
