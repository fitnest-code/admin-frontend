'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, GripVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import type { CustomerListItem } from '@/modules/customers'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import {
  CUSTOMER_STATUS_STYLES,
  getCustomerStatusLabel,
  getSubscriptionStatusLabel,
  normalizeCustomerStatus,
  normalizeSubscriptionStatus,
  type CustomerSortValue,
} from './customer-list-utils'

type ColumnId = 'id' | 'name' | 'phone' | 'email' | 'status' | 'subscription'

const CHECKBOX_COL = 48
const COLUMN_ORDER_KEY = 'fitnest.customers.table.columnOrder'
const DEFAULT_ORDER: ColumnId[] = ['id', 'name', 'phone', 'email', 'status', 'subscription']
const DEFAULT_WIDTHS: Record<ColumnId, number> = {
  id: 72,
  name: 220,
  phone: 160,
  email: 240,
  status: 200,
  subscription: 140,
}
const MIN_WIDTHS: Record<ColumnId, number> = {
  id: 52,
  name: 120,
  phone: 110,
  email: 140,
  status: 120,
  subscription: 110,
}

/** Column header click cycles these API/client sort pairs. */
const COLUMN_SORT: Partial<Record<ColumnId, [CustomerSortValue, CustomerSortValue]>> = {
  id: ['registrationDate_desc', 'registrationDate_asc'],
  name: ['name_asc', 'name_desc'],
  subscription: ['finishDate_asc', 'finishDate_desc'],
}

const CELL =
  'truncate px-3 py-3 text-sm font-normal leading-5 text-foreground'

function loadColumnOrder(): ColumnId[] {
  if (typeof window === 'undefined') return DEFAULT_ORDER
  try {
    const raw = window.localStorage.getItem(COLUMN_ORDER_KEY)
    if (!raw) return DEFAULT_ORDER
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_ORDER
    const valid = parsed.filter((id): id is ColumnId => DEFAULT_ORDER.includes(id as ColumnId))
    const missing = DEFAULT_ORDER.filter((id) => !valid.includes(id))
    return valid.length === DEFAULT_ORDER.length ? valid : [...valid, ...missing]
  } catch {
    return DEFAULT_ORDER
  }
}

function EmptyState() {
  const t = useT()
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid w-full grid-cols-[2.5rem_minmax(0,0.7fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-0 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
        {[t.lists.colId, t.lists.colName, t.lists.colPhone, t.lists.colEmail, t.lists.colStatus, t.lists.colSubscription].map((header) => (
          <span key={header} className="text-[11px] font-medium uppercase tracking-wide text-foreground/65">
            {header}
          </span>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-base font-semibold text-foreground">{t.lists.customersEmpty}</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t.lists.customersEmptyDesc}
        </p>
      </div>
    </div>
  )
}

function Pagination({
  total,
  page,
  perPage,
  onChange,
}: {
  total: number
  page: number
  perPage: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let currentPage = Math.max(2, page - 1); currentPage <= Math.min(totalPages - 1, page + 1); currentPage++) {
      pages.push(currentPage)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {getPages().map((item, index) =>
        item === '...' ? (
          <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              item === page ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {item}
          </button>
        ),
      )}
    </div>
  )
}

function SortIcon({ columnId, sortBy }: { columnId: ColumnId; sortBy: CustomerSortValue | null }) {
  const pair = COLUMN_SORT[columnId]
  if (!pair) return null
  if (sortBy !== pair[0] && sortBy !== pair[1]) {
    return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-foreground/35" />
  }
  const descending = sortBy === 'newest' || sortBy.includes('_desc')
  return descending ? (
    <ArrowDown className="h-3.5 w-3.5 shrink-0 text-[#00B4CC]" />
  ) : (
    <ArrowUp className="h-3.5 w-3.5 shrink-0 text-[#00B4CC]" />
  )
}

function renderCell(columnId: ColumnId, customer: CustomerListItem, t: ReturnType<typeof useT>) {
  const customerStatus = normalizeCustomerStatus(customer.userStatus)
  const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)

  switch (columnId) {
    case 'id':
      return (
        <td key={columnId} className={cn(CELL, 'tabular-nums')}>
          {customer.id}
        </td>
      )
    case 'name':
      return (
        <td key={columnId} className={CELL}>
          {customer.fullName}
        </td>
      )
    case 'phone':
      return (
        <td key={columnId} className={CELL}>
          {customer.phoneNumber}
        </td>
      )
    case 'email':
      return (
        <td key={columnId} className={CELL}>
          {customer.email}
        </td>
      )
    case 'status': {
      const badgeText = getCustomerStatusLabel(customerStatus, t.lists)
      return (
        <td key={columnId} className="px-3 py-3">
          <span
            title={badgeText}
            className={cn(
              'inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5',
              CUSTOMER_STATUS_STYLES[customerStatus],
            )}
          >
            {badgeText}
          </span>
        </td>
      )
    }
    case 'subscription':
      return (
        <td key={columnId} className="px-3 py-3">
          <div className="flex min-w-0 items-center gap-1.5">
            {subscriptionStatus === 'expired' ? (
              <Image src="/bitmis-status.svg" width={16} height={16} alt="" className="shrink-0" />
            ) : subscriptionStatus === 'last7days' ? (
              <Image src="/abunelikde-7-gun.svg" width={16} height={16} alt="" className="shrink-0" />
            ) : subscriptionStatus === 'frozen' ? (
              <Image src="/dondurulmus-status.svg" width={16} height={16} alt="" className="shrink-0" />
            ) : subscriptionStatus === 'active' || subscriptionStatus === 'changed' ? (
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00b4cc]/10 text-[#00B4CC]">
                <Check size={10} strokeWidth={2.5} />
              </div>
            ) : null}
            <span className="truncate text-sm font-normal leading-5 text-foreground">
              {getSubscriptionStatusLabel(subscriptionStatus, t.lists)}
            </span>
          </div>
        </td>
      )
  }
}

export function CustomerTable({
  customers,
  isLoading,
  selected,
  onToggleAll,
  onToggleOne,
  onView,
  isSelectingAll = false,
  sortBy = null,
  onSortChange,
}: {
  customers: CustomerListItem[]
  isLoading: boolean
  selected: Set<number>
  onToggleAll: () => void
  onToggleOne: (id: number) => void
  onView: (id: number) => void
  isSelectingAll?: boolean
  sortBy?: CustomerSortValue | null
  onSortChange?: (value: CustomerSortValue | null) => void
}) {
  const t = useT()
  const allOnPage = customers.length > 0 && customers.every((customer) => selected.has(customer.id))
  const someOnPage = customers.some((customer) => selected.has(customer.id))
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  const dragColRef = useRef<ColumnId | null>(null)

  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(DEFAULT_ORDER)

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someOnPage && !allOnPage
    }
  }, [someOnPage, allOnPage])

  const initialWidths = DEFAULT_ORDER.map((id) => DEFAULT_WIDTHS[id])
  const minWidthList = columnOrder.map((id) => MIN_WIDTHS[id])

  const { colWidths, setColWidths, tableRef, handleMouseDown } = useResizableColumns(
    initialWidths,
    minWidthList,
  )

  useEffect(() => {
    const order = loadColumnOrder()
    setColumnOrder(order)
    setColWidths(order.map((id) => DEFAULT_WIDTHS[id]))
  }, [setColWidths])

  // Fill card width: scale all data columns so nothing leaves a trailing gap.
  useLayoutEffect(() => {
    const parent = tableRef.current?.parentElement
    if (!parent) return

    const fill = () => {
      const available = parent.clientWidth - CHECKBOX_COL
      if (available < 400) return
      setColWidths((prev) => {
        const sum = prev.reduce((a, b) => a + b, 0)
        if (sum <= 0 || Math.abs(available - sum) < 8) return prev
        const scale = available / sum
        return prev.map((w, i) => {
          const colId = columnOrder[i]
          const min = colId ? MIN_WIDTHS[colId] : 80
          return Math.max(min, Math.round(w * scale))
        })
      })
    }

    fill()
    const ro = new ResizeObserver(fill)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [setColWidths, tableRef, columnOrder])

  function columnLabel(id: ColumnId) {
    if (id === 'id') return t.lists.colId
    if (id === 'name') return t.lists.colName
    if (id === 'phone') return t.lists.colPhone
    if (id === 'email') return t.lists.colEmail
    if (id === 'status') return t.lists.colStatus
    return t.lists.colSubscription
  }

  function moveColumn(fromId: ColumnId, toId: ColumnId) {
    if (fromId === toId) return
    setColumnOrder((prev) => {
      const next = [...prev]
      const from = next.indexOf(fromId)
      const to = next.indexOf(toId)
      if (from < 0 || to < 0) return prev
      next.splice(from, 1)
      next.splice(to, 0, fromId)
      setColWidths((widths) => {
        const copy = [...widths]
        const [moved] = copy.splice(from, 1)
        copy.splice(to, 0, moved)
        return copy
      })
      try {
        window.localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function handleSortClick(columnId: ColumnId) {
    if (!onSortChange) return
    const pair = COLUMN_SORT[columnId]
    if (!pair) return
    const [first, second] = pair
    if (sortBy === first) onSortChange(second)
    else if (sortBy === second) onSortChange(null)
    else onSortChange(first)
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        {t.lists.customersLoading}
      </div>
    )
  }

  if (customers.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="px-0.5 text-[11px] text-muted-foreground">{t.lists.tableColumnHint}</p>
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table
          ref={tableRef}
          className="w-full border-separate border-spacing-0"
          style={{ tableLayout: 'fixed' }}
        >
          <colgroup>
            <col style={{ width: `${CHECKBOX_COL}px` }} />
            {colWidths.map((w, i) => (
              <col key={columnOrder[i] ?? i} style={{ width: `${w}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-[#cecfd2]/60 bg-[#00B4CC]/[0.08] text-left dark:border-border dark:bg-[#00B4CC]/10">
              <th className="px-3 py-3">
                <div className="flex justify-center">
                  {isSelectingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
                  ) : (
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allOnPage}
                      onChange={onToggleAll}
                      className="h-4 w-4 cursor-pointer rounded accent-[#00B4CC]"
                    />
                  )}
                </div>
              </th>
              {columnOrder.map((columnId, index) => {
                const sortable = Boolean(COLUMN_SORT[columnId])
                const active = COLUMN_SORT[columnId]?.includes(sortBy as CustomerSortValue)

                return (
                  <th
                    key={columnId}
                    onDragOver={(e) => {
                      e.preventDefault()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const from = dragColRef.current
                      dragColRef.current = null
                      if (from) moveColumn(from, columnId)
                    }}
                    className={cn(
                      'relative px-2 py-2.5 text-[11px] font-medium uppercase tracking-wide text-foreground/65',
                      active && 'bg-[#00B4CC]/10 text-foreground/80',
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-1 pr-2">
                      <span
                        draggable
                        onDragStart={(e) => {
                          dragColRef.current = columnId
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onDragEnd={() => {
                          dragColRef.current = null
                        }}
                        className="flex shrink-0 cursor-grab text-foreground/35 active:cursor-grabbing"
                        title={t.lists.tableColumnHint}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </span>
                      <button
                        type="button"
                        disabled={!sortable || !onSortChange}
                        onClick={() => handleSortClick(columnId)}
                        className={cn(
                          'flex min-w-0 flex-1 items-center gap-1 rounded-md px-0.5 text-left uppercase tracking-wide',
                          sortable
                            ? 'cursor-pointer hover:text-foreground'
                            : 'cursor-default',
                        )}
                      >
                        <span className="truncate">{columnLabel(columnId)}</span>
                        <SortIcon columnId={columnId} sortBy={sortBy} />
                      </button>
                    </div>
                    <div
                      onMouseDown={(e) => handleMouseDown(index, e)}
                      className="group/handle absolute bottom-0 right-0 top-0 z-10 flex w-2 cursor-col-resize items-center justify-center transition-colors hover:bg-[#00B4CC]/20"
                    >
                      <div className="h-3.5 w-px rounded bg-[#d0d5dd] transition-colors group-hover/handle:bg-[#00B4CC]" />
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)

              return (
                <tr
                  key={customer.id}
                  onClick={() => onView(customer.id)}
                  className={cn(
                    'cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-slate-50/80',
                    subscriptionStatus === 'changed' ? 'bg-[#f0fdff]' : 'bg-card',
                  )}
                >
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={selected.has(customer.id)}
                        onChange={() => onToggleOne(customer.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded accent-[#00B4CC]"
                      />
                    </div>
                  </td>
                  {columnOrder.map((columnId) => renderCell(columnId, customer, t))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CustomerPagination({
  total,
  page,
  perPage,
  onChange,
}: {
  total: number
  page: number
  perPage: number
  onChange: (p: number) => void
}) {
  return <Pagination total={total} page={page} perPage={perPage} onChange={onChange} />
}
