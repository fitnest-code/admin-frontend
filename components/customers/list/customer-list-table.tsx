'use client'

import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerListItem } from '@/modules/customers'
import {
  CUSTOMER_STATUS_STYLES,
  SUBSCRIPTION_STATUS_TEXT_STYLES,
  getCustomerStatusLabel,
  getSubscriptionStatusLabel,
  normalizeCustomerStatus,
  normalizeSubscriptionStatus,
} from './customer-list-utils'

function EmptyState() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem_2.5rem] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
        {['ID', 'Ad / Soyad', 'Telefon', 'Email', 'Status', 'Abunəlik', 'Ətraflı'].map((header) => (
          <span key={header} className="text-xs font-semibold text-foreground">
            {header}
          </span>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-base font-semibold text-foreground">Hələ istifadəçi yoxdur</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          İstifadəçilər qeydiyyatdan keçdikdən sonra burada avtomatik görünəcək.
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
}: {
  customers: CustomerListItem[]
  isLoading: boolean
  selected: Set<number>
  onToggleAll: () => void
  onToggleOne: (id: number) => void
  onView: (id: number) => void
}) {
  const allOnPage = customers.length > 0 && customers.every((customer) => selected.has(customer.id))

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        Müştərilər yüklənir...
      </div>
    )
  }

  if (customers.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem_2.5rem] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <input type="checkbox" checked={allOnPage} onChange={onToggleAll} className="h-4 w-4 accent-[#00B4CC]" />
        <span className="text-xs font-semibold text-foreground">ID</span>
        <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
        <span className="text-xs font-semibold text-foreground">Telefon</span>
        <span className="text-xs font-semibold text-foreground">Email</span>
        <span className="text-xs font-semibold text-foreground">Status</span>
        <span className="text-xs font-semibold text-foreground">Abunəlik</span>
        <span className="text-xs font-semibold text-foreground">Ətraflı</span>
      </div>
      {customers.map((customer) => {
        const customerStatus = normalizeCustomerStatus(customer.status)
        const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)

        return (
          <div
            key={customer.id}
            className="grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem_2.5rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/30 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.has(customer.id)}
              onChange={() => onToggleOne(customer.id)}
              onClick={(event) => event.stopPropagation()}
              className="h-4 w-4 accent-[#00B4CC]"
            />
            <span className="text-xs text-muted-foreground font-mono truncate">{customer.id}</span>
            <span className="text-sm font-medium text-foreground truncate">
              {[customer.name, customer.surname].filter(Boolean).join(' ') || '-'}
            </span>
            <span className="text-sm text-muted-foreground truncate">{customer.phoneNumber ?? '-'}</span>
            <span className="text-sm text-muted-foreground truncate">{customer.email ?? '-'}</span>
            <span
              className={cn(
                'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                CUSTOMER_STATUS_STYLES[customerStatus],
              )}
            >
              {getCustomerStatusLabel(customerStatus)}
            </span>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0',
                  subscriptionStatus === 'active'
                    ? 'bg-[#00B4CC]'
                    : subscriptionStatus === 'expired'
                      ? 'bg-red-500'
                      : subscriptionStatus === 'changed'
                        ? 'bg-orange-400'
                        : subscriptionStatus === 'last7days'
                          ? 'bg-[#00B4CC]'
                          : 'bg-muted',
                )}
              />
              <span className={cn('text-xs truncate', SUBSCRIPTION_STATUS_TEXT_STYLES[subscriptionStatus])}>
                {getSubscriptionStatusLabel(subscriptionStatus)}
              </span>
            </div>
            <button
              onClick={() => onView(customer.id)}
              className="text-muted-foreground hover:text-[#00B4CC] transition-colors"
              aria-label="Ətraflı bax"
            >
              <Eye size={16} />
            </button>
          </div>
        )
      })}
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
