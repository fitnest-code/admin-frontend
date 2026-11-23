'use client'

import { useLayoutEffect } from 'react'
import Image from 'next/image'
import { Check, Loader2 } from 'lucide-react'
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
} from './customer-list-utils'

const CHECKBOX_COL = 48
const SUBSCRIPTION_MIN = 128
const DEFAULT_WIDTHS = [72, 220, 160, 240, 200]
const MIN_WIDTHS = [52, 120, 110, 140, 120]

function EmptyState() {
  const t = useT()
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid w-full grid-cols-[2.5rem_minmax(0,0.7fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-0 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
        {[t.lists.colId, t.lists.colName, t.lists.colPhone, t.lists.colEmail, t.lists.colStatus, t.lists.colSubscription].map((header) => (
          <span key={header} className="text-[11px] font-medium uppercase tracking-wide text-foreground/70">
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

export function CustomerTable({
  customers,
  isLoading,
  selected,
  onToggleAll,
  onToggleOne,
  onView,
  isSelectingAll = false,
}: {
  customers: CustomerListItem[]
  isLoading: boolean
  selected: Set<number>
  onToggleAll: () => void
  onToggleOne: (id: number) => void
  onView: (id: number) => void
  isSelectingAll?: boolean
}) {
  const t = useT()
  const allOnPage = customers.length > 0 && customers.every((customer) => selected.has(customer.id))

  const { colWidths, setColWidths, tableRef, handleMouseDown } = useResizableColumns(
    DEFAULT_WIDTHS,
    MIN_WIDTHS,
  )

  // Default view: scale resizable columns so checkbox + columns + subscription fill the card width (no trailing gap).
  useLayoutEffect(() => {
    const parent = tableRef.current?.parentElement
    if (!parent) return

    const fill = () => {
      const available = parent.clientWidth - CHECKBOX_COL - SUBSCRIPTION_MIN
      if (available < 400) return
      setColWidths((prev) => {
        const sum = prev.reduce((a, b) => a + b, 0)
        if (sum <= 0 || Math.abs(available - sum) < 8) return prev
        const scale = available / sum
        return prev.map((w, i) => Math.max(MIN_WIDTHS[i] ?? 80, Math.round(w * scale)))
      })
    }

    fill()
    const ro = new ResizeObserver(fill)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [setColWidths, tableRef])

  const resizableHeaders = [
    { label: t.lists.colId, centerAlign: false },
    { label: t.lists.colName, centerAlign: false },
    { label: t.lists.colPhone, centerAlign: false },
    { label: t.lists.colEmail, centerAlign: false },
    { label: t.lists.colStatus, centerAlign: false },
  ]

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
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table
        ref={tableRef}
        className="w-full border-separate border-spacing-0"
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          <col style={{ width: `${CHECKBOX_COL}px` }} />
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}px` }} />
          ))}
          <col />
        </colgroup>
        <thead>
          <tr className="border-b border-[#cecfd2]/60 bg-[#00B4CC]/[0.08] text-left dark:border-border dark:bg-[#00B4CC]/10">
            <th className="px-3 py-3">
              <div className="flex justify-center">
                {isSelectingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
                ) : (
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={onToggleAll}
                    className="h-4 w-4 cursor-pointer rounded accent-[#00B4CC]"
                  />
                )}
              </div>
            </th>
            {resizableHeaders.map((header, index) => (
              <th
                key={index}
                className="relative px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/65"
              >
                {header.label}
                <div
                  onMouseDown={(e) => handleMouseDown(index, e)}
                  className="group/handle absolute bottom-0 right-0 top-0 z-10 flex w-2 cursor-col-resize items-center justify-center transition-colors hover:bg-[#00B4CC]/20"
                >
                  <div className="h-3.5 w-px rounded bg-[#d0d5dd] transition-colors group-hover/handle:bg-[#00B4CC]" />
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-foreground/65">
              {t.lists.colSubscription}
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const customerStatus = normalizeCustomerStatus(customer.userStatus)
            const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)
            const badgeText = getCustomerStatusLabel(customerStatus, t.lists)

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
                <td className="truncate px-3 py-3 text-sm tabular-nums text-foreground/80">
                  {customer.id}
                </td>
                <td className="truncate px-3 py-3 text-sm font-medium text-foreground">
                  {customer.fullName}
                </td>
                <td className="truncate px-3 py-3 text-sm text-foreground/80">
                  {customer.phoneNumber}
                </td>
                <td className="truncate px-3 py-3 text-sm text-foreground/80">
                  {customer.email}
                </td>
                <td className="px-3 py-3">
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
                <td className="px-3 py-3">
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
                    <span className="truncate text-xs text-foreground/75">
                      {getSubscriptionStatusLabel(subscriptionStatus, t.lists)}
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
