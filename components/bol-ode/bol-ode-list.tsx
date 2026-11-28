'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'
import {
  BOL_ODE_STATUSES,
  BOL_ODE_WAITING_STATUSES,
  useBolOdeListQuery,
  type BolOdeListItem,
  type BolOdeStatus,
} from '@/modules/bol-ode'

const PAGE_SIZE = 20

const STATUS_STYLES: Record<BolOdeStatus, string> = {
  NEW: 'bg-[#155EEF] text-white',
  PENDING: 'bg-[#EC972F] text-white',
  IN_REVIEW: 'bg-[#7C3AED] text-white',
  APPROVED: 'bg-[#166728] text-white',
  DECLINED: 'bg-[#B42318] text-white',
  CANCELLED: 'bg-[#94979C] text-white',
}

function statusLabel(t: ReturnType<typeof useT>['bolOde'], status: BolOdeStatus) {
  switch (status) {
    case 'NEW':
      return t.statusNew
    case 'PENDING':
      return t.statusPending
    case 'IN_REVIEW':
      return t.statusInReview
    case 'APPROVED':
      return t.statusApproved
    case 'DECLINED':
      return t.statusDeclined
    case 'CANCELLED':
      return t.statusCancelled
    default:
      return status
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('az-AZ', {
    timeZone: 'Asia/Baku',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function waitLabel(seconds: number | null | undefined, template: string) {
  if (seconds == null || seconds <= 0) return null
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  return template.replace('{n}', String(minutes))
}

export function BolOdeList() {
  const t = useT().bolOde
  const router = useRouter()
  // Spring page is 0-based; UI page indicator is 1-based.
  const [pageIndex, setPageIndex] = useState(0)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BolOdeStatus | ''>('')

  const params = useMemo(
    () => ({
      page: pageIndex,
      size: PAGE_SIZE,
      q: search || undefined,
      status: (status || undefined) as BolOdeStatus | undefined,
    }),
    [pageIndex, search, status],
  )

  const { data, isLoading, isError, refetch } = useBolOdeListQuery(params)
  const rows = data?.content ?? []
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const newCount = rows.filter((r) => r.status === 'NEW').length
  const uiPage = pageIndex + 1

  const pages = useMemo(() => {
    if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const start = Math.min(Math.max(uiPage - 1, 1), Math.max(totalPages - 3, 1))
    return Array.from({ length: 4 }, (_, i) => start + i).filter((v) => v <= totalPages)
  }, [uiPage, totalPages])

  const columns: AdminDataTableColumn<BolOdeListItem>[] = useMemo(
    () => [
      {
        id: 'displayId',
        label: t.colId,
        defaultWidth: 110,
        minWidth: 90,
        render: (row) => <span className="font-medium text-[#101828]">{row.displayId}</span>,
      },
      {
        id: 'createdAt',
        label: t.colCreated,
        defaultWidth: 150,
        minWidth: 120,
        render: (row) => formatDateTime(row.createdAt),
      },
      {
        id: 'contactPhone',
        label: t.colPhone,
        defaultWidth: 150,
        minWidth: 120,
        render: (row) => row.contactPhone || '—',
      },
      {
        id: 'status',
        label: t.colStatus,
        defaultWidth: 180,
        minWidth: 140,
        render: (row) => {
          const wait =
            BOL_ODE_WAITING_STATUSES.includes(row.status) &&
            waitLabel(row.waitRemainingSeconds, t.minutesLeft)
          return (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status]}`}
              >
                {statusLabel(t, row.status)}
              </span>
              {wait ? <span className="text-xs text-[#667085]">{wait}</span> : null}
            </div>
          )
        },
      },
      {
        id: 'assignee',
        label: t.colAssignee,
        defaultWidth: 120,
        minWidth: 90,
        render: (row) =>
          row.assignedAdminUserId != null ? String(row.assignedAdminUserId) : t.unassigned,
      },
    ],
    [t],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1e2430]">{t.title}</h1>
          <p className="mt-1 text-sm text-[#667085]">{t.subtitle}</p>
        </div>
        {newCount > 0 ? (
          <span className="rounded-full bg-[#EFF4FF] px-3 py-1 text-sm font-medium text-[#155EEF]">
            {t.newCount.replace('{n}', String(newCount))}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPageIndex(0)
              setSearch(q.trim())
            }
          }}
          placeholder={t.searchPlaceholder}
          className="h-10 min-w-[260px] flex-1 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm outline-none focus:border-[#155EEF]"
        />
        <select
          value={status}
          onChange={(e) => {
            setPageIndex(0)
            setStatus(e.target.value as BolOdeStatus | '')
          }}
          className="h-10 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm"
        >
          <option value="">{t.filterAll}</option>
          {BOL_ODE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(t, s)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setPageIndex(0)
            setSearch(q.trim())
            void refetch()
          }}
          className="h-10 rounded-lg bg-[#155EEF] px-4 text-sm font-medium text-white"
        >
          Axtar
        </button>
      </div>

      {isError ? (
        <div className="rounded-lg border border-[#FECDCA] bg-[#FFFBFA] p-4 text-sm text-[#B42318]">
          {t.error}
        </div>
      ) : null}

      <AdminDataTable
        storageKey="bol-ode-list"
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyTitle={t.empty}
        emptyDescription={t.emptyDesc}
        onRowClick={(row) => router.push(`/odenisler/birbank-bol-ode/${row.id}`)}
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            disabled={uiPage <= 1}
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Image src="/admin-panel-icons/chevron-left.svg" width={24} height={24} alt="" />
          </button>
          <div className="flex items-start gap-1">
            {pages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPageIndex(item - 1)}
                className={cn(
                  'flex size-10 items-center justify-center text-sm font-medium',
                  item === uiPage ? 'rounded-lg bg-[#00B4CC] text-white' : 'rounded-full text-black',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={uiPage >= totalPages}
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
            className="flex size-10 items-center justify-center rounded-full disabled:opacity-40"
          >
            <Image src="/admin-panel-icons/chevron-right.svg" width={24} height={24} alt="" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
