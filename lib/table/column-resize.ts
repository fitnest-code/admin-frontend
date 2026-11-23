/** Port of crnet-aspm columnResize — boundary resize + fair fill. */

export type ResizableColumnDef = {
  id: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  /** Prefer this column when absorbing leftover fill space. */
  flex?: boolean
}

const DEFAULT_MIN = 80
const DEFAULT_MAX = 960

export function columnMinWidth(column?: ResizableColumnDef | null) {
  return column?.minWidth ?? DEFAULT_MIN
}

export function columnMaxWidth(column?: ResizableColumnDef | null) {
  return column?.maxWidth ?? DEFAULT_MAX
}

export function columnWidth(column: ResizableColumnDef | undefined | null, widths: Record<string, number> = {}) {
  if (!column) return DEFAULT_MIN
  const stored = widths[column.id]
  if (typeof stored === 'number' && Number.isFinite(stored)) return stored
  return column.defaultWidth || DEFAULT_MIN
}

/**
 * Move `delta` px across the boundary between left and right columns.
 * Positive delta grows left and shrinks right; each side clamped to min/max.
 */
export function applyBoundaryDelta(
  columns: ResizableColumnDef[],
  widths: Record<string, number>,
  leftId: string,
  rightId: string | null,
  delta: number,
): Record<string, number> {
  const byId = Object.fromEntries((columns || []).map((column) => [column.id, column]))
  const left = byId[leftId]
  if (!left || left.resizable === false) return widths

  const leftWidth = columnWidth(left, widths)
  const rounded = Math.round(delta)

  if (!rightId) {
    const next = Math.min(columnMaxWidth(left), Math.max(columnMinWidth(left), leftWidth + rounded))
    if (next === leftWidth) return widths
    return { ...widths, [leftId]: next }
  }

  const right = byId[rightId]
  if (!right || right.resizable === false) {
    const next = Math.min(columnMaxWidth(left), Math.max(columnMinWidth(left), leftWidth + rounded))
    if (next === leftWidth) return widths
    return { ...widths, [leftId]: next }
  }

  const rightWidth = columnWidth(right, widths)
  let d = rounded

  if (d > 0) {
    d = Math.min(d, columnMaxWidth(left) - leftWidth, rightWidth - columnMinWidth(right))
  } else if (d < 0) {
    d = -Math.min(-d, leftWidth - columnMinWidth(left), columnMaxWidth(right) - rightWidth)
  }

  if (d === 0) return widths
  return {
    ...widths,
    [leftId]: leftWidth + d,
    [rightId]: rightWidth - d,
  }
}

export function resetColumnWidth(
  columns: ResizableColumnDef[],
  widths: Record<string, number>,
  columnId: string,
): Record<string, number> {
  const column = (columns || []).find((item) => item.id === columnId)
  if (!column) return widths
  const next = Math.min(
    columnMaxWidth(column),
    Math.max(columnMinWidth(column), column.defaultWidth || DEFAULT_MIN),
  )
  if (widths[columnId] === next) return widths
  return { ...widths, [columnId]: next }
}

/** Fill leftover container space across resizable columns (ASPM fair-fill). */
export function layoutColumnWidths(
  columns: ResizableColumnDef[],
  widths: Record<string, number>,
  containerWidth: number,
): Record<string, number> {
  const list = columns || []
  const next: Record<string, number> = {}
  let total = 0
  for (const column of list) {
    const width = Math.min(
      columnMaxWidth(column),
      Math.max(columnMinWidth(column), columnWidth(column, widths)),
    )
    next[column.id] = width
    total += width
  }

  if (!containerWidth || containerWidth <= total || !list.length) {
    return next
  }

  let remaining = Math.floor(containerWidth - total)
  const growers = list.filter((column) => column.resizable !== false)

  for (let pass = 0; pass < growers.length + 2 && remaining > 0; pass += 1) {
    const room = growers.filter((column) => next[column.id] < columnMaxWidth(column))
    if (!room.length) break

    const equalShare = Math.max(1, Math.floor(remaining / room.length))
    let assigned = 0

    room.forEach((column, index) => {
      const isLast = index === room.length - 1
      const capacity = columnMaxWidth(column) - next[column.id]
      const ideal = isLast ? remaining - assigned : equalShare
      const share = Math.max(0, Math.min(capacity, ideal))
      next[column.id] += share
      assigned += share
    })

    if (assigned <= 0) break
    remaining -= assigned
  }

  if (remaining > 0) {
    const preferred = list.filter((column) => column.resizable !== false && column.flex)
    const stretch = (preferred.length ? preferred : growers).slice(-1)
    if (stretch.length) {
      next[stretch[0].id] += remaining
    }
  }

  return next
}

export function commitDisplayWidths(
  columns: ResizableColumnDef[],
  displayWidths: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {}
  for (const column of columns || []) {
    next[column.id] = columnWidth(column, displayWidths)
  }
  return next
}
