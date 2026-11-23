'use client'

import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { columnResizeHandles } from '@/components/ui/column-resize-handle'
import { TableViewControls } from '@/components/ui/table-view-controls'
import {
  useAdminTableView,
  type AdminTableColumnDef,
} from '@/hooks/use-admin-table-view'

const CHECKBOX_COL = 48
export type AdminDataTableColumn<T> = Omit<AdminTableColumnDef, 'label'> & {
  label: string
  render: (row: T) => ReactNode
  /** When set, header shows sort affordance; parent owns server/client sort. */
  sortState?: 'asc' | 'desc' | 'none'
  onSort?: () => void
}

type SelectionConfig = {
  headerChecked: boolean
  headerIndeterminate?: boolean
  onToggleAll: () => void
  isSelectingAll?: boolean
  isRowSelected: (rowId: string | number) => boolean
  onToggleRow: (rowId: string | number) => void
}

/**
 * Shared FitNest admin table shell (ASPM column UX on HTML + Tailwind).
 * Pages keep their own data/pagination/sort hooks; this owns view chrome only.
 */
export function AdminDataTable<T>({
  storageKey,
  columns,
  rows,
  getRowId,
  selection,
  onRowClick,
  isLoading,
  emptyTitle,
  emptyDescription,
  className,
}: {
  storageKey: string
  columns: AdminDataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  selection?: SelectionConfig
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}) {
  const t = useT()
  const viewColumns: AdminTableColumnDef[] = columns.map(
    ({ render: _r, sortState: _s, onSort: _o, ...rest }) => rest,
  )

  const {
    scrollRef,
    allOrderedColumns,
    orderedColumns,
    displayWidths,
    setColumnWidths,
    visibility,
    setVisibility,
    moveColumn,
    resetTableView,
    draggingColumnId,
    setDraggingColumnId,
    dropTargetColumnId,
    setDropTargetColumnId,
  } = useAdminTableView(storageKey, viewColumns, {
    checkboxWidth: selection ? CHECKBOX_COL : 0,
  })

  const headerCheckboxRef = (el: HTMLInputElement | null) => {
    if (el && selection) {
      el.indeterminate = Boolean(selection.headerIndeterminate)
    }
  }

  const visibleDefs = orderedColumns
    .map((col) => columns.find((c) => c.id === col.id))
    .filter(Boolean) as AdminDataTableColumn<T>[]

  const labeledForControls = allOrderedColumns.map((col) => ({
    id: col.id,
    label: col.label,
    reorderable: col.reorderable,
    hideable: col.hideable,
  }))

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#00B4CC]" />
        Loading…
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-base font-semibold text-foreground">{emptyTitle || 'No results'}</p>
          {emptyDescription ? (
            <p className="max-w-xs text-sm text-muted-foreground">{emptyDescription}</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <TableViewControls
        columns={labeledForControls}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        onMove={moveColumn}
        onReset={resetTableView}
        hint={t.lists.tableColumnHint}
        viewLabel={t.lists.tableView}
        resetLabel={t.lists.tableReset}
        columnsLabel={t.lists.tableColumns}
        visibleLabel={(count) => t.lists.tableVisible.replace('{count}', String(count))}
        moveLeftLabel={(column) => t.lists.tableMoveLeft.replace('{column}', column)}
        moveRightLabel={(column) => t.lists.tableMoveRight.replace('{column}', column)}
      />
      <div ref={scrollRef} className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full border-separate border-spacing-0" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {selection ? <col style={{ width: `${CHECKBOX_COL}px` }} /> : null}
            {visibleDefs.map((column) => (
              <col
                key={column.id}
                style={{ width: `${displayWidths[column.id] ?? column.defaultWidth ?? 160}px` }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-[#cecfd2]/60 bg-[#00B4CC]/[0.08] text-left dark:border-border dark:bg-[#00B4CC]/10">
              {selection ? (
                <th className="px-3 py-3">
                  <div className="flex justify-center">
                    {selection.isSelectingAll ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
                    ) : (
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        checked={selection.headerChecked}
                        onChange={selection.onToggleAll}
                        className="h-4 w-4 cursor-pointer rounded accent-[#00B4CC]"
                      />
                    )}
                  </div>
                </th>
              ) : null}
              {visibleDefs.map((column, index) => {
                const active = column.sortState === 'asc' || column.sortState === 'desc'
                return (
                  <th
                    key={column.id}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                      if (dropTargetColumnId !== column.id) setDropTargetColumnId(column.id)
                    }}
                    onDragLeave={() => {
                      if (dropTargetColumnId === column.id) setDropTargetColumnId('')
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      const fromId = event.dataTransfer.getData('text/plain') || draggingColumnId
                      moveColumn(fromId, column.id)
                      setDraggingColumnId('')
                      setDropTargetColumnId('')
                    }}
                    className={cn(
                      'relative px-2 py-2.5 text-[11px] font-medium uppercase tracking-wide text-foreground/65',
                      active && 'bg-[#00B4CC]/10 text-foreground/80',
                      draggingColumnId === column.id && 'opacity-60',
                      dropTargetColumnId === column.id &&
                        'bg-[#00B4CC]/15 ring-1 ring-inset ring-[#00B4CC]/40',
                    )}
                    title={`${column.label}: drag edge to resize, grip to reorder`}
                  >
                    <div className="flex min-w-0 items-center gap-1 pr-2">
                      {column.reorderable !== false ? (
                        <span
                          draggable
                          aria-label={`Reorder ${column.label}`}
                          onDragStart={(event) => {
                            event.stopPropagation()
                            event.dataTransfer.effectAllowed = 'move'
                            event.dataTransfer.setData('text/plain', column.id)
                            setDraggingColumnId(column.id)
                          }}
                          onDragEnd={() => {
                            setDraggingColumnId('')
                            setDropTargetColumnId('')
                          }}
                          className="flex shrink-0 cursor-grab text-foreground/35 active:cursor-grabbing"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      {column.sortable && column.onSort ? (
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={column.onSort}
                          className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-0.5 text-left uppercase tracking-wide hover:text-foreground"
                        >
                          <span className="truncate">{column.label}</span>
                          {column.sortState === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 shrink-0 text-[#00B4CC]" />
                          ) : column.sortState === 'desc' ? (
                            <ArrowDown className="h-3.5 w-3.5 shrink-0 text-[#00B4CC]" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
                          )}
                        </button>
                      ) : (
                        <span className="min-w-0 flex-1 truncate">{column.label}</span>
                      )}
                    </div>
                    {columnResizeHandles({
                      column,
                      columns: visibleDefs,
                      index,
                      widths: displayWidths,
                      onWidthsChange: setColumnWidths,
                    })}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = getRowId(row)
              return (
                <tr
                  key={rowId}
                  onClick={(event) => {
                    const target = event.target as HTMLElement
                    if (target.closest('button, a, input, select, label')) return
                    onRowClick?.(row)
                  }}
                  className={cn(
                    'border-b border-border transition-colors last:border-0 hover:bg-slate-50/80',
                    onRowClick && 'cursor-pointer',
                    'bg-card',
                  )}
                >
                  {selection ? (
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selection.isRowSelected(rowId)}
                          onChange={() => selection.onToggleRow(rowId)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-4 w-4 cursor-pointer rounded accent-[#00B4CC]"
                        />
                      </div>
                    </td>
                  ) : null}
                  {visibleDefs.map((column) => (
                    <td
                      key={column.id}
                      className="px-3 py-3 text-sm font-normal leading-5 text-foreground"
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Escape hatch for custom cell wrappers (badges etc.) that shouldn't force truncate wrapper. */
export function AdminDataTableCell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('min-w-0', className)}>{children}</div>
}
