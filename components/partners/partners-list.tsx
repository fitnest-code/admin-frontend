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
        'relative flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-all duration-200 outline-none cursor-pointer',
        checked 
          ? 'bg-[#00B4CC] border-[#00B4CC]' 
          : 'bg-white border-[#cecfd2] hover:border-[#00B4CC]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {checked && (
        <Check size={14} className="text-white font-bold animate-in zoom-in-50 duration-100" strokeWidth={3} />
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
        <div className={styles.musteriParent}>
          <div className={styles.musteri}>
            <div className={styles.tickSquareParent}>
              <div className={styles.tickSquare}>
                <CustomCheckbox checked={false} onChange={() => {}} disabled />
              </div>
              <div className={styles.adsoyad}>Ad/Soyad</div>
            </div>
            <div className={styles.rolWrapper}>
              <div className={styles.adsoyad}>Rol</div>
            </div>
            <div className={styles.rolWrapper}>
              <div className={styles.adsoyad}>Telefon</div>
            </div>
            <div className={styles.zalAdWrapper}>
              <div className={styles.adsoyad}>Zal adı</div>
            </div>
            <div className={styles.traflWrapper}>
              <div className={styles.adsoyad}>Ətraflı</div>
            </div>
          </div>
          <div className={styles.emptyStateContainer}>
            <p className="text-base font-semibold text-foreground">Hələ partnyor yoxdur</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Partnyorlar qeydiyyatdan keçdikdən sonra burada avtomatik görünəcək.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.musteriParent}>
          <div className={styles.musteri}>
            <div className={styles.tickSquareParent}>
              <div className={styles.tickSquare}>
                <CustomCheckbox checked={allOnPage} onChange={toggleAll} />
              </div>
              <div className={styles.adsoyad}>Ad/Soyad</div>
            </div>
            <div className={styles.rolWrapper}>
              <div className={styles.adsoyad}>Rol</div>
            </div>
            <div className={styles.rolWrapper}>
              <div className={styles.adsoyad}>Telefon</div>
            </div>
            <div className={styles.zalAdWrapper}>
              <div className={styles.adsoyad}>Zal adı</div>
            </div>
            <div className={styles.traflWrapper}>
              <div className={styles.adsoyad}>Ətraflı</div>
            </div>
          </div>

          {sorted.map((partner, index) => {
            const rowClass = index % 2 === 0 ? styles.frameParent : styles.frameGroup
            const isSuper = partner.role === 'ROLE_GYM_SUPER_ADMIN'
            const gymName = (partner as any).gymName || (partner as any).gymTitle || 'FİTnest Club'

            return (
              <div key={partner.id} className={rowClass}>
                <div className={styles.tickSquareParent}>
                  <div className={styles.tickSquare}>
                    <CustomCheckbox checked={selected.has(partner.id)} onChange={() => toggleOne(partner.id)} />
                  </div>
                  <div className={styles.adsoyad} title={partner.fullName || ''}>
                    {partner.fullName}
                  </div>
                </div>
                
                <div className={styles.adminWrapper}>
                  <div className={isSuper ? styles.admin : styles.admin2}>
                    <div className={styles.usergear}>
                      <div className={styles.usergear2}>
                        <Image 
                          src={isSuper ? "/superAdmin.svg" : "/admin.svg"} 
                          width={isSuper ? 18.1 : 16.3} 
                          height={isSuper ? 13.8 : 15.6} 
                          sizes="100vw" 
                          alt="" 
                          className={isSuper ? styles.vectorIcon : styles.vectorIcon3}
                        />
                      </div>
                    </div>
                    <div className={styles.superAdmin}>
                      {isSuper ? 'Super admin' : 'Admin'}
                    </div>
                  </div>
                </div>

                <div className={styles.rolWrapper}>
                  <div className={styles.adsoyad}>
                    {partner.phoneNumber || '+994 00 000 00 00'}
                  </div>
                </div>

                <div className={styles.zalAdWrapper}>
                  <div className={styles.adsoyad} title={gymName}>
                    {gymName}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/partners/${partner.id}`)}
                  className={cn(styles.traflWrapper, "hover:opacity-80 transition-opacity")}
                  aria-label="Ətraflı bax"
                >
                  <div className={styles.tickSquare}>
                    <div className={styles.usergear2}>
                      <Image 
                        src="/Eye.png" 
                        width={22.1} 
                        height={14.6} 
                        sizes="100vw" 
                        alt="" 
                        className={styles.vectorIcon2}
                      />
                    </div>
                  </div>
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
