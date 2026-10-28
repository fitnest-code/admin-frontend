'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { CoinTransactionHistoryItem } from '@/lib/query/use-coin-history'
import { ModalBase } from './campaign-modals'

interface CampaignHistoryTableProps {
  transactions: CoinTransactionHistoryItem[]
}

const GRID = 'grid grid-cols-[90px_minmax(190px,1.4fr)_minmax(170px,1.2fr)_100px_100px_120px_56px] gap-4'

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

  if (transactions.length === 0) {
    return (
      <div className="w-full py-12 text-center text-[#8A9694] text-[16px]">{c.noData}</div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="w-full bg-[rgba(0,180,204,0.15)] rounded-t-xl border border-[#CECFD2] px-4">
          <div className={cn(GRID, 'py-4 text-black text-[15px] font-normal leading-[24px]')}>
            <div>{c.table.id}</div>
            <div>{c.table.customer}</div>
            <div>{c.table.source}</div>
            <div className="text-right">{c.table.fitCoin}</div>
            <div className="text-right">{c.table.balance}</div>
            <div className="text-center">{c.table.date}</div>
            <div className="text-center">{c.table.detail}</div>
          </div>
        </div>

        <div className="border-x border-b border-[#ECECED] rounded-b-xl bg-white">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className={cn(
                GRID,
                'px-4 py-4 items-center',
                index !== transactions.length - 1 && 'border-b border-[#ECECED]',
              )}
            >
              <div className="text-[#7C7C7C] text-[13px] font-normal leading-[18px]">
                #{String(tx.id).padStart(6, '0')}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-black text-[15px] font-medium leading-[20px] truncate">
                  {tx.userName || '—'}
                </span>
                <span className="text-[#7C7C7C] text-[12px] font-normal leading-[16px]">
                  {formatPhone(tx.userPhone) || '—'}
                  <span className="text-[#B3B8B7]"> · #{tx.userId}</span>
                </span>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[#172322] text-[14px] font-normal leading-[19px] truncate">
                  {tx.sourceTitle || typeLabel(c, tx)}
                </span>
                <span className="w-fit rounded-md bg-[#F2F4F7] px-2 py-0.5 text-[#4F5E5B] text-[11px] font-medium leading-[16px]">
                  {typeLabel(c, tx)}
                </span>
              </div>

              <div
                className={cn(
                  'text-right font-semibold text-[15px] leading-[22px]',
                  formatAmountColor(tx.amount),
                )}
              >
                {formatCoin(tx.amount, true)}
              </div>

              <div className="text-right text-[#4F5E5B] text-[15px] font-normal leading-[22px]">
                {formatCoin(tx.balanceAfter)}
              </div>

              <div className="text-center text-black text-[13px] font-normal leading-[18px]">
                {formatDate(tx.createdDate)}
              </div>

              <div className="flex justify-center">
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
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <ModalBase onClose={() => setSelected(null)}>
          <div className="flex flex-col gap-4 font-sans">
            <div className="flex items-start justify-between border-b border-[#ececed] pb-3">
              <div>
                <h2 className="text-[18px] font-semibold text-black leading-[26px]">
                  {c.detail.title}
                </h2>
                <p className="text-[12px] text-[#667085]">#{String(selected.id).padStart(6, '0')}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[#98A2B3] hover:text-black"
              >
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
              {selected.orderId && (
                <DetailRow label={c.detail.orderId} value={selected.orderId} mono />
              )}
              <DetailRow label={c.table.date} value={formatDate(selected.createdDate)} />
            </dl>
          </div>
        </ModalBase>
      )}
    </div>
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
          'text-[13px] font-medium text-black text-right break-all',
          mono && 'font-mono',
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  )
}
