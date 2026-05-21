'use client'

import Image from 'next/image'
import { Check, Eye } from 'lucide-react'
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem_2.5rem] items-center gap-3 border-b border-[#cecfd2]/60 dark:border-border bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 px-4 py-4 rounded-t-xl">
        <input type="checkbox" checked={allOnPage} onChange={onToggleAll} className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded" />
        <span className="text-xs font-semibold text-foreground">ID</span>
        <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
        <span className="text-xs font-semibold text-foreground">Telefon</span>
        <span className="text-xs font-semibold text-foreground">Email</span>
        <span className="text-xs font-semibold text-foreground">Status</span>
        <span className="text-xs font-semibold text-foreground">Abunəlik</span>
        <span className="text-xs font-semibold text-foreground">Ətraflı</span>
      </div>
      {customers.map((customer) => {
        const customerStatus = normalizeCustomerStatus(customer.userStatus)
        const subscriptionStatus = normalizeSubscriptionStatus(customer.subscriptionStatus)

        let badgeBg = 'bg-[#166728]'
        let badgeText = 'Aktiv'
        if (subscriptionStatus === 'expired') {
          badgeBg = 'bg-[#c9373a]'
          badgeText = 'Bitib'
        } else if (subscriptionStatus === 'last7days' || customerStatus === 'inactive') {
          badgeBg = 'bg-[#94979c]'
          badgeText = 'Deaktiv'
        } else if (customerStatus === 'blocked') {
          badgeBg = 'bg-[#c9373a]'
          badgeText = 'Blok'
        }

        return (
          <div
            key={customer.id}
            className={cn(
              'grid grid-cols-[2rem_4rem_1fr_1fr_1fr_5rem_6rem_2.5rem] items-center gap-3 border-b border-border px-4 py-4 last:border-0 hover:bg-secondary/40 transition-all duration-200',
              subscriptionStatus === 'changed' ? 'bg-[#f0fdff] dark:bg-[#00b4cc]/[0.02]' : 'bg-card',
            )}
          >
            <input
              type="checkbox"
              checked={selected.has(customer.id)}
              onChange={() => onToggleOne(customer.id)}
              onClick={(event) => event.stopPropagation()}
              className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
            />
            <span className="text-sm font-medium text-foreground truncate">{customer.id}</span>
            <span className="text-sm font-medium text-foreground truncate">
              {customer.fullName ?? '-'}
            </span>
            <span className="text-sm font-medium text-foreground truncate">{customer.phoneNumber ?? '-'}</span>
            <span className="text-sm font-medium text-foreground truncate">{customer.email ?? '-'}</span>
            <div className={cn('inline-flex h-6 w-fit items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-white shadow-xs', badgeBg)}>
              <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
              <span>{badgeText}</span>
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
              <span className="text-xs font-medium text-foreground truncate">
                {getSubscriptionStatusLabel(subscriptionStatus)}
              </span>
            </div>
            <button
              onClick={() => onView(customer.id)}
              className="text-muted-foreground hover:text-[#00B4CC] transition-colors"
              aria-label="Ətraflı bax"
            >
              <Eye size={18} />
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
