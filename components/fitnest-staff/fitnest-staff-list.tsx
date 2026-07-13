'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Eye, Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { useCustomersQuery, type CustomerListItem } from '@/modules/customers'
import { PAGE_SIZE } from '../customers/list/customer-list-constants'
import { CustomerPagination } from '../customers/list/customer-list-table'
import { normalizeCustomerStatus } from '../customers/list/customer-list-utils'
import styles from '../partners/partners-list.module.css'
import { useResizableColumns } from '@/hooks/use-resizable-columns'

const STAFF_SORT_OPTIONS = [
  { value: 'newest', label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc', label: 'Ad: A-Z' },
  { value: 'name_desc', label: 'Ad: Z-A' },
] as const

type StaffSortValue = typeof STAFF_SORT_OPTIONS[number]['value']

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
  value: StaffSortValue | null
  onChange: (v: StaffSortValue | null) => void
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

  const current = STAFF_SORT_OPTIONS.find((option) => option.value === value)

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
          {STAFF_SORT_OPTIONS.map((option) => (
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

export function FitnestStaffList() {
  const router = useRouter()
  const t = useT()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<StaffSortValue | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)

  const { colWidths, tableRef, handleMouseDown } = useResizableColumns(
    [60, 200, 150],
    [40, 120, 80]
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const staffQuery = useCustomersQuery({
    page: page - 1,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    sort: sortBy || undefined,
    roles: ['ROLE_FITNEST_STAFF'],
  })

  const staff = staffQuery.data?.items ?? []
  
  const sorted = useMemo(() => {
    const list = [...staff]
    if (sortBy === 'name_asc') {
      list.sort((a, b) => (a.fullName ?? '').localeCompare(b.fullName ?? ''))
    } else if (sortBy === 'name_desc') {
      list.sort((a, b) => (b.fullName ?? '').localeCompare(a.fullName ?? ''))
    }
    return list
  }, [staff, sortBy])

  useEffect(() => {
    setSelected(new Set())
  }, [page, search])

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      const allOnPage = sorted.length > 0 && sorted.every((s) => prev.has(s.id))
      if (allOnPage) sorted.forEach((s) => next.delete(s.id))
      else sorted.forEach((s) => next.add(s.id))
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

  const total = staffQuery.data?.total ?? 0
  const allOnPage = sorted.length > 0 && sorted.every((s) => selected.has(s.id))

  // Resize handle element shared across resizable headers
  const resizeHandle = (colIndex: number) => (
    <div
      onMouseDown={(e) => handleMouseDown(colIndex, e)}
      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
    >
      <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
    </div>
  )

  return (
    <div className="flex flex-col gap-5 font-sans">
      <h1 className="text-xl font-bold text-foreground">{t.lists.staffTitle}</h1>

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
            placeholder={t.lists.searchPlaceholder}
            className="h-[40px] w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm font-medium outline-none focus:border-[#00B4CC] transition-all duration-200 shadow-sm"
          />
        </div>
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Table */}
      {staffQuery.isLoading ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          {t.lists.staffLoading}
        </div>
      ) : sorted.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0" style={{ tableLayout: 'fixed', minWidth: '500px' }}>
              <colgroup>
                <col style={{ width: '48px' }} />
                {colWidths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
                <col />
              </colgroup>
              <thead>
                <tr className="bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 text-left border-b border-border">
                  <th className="px-4 py-3">
                    <input type="checkbox" disabled className="h-4 w-4 opacity-40" />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase text-foreground/80">ID</th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase text-foreground/80">Ad / Soyad</th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase text-foreground/80">Rol</th>
                  <th className="px-4 py-3 text-[11px] font-medium uppercase text-foreground/80">Telefon</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-base font-semibold text-foreground">{t.lists.staffEmpty}</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.lists.staffEmptyDesc}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: 'fixed', minWidth: '500px' }}>
            <colgroup>
              <col style={{ width: '48px' }} />
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
              <col />
            </colgroup>
            <thead>
              <tr className="bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 text-left border-b border-[#cecfd2]/60 dark:border-border">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded" />
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-foreground/80 relative">
                  {t.lists.colId}
                  {resizeHandle(0)}
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-foreground/80 relative">
                  {t.lists.colName}
                  {resizeHandle(1)}
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-foreground/80 relative">
                  {t.lists.colRole}
                  {resizeHandle(2)}
                </th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-foreground/80">
                  {t.lists.colPhone}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/40 transition-all duration-200 bg-card cursor-pointer"
                  onClick={() => router.push(`/fitnest-staff/${member.id}`)}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleOne(member.id)}
                      onClick={(event) => event.stopPropagation()}
                      className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-black truncate">{member.id}</td>
                  <td className="px-4 py-3 text-sm font-normal text-black truncate" title={member.fullName || ''}>
                    {member.fullName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex h-[22px] w-fit items-center justify-center gap-1.5 rounded-full bg-[#00B4CC]/10 px-3 text-[10px] font-medium uppercase text-[#00B4CC]">
                        <Image
                          src="/admin.svg"
                          width={12}
                          height={12}
                          alt=""
                          className="shrink-0"
                        />
                        <span>{t.lists.staffRoleLabel}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-normal text-black truncate">
                    {member.phoneNumber || '+994 00 000 00 00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {staffQuery.isError && (
        <p className="text-sm text-red-500">{t.lists.staffError}</p>
      )}

      <CustomerPagination total={total} page={page} perPage={PAGE_SIZE} onChange={setPage} />
    </div>
  )
}
