'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { useCustomersQuery } from '@/modules/customers'
import {
  usePartnerLeadFiltersQuery,
  usePartnerLeadsQuery,
  useUpdatePartnerLeadMutation,
  type PartnerLead,
  type PartnerLeadStatus,
} from '@/modules/partner-applications'

const PAGE_SIZE = 10

const STATUS_STYLES: Record<PartnerLeadStatus, string> = {
  NEW: 'bg-[#155EEF]',
  CONTACTED_WAITING: 'bg-[#AD46FF]',
  REJECTED: 'bg-[#94979C]',
  AWAITING_DETAILS: 'bg-[#EC972F]',
  APPROVED: 'bg-[#166728]',
  CONTRACT_SIGNED: 'bg-[#0B4F6C]',
}

const STATUSES: PartnerLeadStatus[] = [
  'NEW',
  'CONTACTED_WAITING',
  'REJECTED',
  'AWAITING_DETAILS',
  'APPROVED',
  'CONTRACT_SIGNED',
]

type DateFilter = 'today' | '7' | '30' | null

function padId(id: number) {
  return String(id).padStart(7, '0')
}

function formatAzPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('994')) {
    return `+994 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }
  return phone
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Baku',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateRange(filter: DateFilter): { from?: string; to?: string } {
  if (!filter) return {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const to = isoDate(today)
  if (filter === 'today') return { from: to, to }
  const from = new Date(today)
  from.setDate(today.getDate() - (filter === '7' ? 6 : 29))
  return { from: isoDate(from), to }
}

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string | null
  onChange: (value: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const current = options.find((option) => option.value === selected)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-[140px] items-center justify-center gap-3 rounded-xl border border-[#ECECED] bg-white px-3 text-base text-black"
      >
        <span className="truncate">{current ? current.label : label}</span>
        <Image
          src="/admin-panel-icons/arrow-down.svg"
          width={20}
          height={20}
          alt=""
          className={cn('shrink-0', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 max-h-72 w-64 overflow-auto rounded-xl border border-[#ECECED] bg-white shadow-xl">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[#FAFAFA]',
              selected === null && 'font-medium text-[#00B4CC]',
            )}
          >
            <Check size={13} className={cn(selected === null ? 'opacity-100' : 'opacity-0')} />
            {label}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[#FAFAFA]',
                selected === option.value && 'font-medium text-[#00B4CC]',
              )}
            >
              <Check size={13} className={cn(selected === option.value ? 'opacity-100' : 'opacity-0')} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function statusLabel(status: PartnerLeadStatus, copy: ReturnType<typeof useT>['partnerApplications']) {
  if (status === 'NEW') return copy.statusNew
  if (status === 'CONTACTED_WAITING') return copy.statusContactedWaiting
  if (status === 'REJECTED') return copy.statusRejected
  if (status === 'AWAITING_DETAILS') return copy.statusAwaitingDetails
  if (status === 'APPROVED') return copy.statusApproved
  return copy.statusContractSigned
}

function StatusBadge({
  status,
  label,
  onSelect,
}: {
  status: PartnerLeadStatus
  label: string
  onSelect: (next: PartnerLeadStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const t = useT()

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'inline-flex h-[26px] max-w-full items-center gap-1 rounded-[20px] px-3 py-1 text-xs font-medium text-white',
          STATUS_STYLES[status],
        )}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-white" />
        <span className="truncate">{label}</span>
      </button>
      {open && (
        <div className="absolute top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-[#ECECED] bg-white shadow-xl">
          {STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onSelect(item)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#FAFAFA]"
            >
              <span className={cn('size-2 shrink-0 rounded-full', STATUS_STYLES[item])} />
              {statusLabel(item, t.partnerApplications)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AssigneeCell({
  lead,
  people,
  onAssign,
  onUnassign,
}: {
  lead: PartnerLead
  people: { id: number; name: string }[]
  onAssign: (id: number, name: string) => void
  onUnassign: () => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div className="relative flex w-full justify-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full truncate px-2 text-center text-base text-black hover:text-[#00B4CC]"
      >
        {lead.assigneeName?.trim() || t.partnerApplications.unassigned}
      </button>
      {open && (
        <div className="absolute top-full z-20 mt-1 max-h-64 w-56 overflow-auto rounded-xl border border-[#ECECED] bg-white shadow-xl">
          <button
            type="button"
            onClick={() => {
              onUnassign()
              setOpen(false)
            }}
            className="flex w-full px-3 py-2 text-left text-sm hover:bg-[#FAFAFA]"
          >
            {t.partnerApplications.unassigned}
          </button>
          {people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                onAssign(person.id, person.name)
                setOpen(false)
              }}
              className="flex w-full px-3 py-2 text-left text-sm hover:bg-[#FAFAFA]"
            >
              {person.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PartnerApplicationsList() {
  const t = useT()
  const copy = t.partnerApplications
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [activity, setActivity] = useState<string | null>(null)
  const [assignee, setAssignee] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, activity, assignee, dateFilter])

  const range = dateRange(dateFilter)
  const params = {
    page: page - 1,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: (status as PartnerLeadStatus | undefined) || undefined,
    activity: activity || undefined,
    assignee: assignee || undefined,
    from: range.from,
    to: range.to,
  }

  const leadsQuery = usePartnerLeadsQuery(params)
  const filtersQuery = usePartnerLeadFiltersQuery()
  const staffQuery = useCustomersQuery({ page: 0, size: 100, roles: ['ROLE_ADMIN', 'ROLE_FITNEST_STAFF'] })
  const updateMutation = useUpdatePartnerLeadMutation()

  const items = leadsQuery.data?.items ?? []
  const total = leadsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const people = useMemo(() => {
    const fromStaff = (staffQuery.data?.items ?? [])
      .map((person) => ({
        id: person.id,
        name: person.fullName?.trim() || person.email || String(person.id),
      }))
      .filter((person) => person.name)
    const seen = new Set(fromStaff.map((person) => person.id))
    for (const option of filtersQuery.data?.assignees ?? []) {
      if (!seen.has(option.id)) {
        fromStaff.push({ id: option.id, name: option.name })
        seen.add(option.id)
      }
    }
    return fromStaff
  }, [staffQuery.data?.items, filtersQuery.data?.assignees])

  function updateLead(id: number, body: Parameters<typeof updateMutation.mutate>[0]['body']) {
    updateMutation.mutate({ id, body })
  }

  const pages = useMemo(() => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, index) => index + 1)
    const start = Math.min(Math.max(page - 1, 1), Math.max(totalPages - 3, 1))
    return Array.from({ length: 4 }, (_, index) => start + index).filter((value) => value <= totalPages)
  }, [page, totalPages])

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-7 text-[#101828]">{copy.title}</h1>
        <p className="text-base font-light leading-6 text-[#101828]">{copy.subtitle}</p>
      </div>

      <div className="flex flex-col flex-wrap gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex h-12 min-w-[240px] max-w-[381px] flex-1 items-center gap-3 rounded-xl border border-[#ECECED] bg-white px-6">
          <Image src="/admin-panel-icons/search-normal.svg" width={24} height={24} alt="" className="shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-full w-full bg-transparent text-sm text-black outline-none placeholder:text-[#94979C]"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <FilterDropdown
            label={copy.filterStatus}
            selected={status}
            onChange={setStatus}
            options={STATUSES.map((item) => ({ value: item, label: statusLabel(item, copy) }))}
          />
          <FilterDropdown
            label={copy.filterActivity}
            selected={activity}
            onChange={setActivity}
            options={(filtersQuery.data?.activities ?? []).map((item) => ({
              value: item.value,
              label: item.label,
            }))}
          />
          <FilterDropdown
            label={copy.filterAssignee}
            selected={assignee}
            onChange={setAssignee}
            options={[
              { value: 'unassigned', label: copy.unassigned },
              ...people.map((person) => ({ value: String(person.id), label: person.name })),
            ]}
          />
          <FilterDropdown
            label={copy.filterDate}
            selected={dateFilter}
            onChange={(value) => setDateFilter(value as DateFilter)}
            options={[
              { value: 'today', label: copy.dateToday },
              { value: '7', label: copy.date7 },
              { value: '30', label: copy.date30 },
            ]}
          />
        </div>
      </div>

      {leadsQuery.isError ? <p className="text-sm text-red-600">{copy.error}</p> : null}
      {updateMutation.isError ? <p className="text-sm text-red-600">{copy.updateError}</p> : null}

      <div className="overflow-x-auto">
        <div className="min-w-[1180px]">
          <div className="flex items-center justify-between rounded-t-xl bg-[rgba(0,180,204,0.15)] px-2.5 py-5 text-base text-black outline outline-1 outline-[#CECFD2] outline-offset-[-1px]">
            <span className="w-[74px]">{copy.colId}</span>
            <span className="w-[110px] text-center">{copy.colCreated}</span>
            <span className="w-[150px] text-center">{copy.colGym}</span>
            <span className="w-[140px] text-center">{copy.colContact}</span>
            <span className="w-[140px] text-center">{copy.colPhone}</span>
            <span className="w-[150px] text-center">{copy.colEmail}</span>
            <span className="w-[140px] text-center">{copy.colActivity}</span>
            <span className="w-[170px] text-center">{copy.colStatus}</span>
            <span className="w-[140px] text-center">{copy.colAssignee}</span>
            <span className="w-[92px] text-center">{copy.colLastContact}</span>
          </div>

          {leadsQuery.isLoading ? (
            <div className="border border-t-0 border-[#ECECED] bg-white px-4 py-10 text-center text-sm text-[#94979C]">
              {copy.loading}
            </div>
          ) : items.length === 0 ? (
            <div className="border border-t-0 border-[#ECECED] bg-white px-4 py-10 text-center">
              <p className="text-base font-semibold text-black">{copy.empty}</p>
              <p className="mt-1 text-sm text-[#94979C]">{copy.emptyDesc}</p>
            </div>
          ) : (
            items.map((lead) => (
              <div
                key={lead.id}
                className="flex min-h-[88px] items-center justify-between border border-t-0 border-[#ECECED] bg-white px-2.5 py-5 text-base text-black"
              >
                <span className="w-[74px] text-center">{padId(lead.id)}</span>
                <span className="w-[110px]">{formatDate(lead.createdAt)}</span>
                <span className="w-[150px] truncate text-center" title={lead.gymName}>{lead.gymName}</span>
                <span className="w-[140px] truncate text-center" title={lead.contactName}>{lead.contactName}</span>
                <span className="w-[140px] text-center">{formatAzPhone(lead.phone)}</span>
                <span className="w-[150px] truncate text-center" title={lead.email || ''}>{lead.email || '—'}</span>
                <span className="w-[140px] truncate text-center" title={lead.activity}>{lead.activity}</span>
                <div className="w-[170px]">
                  <StatusBadge
                    status={lead.status}
                    label={statusLabel(lead.status, copy)}
                    onSelect={(next) => {
                      if (next !== lead.status) updateLead(lead.id, { status: next })
                    }}
                  />
                </div>
                <div className="w-[140px]">
                  <AssigneeCell
                    lead={lead}
                    people={people}
                    onAssign={(id, name) => updateLead(lead.id, { assigneeUserId: id, assigneeName: name })}
                    onUnassign={() => updateLead(lead.id, { unassign: true })}
                  />
                </div>
                <span className="w-[92px] text-center">{formatDate(lead.lastContactAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Image src="/admin-panel-icons/chevron-left.svg" width={24} height={24} alt="" />
          </button>
          <div className="flex items-start gap-1">
            {pages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={cn(
                  'flex size-10 items-center justify-center text-sm font-medium',
                  item === page ? 'rounded-lg bg-[#00B4CC] text-white' : 'rounded-full text-black',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Image src="/admin-panel-icons/chevron-right.svg" width={24} height={24} alt="" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
