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
import styles from './partners-list.module.css'

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

function CustomCheckbox({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange()
      }}
      disabled={disabled}
      className={cn(
        'relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 outline-none cursor-pointer',
        checked 
          ? 'bg-[#00B4CC] border-[#00B4CC]' 
          : 'bg-white border-[#cecfd2] hover:border-[#00B4CC]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {checked && (
        <Check size={10} className="text-white font-bold animate-in zoom-in-50 duration-100" strokeWidth={3} />
      )}
    </button>
  )
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
          <div className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1.2fr_1.5fr] items-center gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
            <div className="flex justify-center">
              <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
            </div>
            {['ID', 'Ad / Soyad', 'Rol', 'Telefon', 'Zal adı'].map((header) => (
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
          <div className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1.2fr_1.5fr] items-center gap-3 border-b border-[#cecfd2]/60 dark:border-border bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 px-4 py-3 rounded-t-lg">
            <div className="flex justify-center">
              <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded" />
            </div>
            <span className="text-[11px] font-bold uppercase text-foreground/80">ID</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Ad / Soyad</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Rol</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Telefon</span>
            <span className="text-[11px] font-bold uppercase text-foreground/80">Zal adı</span>
          </div>

          {sorted.map((partner) => {
            const isSuper = partner.role === 'ROLE_GYM_SUPER_ADMIN'
            const gymName = partner.gymName || '-'

            return (
              <div
                key={partner.id}
                className="grid grid-cols-[3rem_3.5rem_1.5fr_1fr_1.2fr_1.5fr] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-secondary/40 transition-all duration-200 bg-card cursor-pointer"
                onClick={() => router.push(`/partners/${partner.id}`)}
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
                <span className="text-sm font-normal text-black truncate" title={partner.fullName || ''}>
                  {partner.fullName}
                </span>
                
                <div className="flex items-center">
                  <div className={cn("flex h-[22px] w-fit items-center justify-center gap-1.5 rounded-full px-3 text-[10px] font-medium uppercase text-white shadow-xs", isSuper ? "bg-[#00B4CC]" : "bg-[#00B4CC]/80")}>
                    <Image 
                      src={isSuper ? "/superAdmin.svg" : "/admin.svg"} 
                      width={isSuper ? 12 : 11} 
                      height={isSuper ? 9 : 10} 
                      alt="" 
                      className="shrink-0 invert"
                    />
                    <span>{isSuper ? 'Super admin' : 'Admin'}</span>
                  </div>
                </div>

                <span className="text-sm font-normal text-black truncate">
                  {partner.phoneNumber || '+994 00 000 00 00'}
                </span>

                <span className="text-sm font-normal text-black truncate" title={gymName}>
                  {gymName}
                </span>
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
