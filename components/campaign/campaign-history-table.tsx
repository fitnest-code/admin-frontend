'use client'

import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { CoinTransactionHistoryItem } from '@/lib/query/use-coin-history'
import Image from 'next/image'

interface CampaignHistoryTableProps {
  transactions: CoinTransactionHistoryItem[]
}

function formatAmount(amount: string): { formatted: string; color: string } {
  const num = parseFloat(amount)
  if (num > 0) {
    return { formatted: `+${num}`, color: 'text-[#0098AD]' }
  } else if (num < 0) {
    return { formatted: `${num}`, color: 'text-[#C83D44]' }
  }
  return { formatted: '0', color: 'text-black' }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getTypeLabel(type: string, refundAction: string | null, t: ReturnType<typeof useT>['campaign']): string {
  const labels: Record<string, string> = {
    BONUS: 'Qeydiyyat bonusu',
    EARN: 'Coin qazancı',
    SPEND: 'Coin xərcləmə',
    CAMPAIGN_BONUS: 'Kampaniya bonusu',
    REFUND: refundAction === 'RESTORE_SPENT_COINS' ? 'Geri qaytarma — xərclənmiş Coin bərpası' : 'Geri qaytarma — qazanc ləğv',
    EXPIRE: 'Coin müddəti bitdi',
    ADJUSTMENT: 'Admin korreksiyası',
  }
  return labels[type] || type
}

export function CampaignHistoryTable({ transactions }: CampaignHistoryTableProps) {
  const t = useT()
  const c = t.campaign

  if (transactions.length === 0) {
    return (
      <div className="w-full py-12 text-center text-[#8A9694] text-[16px]">
        {c.noData}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Table Header */}
      <div className="w-full bg-[rgba(0,180,204,0.15)] rounded-t-xl border-x border-[#CECFD2] border-t border-[#CECFD2] px-4">
        <div className="grid grid-cols-[114px_200px_400px_80px_100px_47px] gap-4 py-4 text-black text-[16px] font-normal leading-[24px]">
          <div className="flex items-center gap-2">
            <Image
              src="/admin-panel-icons/tick-square.svg"
              alt="select all"
              width={24}
              height={24}
              className="object-contain"
            />
            <span>{c.table.id}</span>
          </div>
          <div className="text-center">{c.table.namePhone}</div>
          <div className="text-center">{c.table.operation}</div>
          <div className="text-center">{c.table.fitCoin}</div>
          <div className="text-center">{c.table.date}</div>
          <div>{c.table.detail}</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="border-x border-[#ECECED] border-b border-[#ECECED] rounded-b-xl bg-white">
        {transactions.map((tx, index) => {
          const amountInfo = formatAmount(tx.amount)
          const isLast = index === transactions.length - 1

          return (
            <div
              key={tx.id}
              className={cn(
                'grid grid-cols-[114px_200px_400px_80px_100px_47px] gap-4 px-4 py-5 items-center',
                !isLast && 'border-b border-[#ECECED]',
              )}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/admin-panel-icons/tick-square.svg"
                  alt="select"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-black text-[16px] font-normal leading-[24px]">
                  {String(tx.id).padStart(7, '0')}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-black text-[14px] font-normal leading-[18px] w-full text-center">
                  {tx.userName || '-'}
                </span>
                <span className="text-[#7C7C7C] text-[12px] font-normal leading-[16px] w-full text-center">
                  {tx.userPhone || '-'}
                </span>
              </div>
              <div className="text-[#4F5E5B] text-[16px] font-normal leading-[24px] text-center">
                {getTypeLabel(tx.type, tx.refundAction, c)}
              </div>
              <div className={cn('text-center font-bold text-[16px] leading-[24px]', amountInfo.color)}>
                {amountInfo.formatted}
              </div>
              <div className="text-center text-black text-[16px] font-normal leading-[24px]">
                {formatDate(tx.createdDate)}
              </div>
              <div className="flex justify-center">
                <Image
                  src="/admin-panel-icons/Eye.svg"
                  alt="detail"
                  width={24}
                  height={24}
                  className="object-contain cursor-pointer"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}