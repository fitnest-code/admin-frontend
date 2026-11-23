'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { useCustomersQuery } from '@/modules/customers'
import {
  useBmiLeadFiltersQuery,
  useBmiLeadsQuery,
  useUpdateBmiLeadMutation,
  type BmiLead,
  type BmiLeadStatus,
} from '@/modules/bmi'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'

const PAGE_SIZE = 10

const STATUS_STYLES: Record<BmiLeadStatus, string> = {
  NEW: 'bg-[#155EEF]',
  CONTACTING: 'bg-[#AD46FF]',
  CONTACTED: 'bg-[#EC972F]',
  CONVERTED: 'bg-[#166728]',
  CLOSED: 'bg-[#94979C]',
}

const STATUSES: BmiLeadStatus[] = ['NEW', 'CONTACTING', 'CONTACTED', 'CONVERTED', 'CLOSED']

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

function StatusBadge({
  status,
  label,
  onSelect,
}: {
  status: BmiLeadStatus
  label: string
  onSelect: (next: BmiLeadStatus) => void
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
          'inline-flex h-[26px] items-center gap-1 rounded-[20px] px-3 py-1 text-xs font-medium text-white',
          STATUS_STYLES[status],
        )}
      >
        <span className="size-1.5 rounded-full bg-white" />
        {label}
      </button>
      {open && (
        <div className="absolute top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#ECECED] bg-white shadow-xl">
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
              <span className={cn('size-2 rounded-full', STATUS_STYLES[item])} />
              {statusLabel(item, t.bmiRequests)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function statusLabel(status: BmiLeadStatus, copy: ReturnType<typeof useT>['bmiRequests']) {
  if (status === 'NEW') return copy.statusNew
  if (status === 'CONTACTING') return copy.statusContacting
  if (status === 'CONTACTED') return copy.statusContacted
  if (status === 'CONVERTED') return copy.statusConverted
  return copy.statusClosed
}

function AssigneeCell({
  lead,
  people,
  onAssign,
  onUnassign,
}: {
  lead: BmiLead
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
        {lead.assigneeName?.trim() || t.bmiRequests.unassigned}
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
            {t.bmiRequests.unassigned}
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

export function BmiRequestsList() {
  const t = useT()
  const copy = t.bmiRequests
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [goalCode, setGoalCode] = useState<string | null>(null)
  const [assignee, setAssignee] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, goalCode, assignee, dateFilter])

  const range = dateRange(dateFilter)
  const params = {
    page: page - 1,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: (status as BmiLeadStatus | undefined) || undefined,
    goalCode: goalCode || undefined,
    assignee: assignee || undefined,
    from: range.from,
    to: range.to,
  }

  const leadsQuery = useBmiLeadsQuery(params)
  const filtersQuery = useBmiLeadFiltersQuery()
  const staffQuery = useCustomersQuery({ page: 0, size: 100, roles: ['ROLE_ADMIN', 'ROLE_FITNEST_STAFF'] })
  const updateMutation = useUpdateBmiLeadMutation()

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

  const columns: AdminDataTableColumn<BmiLead>[] = useMemo(
    () => [
      {
        id: 'id',
        label: copy.colId,
        defaultWidth: 88,
        minWidth: 56,
        maxWidth: 120,
        render: (lead) => <span className="block truncate tabular-nums">{padId(lead.id)}</span>,
      },
      {
        id: 'created',
        label: copy.colCreated,
        defaultWidth: 116,
        minWidth: 96,
        maxWidth: 140,
        render: (lead) => <span className="block truncate">{formatDate(lead.createdAt)}</span>,
      },
      {
        id: 'phone',
        label: copy.colPhone,
        defaultWidth: 150,
        minWidth: 120,
        maxWidth: 200,
        render: (lead) => <span className="block truncate">{formatAzPhone(lead.phone)}</span>,
      },
      {
        id: 'email',
        label: copy.colEmail,
        defaultWidth: 160,
        minWidth: 120,
        maxWidth: 280,
        flex: true,
        render: (lead) => (
          <span className="block truncate" title={lead.email || ''}>
            {lead.email || '—'}
          </span>
        ),
      },
      {
        id: 'goal',
        label: copy.colGoal,
        defaultWidth: 180,
        minWidth: 120,
        maxWidth: 320,
        flex: true,
        render: (lead) => <span className="block truncate">{lead.goalTitle}</span>,
      },
      {
        id: 'bmi',
        label: copy.colBmi,
        defaultWidth: 72,
        minWidth: 56,
        maxWidth: 96,
        render: (lead) => <span className="block truncate tabular-nums">{Number(lead.bmi).toFixed(1)}</span>,
      },
      {
        id: 'status',
        label: copy.colStatus,
        defaultWidth: 140,
        minWidth: 120,
        maxWidth: 200,
        render: (lead) => (
          <div onClick={(e) => e.stopPropagation()}>
            <StatusBadge
              status={lead.status}
              label={statusLabel(lead.status, copy)}
              onSelect={(next) => {
                if (next !== lead.status) updateLead(lead.id, { status: next })
              }}
            />
          </div>
        ),
      },
      {
        id: 'assignee',
        label: copy.colAssignee,
        defaultWidth: 160,
        minWidth: 120,
        maxWidth: 240,
        render: (lead) => (
          <div onClick={(e) => e.stopPropagation()}>
            <AssigneeCell
              lead={lead}
              people={people}
              onAssign={(id, name) => updateLead(lead.id, { assigneeUserId: id, assigneeName: name })}
              onUnassign={() => updateLead(lead.id, { unassign: true })}
            />
          </div>
        ),
      },
      {
        id: 'lastContact',
        label: copy.colLastContact,
        defaultWidth: 110,
        minWidth: 92,
        maxWidth: 140,
        render: (lead) => <span className="block truncate">{formatDate(lead.lastContactAt)}</span>,
      },
    ],
    [copy, people],
  )

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
            label={copy.filterGoal}
            selected={goalCode}
            onChange={setGoalCode}
            options={(filtersQuery.data?.goals ?? []).map((goal) => ({ value: goal.code, label: goal.title }))}
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

      {leadsQuery.isError ? (
        <p className="text-sm text-red-600">{copy.error}</p>
      ) : null}
      {updateMutation.isError ? (
        <p className="text-sm text-red-600">{copy.updateError}</p>
      ) : null}

      <AdminDataTable
        storageKey="bmi-requests"
        columns={columns}
        rows={items}
        getRowId={(lead) => lead.id}
        isLoading={leadsQuery.isLoading}
        emptyTitle={copy.empty}
        emptyDescription={copy.emptyDesc}
      />

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
