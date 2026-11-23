'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { layoutColumnWidths, type ResizableColumnDef } from '@/lib/table/column-resize'
import {
  defaultVisibilityFromColumns,
  normalizeColumnOrder,
  orderStorageKey,
  reorderColumnIds,
  viewStorageKey,
  widthsStorageKey,
} from '@/lib/table/table-view'

export type AdminTableColumnDef = ResizableColumnDef & {
  label: string
  sortable?: boolean
  reorderable?: boolean
  hideable?: boolean
  defaultHidden?: boolean
}

/**
 * ASPM-style table view state: order, visibility, widths, fair-fill display widths.
 * Persists under data-table-*:{storageKey} / table-view:{storageKey}.
 */
export function useAdminTableView(
  storageKey: string,
  columns: AdminTableColumnDef[],
  options?: { checkboxWidth?: number },
) {
  const checkboxWidth = options?.checkboxWidth ?? 0
  const scrollRef = useRef<HTMLDivElement>(null)

  const [hydrated, setHydrated] = useState(false)
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((c) => c.id))
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.defaultWidth || 160])),
  )
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    defaultVisibilityFromColumns(columns),
  )
  const [containerWidth, setContainerWidth] = useState(0)
  const [draggingColumnId, setDraggingColumnId] = useState('')
  const [dropTargetColumnId, setDropTargetColumnId] = useState('')

  // Re-sync when column catalog identity changes (ids/labels from i18n).
  const columnIdsKey = columns.map((c) => c.id).join('|')

  useEffect(() => {
    const defaults = Object.fromEntries(columns.map((c) => [c.id, c.defaultWidth || 160]))
    try {
      const savedOrder = JSON.parse(window.localStorage.getItem(orderStorageKey(storageKey)) || 'null')
      setColumnOrder(normalizeColumnOrder(Array.isArray(savedOrder) ? savedOrder : [], columns))
      const savedWidths = JSON.parse(window.localStorage.getItem(widthsStorageKey(storageKey)) || '{}')
      setColumnWidths({ ...defaults, ...(savedWidths && typeof savedWidths === 'object' ? savedWidths : {}) })
      const savedView = JSON.parse(window.localStorage.getItem(viewStorageKey(storageKey)) || '{}')
      const fallback = defaultVisibilityFromColumns(columns)
      setVisibility(
        savedView?.visibility && typeof savedView.visibility === 'object'
          ? { ...fallback, ...savedView.visibility }
          : fallback,
      )
    } catch {
      setColumnOrder(columns.map((c) => c.id))
      setColumnWidths(defaults)
      setVisibility(defaultVisibilityFromColumns(columns))
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate when storageKey / column set changes
  }, [storageKey, columnIdsKey])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(widthsStorageKey(storageKey), JSON.stringify(columnWidths))
  }, [columnWidths, hydrated, storageKey])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(orderStorageKey(storageKey), JSON.stringify(columnOrder))
  }, [columnOrder, hydrated, storageKey])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(viewStorageKey(storageKey), JSON.stringify({ visibility }))
  }, [visibility, hydrated, storageKey])

  useEffect(() => {
    const node = scrollRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const update = () => setContainerWidth(Math.floor(node.clientWidth))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [hydrated, columnIdsKey])

  const allOrderedColumns = useMemo(() => {
    const byId = new Map(columns.map((column) => [column.id, column]))
    return normalizeColumnOrder(columnOrder, columns)
      .map((id) => byId.get(id))
      .filter(Boolean) as AdminTableColumnDef[]
  }, [columnOrder, columns])

  const orderedColumns = allOrderedColumns.filter((column) => visibility[column.id] !== false)

  const layoutWidth = Math.max(0, containerWidth - checkboxWidth)
  const displayWidths = useMemo(
    () => layoutColumnWidths(orderedColumns, columnWidths, layoutWidth),
    [orderedColumns, columnWidths, layoutWidth],
  )

  function moveColumn(fromId: string, toId: string) {
    if (!fromId || !toId || fromId === toId) return
    setColumnOrder((current) => reorderColumnIds(normalizeColumnOrder(current, columns), fromId, toId))
  }

  function resetTableView() {
    setVisibility(defaultVisibilityFromColumns(columns))
    setColumnOrder(columns.map((column) => column.id))
    setColumnWidths(Object.fromEntries(columns.map((column) => [column.id, column.defaultWidth || 160])))
  }

  return {
    scrollRef,
    allOrderedColumns,
    orderedColumns,
    displayWidths,
    columnWidths,
    setColumnWidths,
    visibility,
    setVisibility,
    moveColumn,
    resetTableView,
    draggingColumnId,
    setDraggingColumnId,
    dropTargetColumnId,
    setDropTargetColumnId,
  }
}
