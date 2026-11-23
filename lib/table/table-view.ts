/** Port of crnet-aspm tableView helpers. */

export type TableColumnLike = {
  id: string
  defaultHidden?: boolean
}

/** Move fromId to toId's position; works in both directions. */
export function reorderColumnIds(order: string[], fromId: string, toId: string): string[] {
  if (!fromId || !toId || fromId === toId) return order
  const from = order.indexOf(fromId)
  const to = order.indexOf(toId)
  if (from < 0 || to < 0) return order
  const next = [...order]
  next.splice(from, 1)
  next.splice(to, 0, fromId)
  return next
}

/** Keep saved order ids that still exist; append any new columns at the end. */
export function normalizeColumnOrder(preferred: string[] | null | undefined, columns: TableColumnLike[]): string[] {
  const available = columns.map((column) => column.id)
  const availableSet = new Set(available)
  const ordered: string[] = []
  ;(preferred || []).forEach((id) => {
    if (availableSet.has(id) && !ordered.includes(id)) ordered.push(id)
  })
  available.forEach((id) => {
    if (!ordered.includes(id)) ordered.push(id)
  })
  return ordered
}

export function defaultVisibilityFromColumns(columns: TableColumnLike[] = []): Record<string, boolean> {
  const visibility: Record<string, boolean> = {}
  columns.forEach((column) => {
    if (column.defaultHidden) visibility[column.id] = false
  })
  return visibility
}

export function widthsStorageKey(storageKey: string, version = 'v9') {
  return storageKey ? `data-table-widths:${version}:${storageKey}` : ''
}

export function orderStorageKey(storageKey: string, version = 'v1') {
  return storageKey ? `data-table-order:${version}:${storageKey}` : ''
}

export function viewStorageKey(storageKey: string) {
  return storageKey ? `table-view:${storageKey}` : ''
}
