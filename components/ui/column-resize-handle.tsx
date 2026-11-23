'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  applyBoundaryDelta,
  commitDisplayWidths,
  resetColumnWidth,
  type ResizableColumnDef,
} from '@/lib/table/column-resize'

type WidthsUpdater =
  | Record<string, number>
  | ((current: Record<string, number>) => Record<string, number>)

/**
 * ASPM-style boundary resize: drag trades width with the neighbor;
 * double-click resets; arrow keys nudge ±16px.
 */
export function ColumnResizeHandle({
  edge = 'end',
  column,
  columns,
  widths,
  prevColumn = null,
  nextColumn = null,
  onWidthsChange,
}: {
  edge?: 'end' | 'start'
  column: ResizableColumnDef & { label?: string }
  columns: ResizableColumnDef[]
  widths: Record<string, number>
  prevColumn?: (ResizableColumnDef & { label?: string }) | null
  nextColumn?: (ResizableColumnDef & { label?: string }) | null
  onWidthsChange: (next: WidthsUpdater) => void
}) {
  const drag = useRef<{ startX: number; startWidths: Record<string, number> } | null>(null)

  const trailingEnd = edge === 'end' && !nextColumn && Boolean(prevColumn)
  const leftColumn = edge === 'start' ? prevColumn : column
  const rightColumn =
    edge === 'start' ? column : trailingEnd ? prevColumn : nextColumn

  const leftId = leftColumn?.id || column.id
  const rightId = rightColumn && rightColumn.id !== leftId ? rightColumn.id : null

  function finishResize(event: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return
    document.body.classList.remove('is-resizing-columns')
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    drag.current = null
  }

  const label =
    rightId && leftColumn && rightColumn
      ? `Resize boundary between ${leftColumn.label || leftId} and ${rightColumn.label || rightId}`
      : `Resize ${column.label || column.id} column`

  return (
    <button
      type="button"
      aria-label={label}
      title={`${label}. Drag to resize; double-click resets.`}
      className={cn(
        'absolute bottom-0 top-0 z-20 w-2 -translate-x-1/2 cursor-col-resize touch-none border-0 bg-transparent p-0',
        edge === 'end' ? 'right-0 translate-x-1/2' : 'left-0',
        'before:absolute before:inset-y-2 before:left-1/2 before:w-px before:-translate-x-1/2 before:rounded before:bg-[#d0d5dd] before:transition-colors',
        'hover:before:bg-[#00B4CC] focus-visible:outline-none focus-visible:before:bg-[#00B4CC]',
      )}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onWidthsChange((current) => {
          let next = resetColumnWidth(columns, current, column.id)
          if (trailingEnd && prevColumn) {
            next = resetColumnWidth(columns, next, prevColumn.id)
          }
          return next
        })
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        const step = event.key === 'ArrowRight' ? 16 : -16
        const base = commitDisplayWidths(columns, widths)
        onWidthsChange(applyBoundaryDelta(columns, base, leftId, rightId, step))
      }}
      onPointerCancel={finishResize}
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const committed = commitDisplayWidths(columns, widths)
        onWidthsChange(committed)
        drag.current = {
          startX: event.clientX,
          startWidths: committed,
        }
        document.body.classList.add('is-resizing-columns')
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!drag.current) return
        const delta = event.clientX - drag.current.startX
        onWidthsChange(() =>
          applyBoundaryDelta(columns, drag.current!.startWidths, leftId, rightId, delta),
        )
      }}
      onPointerUp={finishResize}
    />
  )
}

export function columnResizeHandles({
  column,
  columns,
  index,
  widths,
  onWidthsChange,
}: {
  column: ResizableColumnDef & { label?: string }
  columns: Array<ResizableColumnDef & { label?: string }>
  index: number
  widths: Record<string, number>
  onWidthsChange: (next: WidthsUpdater) => void
}) {
  if (column?.resizable === false) return null

  const prevColumn = index > 0 ? columns[index - 1] : null
  const nextColumn = index < columns.length - 1 ? columns[index + 1] : null

  return (
    <ColumnResizeHandle
      columns={columns}
      column={column}
      edge="end"
      nextColumn={nextColumn}
      onWidthsChange={onWidthsChange}
      prevColumn={prevColumn}
      widths={widths}
    />
  )
}
