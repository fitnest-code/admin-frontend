'use client'

import { useState } from 'react'
import { StatCard } from './stat-card'
import dynamic from 'next/dynamic'
import { STAT_DATA, STAT_ICONS } from '@/lib/dashboard-data'

const RevenueChart = dynamic(() => import('./revenue-chart').then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl border border-border" />,
})

const CustomerGrowthChart = dynamic(() => import('./customer-growth-chart').then((m) => m.CustomerGrowthChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl border border-border" />,
})

type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function DashboardPage() {
  // Each stat card has its own independent period state
  const [periods, setPeriods] = useState<PeriodKey[]>([
    'monthly', 'monthly', 'monthly', 'monthly',
  ])

  function handlePeriodChange(index: number, value: string) {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? (value as PeriodKey) : p)),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
          FitNest idarəetmə paneli
        </p>
      </div>

      {/* KPI Stat Cards */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Əsas göstəricilər"
      >
        {periods.map((period, i) => {
          const cardData = STAT_DATA[period][i]
          const Icon = STAT_ICONS[i]
          return (
            <StatCard
              key={cardData.title}
              {...cardData}
              icon={Icon}
              period={period}
              onPeriodChange={(v) => handlePeriodChange(i, v)}
            />
          )
        })}
      </section>

      {/* Charts */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Analitika qrafikləri"
      >
        <RevenueChart />
        <CustomerGrowthChart />
      </section>
    </div>
  )
}
