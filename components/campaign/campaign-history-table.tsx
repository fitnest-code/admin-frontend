'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { CoinTransactionHistoryItem } from '@/lib/query/use-coin-history'
import { ModalBase } from './campaign-modals'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'

interface CampaignHistoryTableProps {
  transactions: CoinTransactionHistoryItem[]
}

type CampaignDict = ReturnType<typeof useT>['campaign']

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  const parsed = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCoin(value: string | number | null | undefined, withSign = false): string {
  const amount = toNumber(value)
  const formatted = amount.toLocaleString('az-AZ', { maximumFractionDigits: 2 })
  if (!withSign) return formatted
  return amount > 0 ? `+${formatted}` : formatted
}

function formatAmountColor(value: string | number | null | undefined): string {
  const amount = toNumber(value)
  if (amount > 0) return 'text-[#0098AD]'
  if (amount < 0) return 'text-[#C83D44]'
  return 'text-black'
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPhone(phone: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('994')) {
    const local = digits.slice(3)
    return `+994 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`
  }
  return phone
}

function typeLabel(c: CampaignDict, tx: CoinTransactionHistoryItem): string {
  switch (tx.type) {
    case 'BONUS':
      return c.types.bonus
    case 'EARN':
      return c.types.earn
    case 'SPEND':
      return c.types.spend
    case 'CAMPAIGN_BONUS':
      return c.types.campaignBonus
    case 'REFUND':
      return tx.refundAction === 'RESTORE_SPENT_COINS'
        ? c.types.refundRestore
        : c.types.refundReverse
    case 'EXPIRE':
      return c.types.expire
    case 'ADJUSTMENT':
      return c.types.adjustment
    default:
      return tx.type
  }
}

export function CampaignHistoryTable({ transactions }: CampaignHistoryTableProps) {
  const t = useT()
  const c = t.campaign
  const [selected, setSelected] = useState<CoinTransactionHistoryItem | null>(null)

  const columns: AdminDataTableColumn<CoinTransactionHistoryItem>[] = useMemo(
    () => [
      {
        id: 'id',
        label: c.table.id,
        defaultWidth: 90,
        minWidth: 72,
        maxWidth: 120,
        render: (tx) => (
          <span className="block truncate text-[13px] text-[#7C7C7C]">#{String(tx.id).padStart(6, '0')}</span>
        ),
      },
      {
        id: 'customer',
        label: c.table.customer,
        defaultWidth: 220,
        minWidth: 160,
        maxWidth: 360,
        flex: true,
        render: (tx) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[15px] font-medium text-black">{tx.userName || '—'}</span>
            <span className="text-[12px] text-[#7C7C7C]">
              {formatPhone(tx.userPhone) || '—'}
              <span className="text-[#B3B8B7]"> · #{tx.userId}</span>
            </span>
          </div>
        ),
      },
      {
        id: 'source',
        label: c.table.source,
        defaultWidth: 200,
        minWidth: 140,
        maxWidth: 320,
        flex: true,
        render: (tx) => (
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[14px] text-[#172322]">{tx.sourceTitle || typeLabel(c, tx)}</span>
            <span className="w-fit rounded-md bg-[#F2F4F7] px-2 py-0.5 text-[11px] font-medium text-[#4F5E5B]">
              {typeLabel(c, tx)}
            </span>
          </div>
        ),
      },
      {
        id: 'amount',
        label: c.table.fitCoin,
        defaultWidth: 100,
        minWidth: 80,
        maxWidth: 140,
        render: (tx) => (
          <span className={cn('block truncate text-right text-[15px] font-semibold', formatAmountColor(tx.amount))}>
            {formatCoin(tx.amount, true)}
          </span>
        ),
      },
      {
        id: 'balance',
        label: c.table.balance,
        defaultWidth: 100,
        minWidth: 80,
        maxWidth: 140,
        render: (tx) => (
          <span className="block truncate text-right text-[15px] text-[#4F5E5B]">{formatCoin(tx.balanceAfter)}</span>
        ),
      },
      {
        id: 'date',
        label: c.table.date,
        defaultWidth: 140,
        minWidth: 120,
        maxWidth: 180,
        render: (tx) => <span className="block truncate text-center text-[13px]">{formatDate(tx.createdDate)}</span>,
      },
      {
        id: 'detail',
        label: c.table.detail,
        defaultWidth: 64,
        minWidth: 56,
        maxWidth: 80,
        reorderable: false,
        hideable: false,
        render: (tx) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelected(tx)}
              className="rounded-md p-1 transition-colors hover:bg-[#F2F4F7]"
              aria-label={c.table.detail}
            >
              <Image
                src="/admin-panel-icons/Eye.svg"
                alt={c.table.detail}
                width={22}
                height={22}
                className="object-contain"
              />
            </button>
          </div>
        ),
      },
    ],
    [c],
  )

  return (
  <>
    <AdminDataTable
      storageKey="campaign-history"
      columns={columns}
      rows={transactions}
      getRowId={(tx) => tx.id}
      emptyTitle={c.noData}
    />

    {selected && (
      <ModalBase onClose={() => setSelected(null)}>
        <div className="flex flex-col gap-4 font-sans">
          <div className="flex items-start justify-between border-b border-[#ececed] pb-3">
            <div>
              <h2 className="text-[18px] font-semibold leading-[26px] text-black">{c.detail.title}</h2>
              <p className="text-[12px] text-[#667085]">#{String(selected.id).padStart(6, '0')}</p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-[#98A2B3] hover:text-black">
              ✕
            </button>
          </div>

          <dl className="flex flex-col gap-3">
            <DetailRow
              label={c.table.customer}
              value={`${selected.userName || '—'}${
                selected.userPhone ? ` · ${formatPhone(selected.userPhone)}` : ''
              }`}
            />
            <DetailRow label={c.detail.userId} value={`#${selected.userId}`} />
            <DetailRow label={c.detail.operation} value={typeLabel(c, selected)} />
            <DetailRow label={c.detail.source} value={selected.sourceTitle || '—'} />
            <DetailRow
              label={c.table.fitCoin}
              value={formatCoin(selected.amount, true)}
              valueClassName={formatAmountColor(selected.amount)}
            />
            <DetailRow label={c.table.balance} value={formatCoin(selected.balanceAfter)} />
            {selected.orderId && <DetailRow label={c.detail.orderId} value={selected.orderId} mono />}
            <DetailRow label={c.table.date} value={formatDate(selected.createdDate)} />
          </dl>
        </div>
      </ModalBase>
    )}
  </>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
  valueClassName,
}: {
  label: string
  value: string
  mono?: boolean
  valueClassName?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[13px] text-[#667085]">{label}</dt>
      <dd
        className={cn(
          'break-all text-right text-[13px] font-medium text-black',
          mono && 'font-mono',
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  )
}