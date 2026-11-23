'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import type { CustomerListItem } from '@/modules/customers'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'
import {
  CUSTOMER_STATUS_STYLES,
  getCustomerStatusLabel,
  getSubscriptionStatusLabel,
  normalizeCustomerStatus,
  normalizeSubscriptionStatus,
  type CustomerSortValue,
} from './customer-list-utils'

type ColumnId = 'id' | 'name' | 'phone' | 'email' | 'status' | 'subscription'

/** Column header click cycles these API sort pairs (server-paginated). */
const COLUMN_SORT: Partial<Record<ColumnId, [CustomerSortValue, CustomerSortValue]>> = {
  id: ['registrationDate_desc', 'registrationDate_asc'],
  name: ['name_asc', 'name_desc'],
  subscription: ['finishDate_asc', 'finishDate_desc'],
}

function sortStateFor(
  columnId: ColumnId,
  sortBy: CustomerSortValue | null,
): 'asc' | 'desc' | 'none' {
  const pair = COLUMN_SORT[columnId]
  if (!pair || !sortBy) return 'none'
  if (sortBy === pair[0] || sortBy === pair[1]) {
    return sortBy.includes('_asc') ? 'asc' : 'desc'
  }
  return 'none'
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

  function cycleSort(columnId: ColumnId) {
    if (!onSortChange) return
    const pair = COLUMN_SORT[columnId]
    if (!pair) return
    const [first, second] = pair
    if (sortBy === first) onSortChange(second)
    else if (sortBy === second) onSortChange(null)
    else onSortChange(first)
  }

  const columns: AdminDataTableColumn<CustomerListItem>[] = [
    {
      id: 'id',
      label: t.lists.colId,
      defaultWidth: 88,
      minWidth: 56,
      maxWidth: 160,
      sortable: true,
      sortState: sortStateFor('id', sortBy),
      onSort: () => cycleSort('id'),
      render: (row) => <span className="block truncate tabular-nums">{row.id}</span>,
    },
    {
      id: 'name',
      label: t.lists.colName,
      defaultWidth: 200,
      minWidth: 120,
      maxWidth: 420,
      flex: true,
      sortable: true,
      sortState: sortStateFor('name', sortBy),
      onSort: () => cycleSort('name'),
      render: (row) => <span className="block truncate">{row.fullName}</span>,
    },
    {
      id: 'phone',
      label: t.lists.colPhone,
      defaultWidth: 160,
      minWidth: 110,
      maxWidth: 280,
      render: (row) => <span className="block truncate">{row.phoneNumber}</span>,
    },
    {
      id: 'email',
      label: t.lists.colEmail,
      defaultWidth: 220,
      minWidth: 140,
      maxWidth: 420,
      flex: true,
      render: (row) => <span className="block truncate">{row.email}</span>,
    },
    {
      id: 'status',
      label: t.lists.colStatus,
      defaultWidth: 180,
      minWidth: 120,
      maxWidth: 320,
      render: (row) => {
        const status = normalizeCustomerStatus(row.userStatus)
        const badgeText = getCustomerStatusLabel(status, t.lists)
        return (
          <span
            title={badgeText}
            className={cn(
              'inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-5',
              CUSTOMER_STATUS_STYLES[status],
            )}
          >
            {badgeText}
          </span>
        )
      },
    },
    {
      id: 'subscription',
      label: t.lists.colSubscription,
      defaultWidth: 140,
      minWidth: 110,
      maxWidth: 280,
      sortable: true,
      sortState: sortStateFor('subscription', sortBy),
      onSort: () => cycleSort('subscription'),
      render: (row) => {
        const subscriptionStatus = normalizeSubscriptionStatus(row.subscriptionStatus)
        return (
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
            <span className="truncate">
              {getSubscriptionStatusLabel(subscriptionStatus, t.lists)}
            </span>
          </div>
        )
      },
    },
  ]

  return (
    <AdminDataTable
      storageKey="customers"
      columns={columns}
      rows={customers}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      emptyTitle={t.lists.customersEmpty}
      emptyDescription={t.lists.customersEmptyDesc}
      onRowClick={(row) => onView(row.id)}
      selection={{
        headerChecked: allOnPage,
        headerIndeterminate: someOnPage && !allOnPage,
        onToggleAll,
        isSelectingAll,
        isRowSelected: (id) => selected.has(Number(id)),
        onToggleRow: (id) => onToggleOne(Number(id)),
      }}
    />
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
