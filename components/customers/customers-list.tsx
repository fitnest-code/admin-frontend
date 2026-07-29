'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n'
import {
  useCustomersQuery,
  useSubscriptionPackageNamesQuery,
  useUserStatisticsQuery,
  type CustomerSubscriptionType,
  getCustomers,
  type CustomerListItem,
} from '@/modules/customers'
import { PAGE_SIZE } from './list/customer-list-constants'
import { CustomerFilters, CustomerStats } from './list/customer-list-controls'
import { CustomerBulkActions, EmailModal, PushModal, SmsModal, BlockModal } from './list/customer-message-modals'
import { CustomerPagination, CustomerTable } from './list/customer-list-table'
import {
  sortCustomers,
  type CustomerSortValue,
  normalizeCustomerStatus,
  normalizeSubscriptionStatus,
  getSubscriptionStatusLabel,
} from './list/customer-list-utils'

export function CustomersList() {
  const router = useRouter()
  const t = useT()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortValue | null>(null)
  const [pkg, setPkg] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [subStatus, setSubStatus] = useState<Exclude<CustomerSubscriptionType, 'ALL'> | null>(null)
  const [selected, setSelected] = useState<Map<number, CustomerListItem>>(new Map())
  const [isSelectingAll, setIsSelectingAll] = useState(false)
  const [page, setPage] = useState(1)
  const [pushOpen, setPushOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const customersQuery = useCustomersQuery({
    page: page - 1,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    packageId: pkg ?? undefined,
    packageDuration: duration ?? undefined,
    subscriptionStatus: subStatus ?? undefined,
    sort: sortBy ?? undefined,
    roles: ['ROLE_USER'],
  })
  const packageNamesQuery = useSubscriptionPackageNamesQuery()
  const statisticsQuery = useUserStatisticsQuery()
  const customers = customersQuery.data?.items ?? []
  const sorted = useMemo(() => sortCustomers(customers, sortBy), [customers, sortBy])

  useEffect(() => {
    setSelected(new Map())
  }, [page, search, pkg, duration, subStatus])

  async function toggleAll() {
    const allOnPage = sorted.length > 0 && sorted.every((customer) => selected.has(customer.id))

    if (allOnPage) {
      setSelected((prev) => {
        const next = new Map(prev)
        sorted.forEach((customer) => next.delete(customer.id))
        return next
      })
    } else {
      setIsSelectingAll(true)
      try {
        const res = await getCustomers({
          page: 0,
          size: 100000, // Fetch all matching users matching search & filters
          search: debouncedSearch || undefined,
          packageId: pkg ?? undefined,
          packageDuration: duration ?? undefined,
          subscriptionStatus: subStatus ?? undefined,
          sort: sortBy ?? undefined,
          roles: ['ROLE_USER'],
        })
        const allItems = res?.items ?? []
        setSelected((prev) => {
          const next = new Map(prev)
          allItems.forEach((customer) => {
            next.set(customer.id, customer)
          })
          return next
        })
      } catch (err) {
        console.error("Failed to select all customers:", err)
      } finally {
        setIsSelectingAll(false)
      }
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        const customer = sorted.find((c) => c.id === id)
        if (customer) {
          next.set(id, customer)
        }
      }
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

  const selectedUsers = useMemo(() => {
    return Array.from(selected.values())
  }, [selected])

  const blockMode = useMemo(() => {
    if (selectedUsers.length === 0) return 'disabled'
    const allBlocked = selectedUsers.every((u) => normalizeCustomerStatus(u.userStatus) === 'blocked')
    const allNonBlocked = selectedUsers.every((u) => normalizeCustomerStatus(u.userStatus) !== 'blocked')
    if (allBlocked) return 'unblock'
    if (allNonBlocked) return 'block'
    return 'disabled'
  }, [selectedUsers])

  function handleExport() {
    if (selected.size === 0) return

    const selectedList = Array.from(selected.values())
    const csvRows = [
      ['ID', 'Ad / Soyad', 'Telefon', 'Email', 'Status', 'Abunəlik'],
      ...selectedList.map((u) => [
        u.id,
        u.fullName || '',
        u.phoneNumber || '',
        u.email || '',
        getCustomerStatusLabel(normalizeCustomerStatus(u.userStatus), t.lists),
        getSubscriptionStatusLabel(normalizeSubscriptionStatus(u.subscriptionStatus), t.lists),
      ]),
    ]

    const csvContent = csvRows
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `customers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-foreground">{t.lists.customersTitle}</h1>

      <CustomerStats
        total={stats.total}
        last7={stats.last7}
        expired={stats.expired}
        active={stats.active}
        selectedStatus={subStatus}
        onStatusClick={(status) => {
          setSubStatus(status)
          setPage(1)
        }}
      />

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

      <CustomerBulkActions 
        selectedCount={selected.size} 
        onOpenPush={() => setPushOpen(true)} 
        onOpenSms={() => setSmsOpen(true)} 
        onOpenEmail={() => setEmailOpen(true)}
        onOpenBlock={() => setBlockOpen(true)}
        blockMode={blockMode}
        onExport={handleExport}
      />

      <CustomerTable
        customers={sorted}
        isLoading={customersQuery.isLoading}
        selected={new Set(selected.keys())}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onView={(id) => router.push(`/customers/${id}`)}
        isSelectingAll={isSelectingAll}
      />

      {customersQuery.isError && (
        <p className="text-sm text-red-500">{t.lists.customersError}</p>
      )}
      {packageNamesQuery.isError && (
        <p className="text-sm text-red-500">{t.lists.packagesError}</p>
      )}
      {packageNamesQuery.isLoading && (
        <p className="text-xs text-muted-foreground">{t.lists.packagesLoading}</p>
      )}

      <CustomerPagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {pushOpen && <PushModal selectedUsers={selectedUsers} onClose={() => setPushOpen(false)} />}
      {smsOpen && <SmsModal selectedUsers={selectedUsers} onClose={() => setSmsOpen(false)} />}
      {emailOpen && <EmailModal selectedUsers={selectedUsers} onClose={() => setEmailOpen(false)} />}
      {blockOpen && (
        <BlockModal 
          selectedUsers={selectedUsers} 
          mode={blockMode === 'unblock' ? 'unblock' : 'block'}
          onClose={() => setBlockOpen(false)} 
          onSuccess={() => {
            customersQuery.refetch()
            setSelected(new Map())
          }}
        />
      )}
    </div>
  )
}
