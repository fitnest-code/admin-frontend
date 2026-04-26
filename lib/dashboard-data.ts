import {
  Users,
  Handshake,
  BadgeCheck,
  QrCode,
} from 'lucide-react'
import type { StatCardProps } from '@/components/dashboard/stat-card'

// --------------- Period & Tier options ---------------

export const PERIOD_OPTIONS = [
  { value: 'daily',   label: 'Günlük'  },
  { value: 'weekly',  label: 'Həftəlik' },
  { value: 'monthly', label: 'Aylıq'   },
  { value: 'yearly',  label: 'İllik'   },
]

export const TIER_OPTIONS = [
  { value: 'bronze',   label: 'Bronze'   },
  { value: 'silver',   label: 'Silver'   },
  { value: 'gold',     label: 'Gold'     },
  { value: 'platinum', label: 'Platinum' },
]

// --------------- Stat card period-based data ---------------

type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const STAT_DATA: Record<
  PeriodKey,
  Omit<StatCardProps, 'className' | 'icon' | 'period' | 'onPeriodChange'>[]
> = {
  daily: [
    { title: 'Aktiv Müştərilər', value: '48',   trend: 1.2  },
    { title: 'Partnyorlar',       value: '2',    trend: 0    },
    { title: 'Aktiv Abunəliklər', value: '11',   trend: 0.5  },
    { title: 'QR oxunma',         value: '130',  trend: 3.1  },
  ],
  weekly: [
    { title: 'Aktiv Müştərilər', value: '310',  trend: 2.8  },
    { title: 'Partnyorlar',       value: '8',    trend: 1    },
    { title: 'Aktiv Abunəliklər', value: '34',   trend: 0.8  },
    { title: 'QR oxunma',         value: '540',  trend: 6.5  },
  ],
  monthly: [
    { title: 'Aktiv Müştərilər', value: '1200', trend: 4.2  },
    { title: 'Partnyorlar',       value: '32',   trend: 2    },
    { title: 'Aktiv Abunəliklər', value: '85',   trend: 1    },
    { title: 'QR oxunma',         value: '1000', trend: 12   },
  ],
  yearly: [
    { title: 'Aktiv Müştərilər', value: '14k',  trend: 18.5 },
    { title: 'Partnyorlar',       value: '32',   trend: 5    },
    { title: 'Aktiv Abunəliklər', value: '85',   trend: 7.3  },
    { title: 'QR oxunma',         value: '12k',  trend: 22   },
  ],
}

export const STAT_ICONS = [Users, Handshake, BadgeCheck, QrCode]

// --------------- Revenue chart — per tier + period ---------------

type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May']

const REVENUE_BY_TIER: Record<TierKey, number[]> = {
  bronze:   [280, 320, 300, 500, 420],
  silver:   [340, 390, 370, 580, 510],
  gold:     [420, 460, 440, 650, 600],
  platinum: [510, 570, 540, 740, 690],
}

const REVENUE_BY_TIER_PERIOD: Record<PeriodKey, Record<TierKey, number[]>> = {
  daily:   {
    bronze:   [22, 28, 25, 40, 35],
    silver:   [28, 35, 30, 48, 42],
    gold:     [35, 40, 37, 55, 50],
    platinum: [42, 50, 45, 62, 57],
  },
  weekly:  {
    bronze:   [70, 90, 80, 130, 110],
    silver:   [85, 105, 95, 150, 130],
    gold:     [105, 125, 115, 170, 155],
    platinum: [130, 155, 140, 195, 175],
  },
  monthly: REVENUE_BY_TIER,
  yearly:  {
    bronze:   [3200, 3600, 3400, 5200, 4600],
    silver:   [3900, 4300, 4100, 6000, 5500],
    gold:     [4800, 5200, 5000, 7000, 6500],
    platinum: [5800, 6300, 6100, 8200, 7600],
  },
}

export const TIER_META: Record<TierKey, { subscribers: number; growth: number; color: string }> = {
  bronze:   { subscribers: 500, growth: 12, color: '#CD7F32' },
  silver:   { subscribers: 320, growth:  8, color: '#A0ADB8' },
  gold:     { subscribers: 185, growth: 15, color: '#F5C842' },
  platinum: { subscribers:  95, growth: 20, color: '#624DE3' },
}

export function getRevenueData(tier: TierKey, period: PeriodKey) {
  const values = REVENUE_BY_TIER_PERIOD[period][tier]
  return MONTHS.map((month, i) => ({ month, value: values[i] }))
}

// --------------- Customer growth chart — per period ---------------

const CUSTOMER_GROWTH_BY_PERIOD: Record<PeriodKey, Array<{ month: string; yeni: number; aktiv: number }>> = {
  daily: [
    { month: 'B.e',  yeni: 40,   aktiv: 30   },
    { month: 'Ç.a',  yeni: 55,   aktiv: 42   },
    { month: 'Ç',    yeni: 48,   aktiv: 37   },
    { month: 'C.a',  yeni: 70,   aktiv: 55   },
    { month: 'C',    yeni: 90,   aktiv: 72   },
    { month: 'Ş',    yeni: 110,  aktiv: 88   },
  ],
  weekly: [
    { month: 'H.1',  yeni: 280,  aktiv: 210  },
    { month: 'H.2',  yeni: 360,  aktiv: 290  },
    { month: 'H.3',  yeni: 310,  aktiv: 250  },
    { month: 'H.4',  yeni: 440,  aktiv: 360  },
    { month: 'H.5',  yeni: 520,  aktiv: 420  },
    { month: 'H.6',  yeni: 600,  aktiv: 480  },
  ],
  monthly: [
    { month: 'Jan',  yeni: 1200, aktiv: 900  },
    { month: 'Feb',  yeni: 1800, aktiv: 1400 },
    { month: 'Mar',  yeni: 1500, aktiv: 1100 },
    { month: 'Apr',  yeni: 2200, aktiv: 1700 },
    { month: 'May',  yeni: 3000, aktiv: 2400 },
    { month: 'Jun',  yeni: 3500, aktiv: 2800 },
  ],
  yearly: [
    { month: '2019', yeni: 8000,  aktiv: 6200  },
    { month: '2020', yeni: 9500,  aktiv: 7400  },
    { month: '2021', yeni: 11000, aktiv: 8800  },
    { month: '2022', yeni: 13500, aktiv: 10500 },
    { month: '2023', yeni: 16000, aktiv: 12800 },
    { month: '2024', yeni: 19000, aktiv: 15200 },
  ],
}

export function getCustomerGrowthData(period: PeriodKey) {
  return CUSTOMER_GROWTH_BY_PERIOD[period]
}
