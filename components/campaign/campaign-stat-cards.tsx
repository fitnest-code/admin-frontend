'use client'

import { useT } from '@/lib/i18n'
import { useCoinSettingsV2 } from '@/lib/query/use-coin-settings-v2'
import Image from 'next/image'

export function CampaignStatCards() {
  const t = useT()
  const c = t.campaign
  const { settings } = useCoinSettingsV2()

  const welcomeBonus = settings?.welcomeBonusAmount ?? 0
  const spendRate = settings?.spendRateCoinToAzn ?? 10
  const expiryMonths = settings?.expiryMonths ?? 12

  // Calculate earn rate display: 1 AZN = X Coin
  // Formula V2: baseEarnRate * tierMultiplier * periodMultiplier * earnCoinFactor
  // For display, we show a simplified version based on base settings
  const earnRateDisplay = settings
    ? `1 AZN = ${settings.baseEarnRate?.toString() ?? '1'} Coin`
    : '1 AZN = 1 Coin'

  // Spend rate: X Coin = 1 AZN
  const spendRateDisplay = `${spendRate} Coin = 1 AZN`

  const cards = [
    {
      title: c.statCards.welcomeBonus,
      value: `${welcomeBonus} Coin`,
      subtitle: c.statCards.perNewMember,
      icon: '/admin-panel-icons/ticket-star.svg',
    },
    {
      title: c.statCards.earnRate,
      value: earnRateDisplay,
      subtitle: c.statCards.actualCardPayment,
      icon: '/admin-panel-icons/ChartLineUp.svg',
    },
    {
      title: c.statCards.spendRate,
      value: spendRateDisplay,
      subtitle: c.statCards.subscriptionOnly,
      icon: '/admin-panel-icons/money-send.svg',
    },
    {
      title: c.statCards.validity,
      value: `${expiryMonths} ${expiryMonths === 1 ? 'ay' : 'ay'}`,
      subtitle: c.statCards.fromFirstCoin,
      icon: '/admin-panel-icons/status-up.svg',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {cards.map((card, index) => (
        <div
          key={index}
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
            <p className="text-[#64716F] text-[16px] font-semibold leading-[24px]">
              {card.title}
            </p>
            <p className="text-[#172322] text-[18px] font-bold leading-[28px] mt-1">
              {card.value}
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