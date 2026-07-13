'use client'

import Image from 'next/image'
import { Check, Eye, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
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
  const t = useT()
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
        {[t.lists.colId, t.lists.colName, t.lists.colPhone, t.lists.colEmail, t.lists.colStatus, t.lists.colSubscription].map((header) => (
          <span key={header} className="text-[11px] font-medium uppercase text-foreground/80">
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
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1fr_6rem_7rem] items-center gap-3 border-b border-[#cecfd2]/60 dark:border-border bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 px-4 py-3 rounded-t-lg">
        <div className="flex justify-center">
          {isSelectingAll ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
          ) : (
            <input type="checkbox" checked={allOnPage} onChange={onToggleAll} className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded" />
          )}
        </div>
        <span className="text-[11px] font-bold uppercase text-foreground/80">{t.lists.colId}</span>
        <span className="text-[11px] font-bold uppercase text-foreground/80">{t.lists.colName}</span>
        <span className="text-[11px] font-bold uppercase text-foreground/80">{t.lists.colPhone}</span>
        <span className="text-[11px] font-bold uppercase text-foreground/80">{t.lists.colEmail}</span>
        <span className="text-[11px] font-bold uppercase text-foreground/80 text-center">{t.lists.colStatus}</span>
        <span className="text-[11px] font-bold uppercase text-foreground/80">{t.lists.colSubscription}</span>
      </div>
      {customers.map((customer) => {
        const customerStatus = normalizeCustomerStatus(customer.userStatus)
        const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)

        // Account Status Badge Logic
        const badgeBg = customerStatus === 'active' ? 'bg-[#166728]' : customerStatus === 'inactive' ? 'bg-[#94979c]' : 'bg-[#c9373a]'
        const badgeText = customerStatus === 'active' ? t.lists.statusActive : customerStatus === 'inactive' ? t.lists.statusInactive : t.lists.statusBlocked

        return (
          <div
            key={customer.id}
            onClick={() => onView(customer.id)}
            className={cn(
              'grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1fr_6rem_7rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/40 transition-all duration-200 cursor-pointer',
              subscriptionStatus === 'changed' ? 'bg-[#f0fdff]' : 'bg-card',
            )}
          >
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={selected.has(customer.id)}
                onChange={() => onToggleOne(customer.id)}
                onClick={(event) => event.stopPropagation()}
                className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
              />
            </div>
            <span className="text-sm font-normal text-black truncate">{customer.id}</span>
            <span className="text-sm font-normal text-black truncate">
              {customer.fullName}
            </span>
            <span className="text-sm font-normal text-black truncate">{customer.phoneNumber}</span>
            <span className="text-sm font-normal text-black truncate">{customer.email}</span>
            <div className="flex justify-center">
              <div className={cn('inline-flex h-[22px] w-fit items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-medium uppercase shadow-xs', badgeBg)}>
                <div className="w-1 h-1 rounded-full bg-white shrink-0" />
                <span>{badgeText}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {subscriptionStatus === 'expired' ? (
                <Image src="/bitmis-status.svg" width={16} height={16} alt="" className="shrink-0" />
              ) : subscriptionStatus === 'last7days' ? (
                <Image src="/abunelikde-7-gun.svg" width={16} height={16} alt="" className="shrink-0" />
              ) : subscriptionStatus === 'frozen' ? (
                <Image src="/dondurulmus-status.svg" width={16} height={16} alt="" className="shrink-0" />
              ) : subscriptionStatus === 'active' || subscriptionStatus === 'changed' ? (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00b4cc]/10 text-[#00B4CC]">
                  <Check size={10} strokeWidth={2.5} />
                </div>
              ) : null}
              <span className="text-xs font-normal text-black truncate">
                {getSubscriptionStatusLabel(subscriptionStatus, t.lists)}
              </span>
            </div>
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
