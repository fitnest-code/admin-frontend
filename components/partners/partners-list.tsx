'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Eye, Search, ChevronDown, Bell, MessageSquare, Mail, Upload, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomersQuery, type CustomerListItem } from '@/modules/customers'
import { PAGE_SIZE } from '../customers/list/customer-list-constants'
import { CustomerBulkActions, EmailModal, PushModal, SmsModal, BlockModal } from '../customers/list/customer-message-modals'
import { CustomerPagination } from '../customers/list/customer-list-table'
import { normalizeCustomerStatus } from '../customers/list/customer-list-utils'

const PARTNER_SORT_OPTIONS = [
  { value: 'newest', label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc', label: 'Ad: A-Z' },
  { value: 'name_desc', label: 'Ad: Z-A' },
  { value: 'registrationDate_desc', label: 'Qeydiyyat tarixi (yeni → köhnə)' },
  { value: 'registrationDate_asc', label: 'Qeydiyyat tarixi (köhnə → yeni)' },
] as const

type PartnerSortValue = typeof PARTNER_SORT_OPTIONS[number]['value']

function getRoleLabel(role?: string | null) {
  if (role === 'ROLE_GYM_SUPER_ADMIN') return 'Super admin'
  if (role === 'ROLE_GYM_ADMIN') return 'Admin'
  return role || 'İstifadəçi'
}

function SortDropdown({
  value,
  onChange,
}: {
  value: PartnerSortValue | null
  onChange: (v: PartnerSortValue | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const current = PARTNER_SORT_OPTIONS.find((option) => option.value === value)

  return (
    <div className="relative font-sans" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-[#00B4CC] transition-all duration-200 shadow-sm"
      >
        {current ? current.label : 'Sırala'}
        <ChevronDown size={14} className={cn('transition-transform text-muted-foreground', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Sırala</p>
          {PARTNER_SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                value === option.value && 'text-[#00B4CC] font-medium',
              )}
            >
              <Check size={13} className={cn('shrink-0', value === option.value ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PartnersList() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<PartnerSortValue | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
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

  const partnersQuery = useCustomersQuery({
    page: page - 1,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort: sortBy || undefined,
    roles: ['ROLE_GYM_ADMIN', 'ROLE_GYM_SUPER_ADMIN'],
  })

  const partners = partnersQuery.data?.items ?? []
  
  const sorted = useMemo(() => {
    const list = [...partners]
    if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''))
    } else if (sortBy === 'name_desc') {
      list.sort((a, b) => (b.fullName ?? '').localeCompare(a.fullName ?? ''))
    }
    return list
  }, [partners, sortBy])

  useEffect(() => {
    setSelected(new Set())
  }, [page, search])

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      const allOnPage = sorted.length > 0 && sorted.every((partner) => prev.has(partner.id))

      if (allOnPage) sorted.forEach((partner) => next.delete(partner.id))
      else sorted.forEach((partner) => next.add(partner.id))

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

  const total = partnersQuery.data?.total ?? 0
  const allOnPage = sorted.length > 0 && sorted.every((partner) => selected.has(partner.id))

  return (
    <div className="flex flex-col gap-5 font-sans">
      <h1 className="text-xl font-bold text-foreground">Partnyorlar</h1>

      {/* Search and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış....."
            className="h-[40px] w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm font-medium outline-none focus:border-[#00B4CC] transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <SortDropdown value={sortBy} onChange={(val) => {
            setSortBy(val)
            setPage(1)
          }} />
        </div>
      </div>

      {/* Bulk actions */}
      <CustomerBulkActions 
        selectedCount={selected.size} 
        onOpenPush={() => setPushOpen(true)} 
        onOpenSms={() => setSmsOpen(true)} 
        onOpenEmail={() => setEmailOpen(true)}
        onOpenBlock={() => setBlockOpen(true)}
      />

      {/* Table */}
      {partnersQuery.isLoading ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground animate-pulse">
          Partnyorlar yüklənir...
        </div>
      ) : sorted.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1fr_6rem_7rem_3rem] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
            <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
            {['ID', 'Ad / Soyad', 'Telefon', 'Email', 'Profil statusu', 'Rol', 'Ətraflı'].map((header) => (
              <span key={header} className="text-[11px] font-medium uppercase text-foreground/80">
                {header}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-base font-semibold text-foreground">Hələ partnyor yoxdur</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Partnyorlar qeydiyyatdan keçdikdən sonra burada avtomatik görünəcək.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1fr_6rem_7rem_3rem] items-center gap-3 border-b border-[#cecfd2]/60 dark:border-border bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 px-4 py-3 rounded-t-lg">
            <div className="flex justify-center">
              <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded" />
            </div>
            <span className="text-[11px] font-bold uppercase text-foreground/80">ID</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Ad / Soyad</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Telefon</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Email</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80 text-center">Status</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Rol</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80 text-center">Ətraflı</span>
          </div>
          {sorted.map((partner) => {
            const status = normalizeCustomerStatus(partner.userStatus)
            
            // Account Status Badge Logic
            const badgeBg = status === 'active' ? 'bg-[#166728]' : status === 'inactive' ? 'bg-[#94979c]' : 'bg-[#c9373a]'
            const badgeText = status === 'active' ? 'Aktiv' : status === 'inactive' ? 'Deaktiv' : 'Blok'

            // Role Badge Logic
            const isSuper = partner.role === 'ROLE_GYM_SUPER_ADMIN'
            const roleBadgeClass = isSuper 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-teal-50 text-teal-700 border border-teal-200'

            return (
              <div
                key={partner.id}
                className={cn(
                  'grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1fr_6rem_7rem_3rem] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/40 transition-all duration-200 bg-card'
                )}
              >
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={selected.has(partner.id)}
                    onChange={() => toggleOne(partner.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
                  />
                </div>
                <span className="text-sm font-normal text-black truncate">{partner.id}</span>
                <span className="text-sm font-normal text-black truncate">
                  {partner.fullName}
                </span>
                <span className="text-sm font-normal text-black truncate">{partner.phoneNumber}</span>
                <span className="text-sm font-normal text-black truncate">{partner.email}</span>
                <div className="flex justify-center">
                  <div className={cn('inline-flex h-[22px] w-fit items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-medium uppercase shadow-xs text-white', badgeBg)}>
                    <div className="w-1 h-1 rounded-full bg-white shrink-0" />
                    <span>{badgeText}</span>
                  </div>
                </div>
                <div>
                  <span className={cn('inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', roleBadgeClass)}>
                    {getRoleLabel(partner.role)}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/partners/${partner.id}`)}
                  className="text-muted-foreground hover:text-[#00B4CC] transition-colors flex justify-center"
                  aria-label="Ətraflı bax"
                >
                  <Eye size={18} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {partnersQuery.isError && (
        <p className="text-sm text-red-500">Partnyor siyahısı yüklənmədi. Zəhmət olmasa yenidən cəhd edin.</p>
      )}

      <CustomerPagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {pushOpen && <PushModal selectedUsers={Array.from(selected).map(id => sorted.find(c => c.id === id)).filter(Boolean) as any[]} onClose={() => setPushOpen(false)} />}
      {smsOpen && <SmsModal selectedUsers={Array.from(selected).map(id => sorted.find(c => c.id === id)).filter(Boolean) as any[]} onClose={() => setSmsOpen(false)} />}
      {emailOpen && <EmailModal selectedUsers={Array.from(selected).map(id => sorted.find(c => c.id === id)).filter(Boolean) as any[]} onClose={() => setEmailOpen(false)} />}
      {blockOpen && (
        <BlockModal 
          selectedUsers={Array.from(selected).map(id => sorted.find(c => c.id === id)).filter(Boolean) as any[]} 
          onClose={() => setBlockOpen(false)} 
          onSuccess={() => {
            partnersQuery.refetch()
            setSelected(new Set())
          }}
        />
      )}
    </div>
  )
}
