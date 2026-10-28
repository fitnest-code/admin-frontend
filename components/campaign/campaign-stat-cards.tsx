'use client'

import Image from 'next/image'
import { useT } from '@/lib/i18n'
import { useCoinHistorySummary } from '@/lib/query/use-coin-history'

function formatCoins(value: number | undefined): string {
  if (value === undefined || value === null) return '—'
  return value.toLocaleString('az-AZ', { maximumFractionDigits: 2 })
}

export function CampaignStatCards() {
  const t = useT()
  const c = t.campaign
  const { data: summary, isLoading } = useCoinHistorySummary()

  const cards = [
    {
      title: c.statCards.totalEarned,
      value: formatCoins(summary?.totalEarned),
      subtitle: c.statCards.totalEarnedHint,
      icon: '/admin-panel-icons/ChartLineUp.svg',
    },
    {
      title: c.statCards.totalSpent,
      value: formatCoins(summary?.totalSpent),
      subtitle: c.statCards.totalSpentHint,
      icon: '/admin-panel-icons/money-send.svg',
    },
    {
      title: c.statCards.totalExpired,
      value: formatCoins(summary?.totalExpired),
      subtitle: c.statCards.totalExpiredHint,
      icon: '/admin-panel-icons/status-up.svg',
    },
    {
      title: c.statCards.activeWallets,
      value: formatCoins(summary?.activeWallets),
      subtitle: c.statCards.activeWalletsHint.replace(
        '{count}',
        String(summary?.totalWallets ?? 0),
      ),
      icon: '/admin-panel-icons/UsersFour.svg',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl border border-[#CECFD2] p-6 flex flex-col items-center gap-4"
        >
          <div className="w-full flex justify-center">
            <Image
              src={card.icon}
              alt={card.title}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="w-full text-center">
            <p className="text-[#64716F] text-[16px] font-semibold leading-[24px]">{card.title}</p>
            <p className="text-[#172322] text-[18px] font-bold leading-[28px] mt-1">
              {isLoading ? '…' : card.value}
            </p>
            <p className="text-[#8A9694] text-[14px] font-normal leading-[18px] mt-1">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
