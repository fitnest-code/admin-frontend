'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useCustomersQuery,
  useSubscriptionPackageNamesQuery,
  useUserStatisticsQuery,
  type CustomerSubscriptionType,
} from '@/modules/customers'
import { PAGE_SIZE } from './list/customer-list-constants'
import { CustomerFilters, CustomerStats } from './list/customer-list-controls'
import { CustomerBulkActions, PushModal, SmsModal } from './list/customer-message-modals'
import { CustomerPagination, CustomerTable } from './list/customer-list-table'
import { sortCustomers, type CustomerSortValue } from './list/customer-list-utils'

export function CustomersList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortValue | null>(null)
  const [pkg, setPkg] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [subStatus, setSubStatus] = useState<Exclude<CustomerSubscriptionType, 'all'> | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [pushOpen, setPushOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const customersQuery = useCustomersQuery({
    page: page - 1,
    size: PAGE_SIZE,
    query: debouncedSearch || undefined,
    packageID: pkg ?? undefined,
    durationMonths: duration ?? undefined,
    type: subStatus ?? undefined,
  })
  const packageNamesQuery = useSubscriptionPackageNamesQuery()
  const statisticsQuery = useUserStatisticsQuery()
  const customers = customersQuery.data?.items ?? []
  const sorted = useMemo(() => sortCustomers(customers, sortBy), [customers, sortBy])

  useEffect(() => {
    setSelected(new Set())
  }, [page, search, pkg, duration, subStatus])

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      const allOnPage = sorted.length > 0 && sorted.every((customer) => prev.has(customer.id))

      if (allOnPage) sorted.forEach((customer) => next.delete(customer.id))
      else sorted.forEach((customer) => next.add(customer.id))

      return next
    })
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const total = customersQuery.data?.total ?? 0
  const stats = {
    total: statisticsQuery.data?.totalUsers ?? total,
    last7: statisticsQuery.data?.usersWithLast7Days ?? 0,
    expired: statisticsQuery.data?.finishedSubscriptions ?? 0,
    active: statisticsQuery.data?.activeOrFrozenSubscriptions ?? 0,
  }
  const packageOptions = packageNamesQuery.data ?? []

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-foreground">Müştərilər</h1>

      <CustomerStats total={stats.total} last7={stats.last7} expired={stats.expired} active={stats.active} />

      <CustomerFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        packageOptions={packageOptions}
        selectedPackageId={pkg}
        onPackageChange={(value) => {
          setPkg(value)
          setPage(1)
        }}
        duration={duration}
        onDurationChange={(value) => {
          setDuration(value)
          setPage(1)
        }}
        subscriptionStatus={subStatus}
        onSubscriptionStatusChange={(value) => {
          setSubStatus(value)
          setPage(1)
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <CustomerBulkActions selectedCount={selected.size} onOpenPush={() => setPushOpen(true)} onOpenSms={() => setSmsOpen(true)} />

      <CustomerTable
        customers={sorted}
        isLoading={customersQuery.isLoading}
        selected={selected}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onView={(id) => router.push(`/customers/${id}`)}
      />

      {customersQuery.isError && (
        <p className="text-sm text-red-500">Müştəri siyahısı yüklənmədi. Zəhmət olmasa yenidən cəhd edin.</p>
      )}
      {packageNamesQuery.isError && (
        <p className="text-sm text-red-500">Paket adları yüklənmədi. Paket filteri müvəqqəti boş ola bilər.</p>
      )}
      {packageNamesQuery.isLoading && (
        <p className="text-xs text-muted-foreground">Paket adları yüklənir...</p>
      )}

      <CustomerPagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {pushOpen && <PushModal onClose={() => setPushOpen(false)} />}
      {smsOpen && <SmsModal onClose={() => setSmsOpen(false)} />}
    </div>
  )
}
