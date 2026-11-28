'use client'

import { useState } from 'react'
import { StatCard } from './stat-card'
import dynamic from 'next/dynamic'
import { STAT_ICONS } from '@/lib/dashboard-data'
import {
  formatDashboardValue,
  signedPercentageChange,
  type DashboardPeriod,
} from '@/modules/dashboard/period'
import {
  useDashboardKpiSummaryQuery,
  useDashboardQrScansQuery,
} from '@/modules/dashboard/hooks'

const RevenueChart = dynamic(() => import('./revenue-chart').then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl border border-border" />,
})

const CustomerGrowthChart = dynamic(() => import('./customer-growth-chart').then((m) => m.CustomerGrowthChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl border border-border" />,
})

const KPI_TITLES = [
  'Aktiv Müştərilər',
  'Partnyorlar',
  'Aktiv Abunəliklər',
  'QR oxunma',
] as const

function StatCardSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-secondary" />
        <div className="h-4 w-28 rounded bg-secondary" />
      </div>
      <div className="h-8 w-20 rounded bg-secondary" />
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-16 rounded bg-secondary" />
        <div className="h-7 w-[88px] rounded bg-secondary" />
      </div>
    </article>
  )
}

function StatCardError({ title }: { title: string }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <p className="text-xs text-destructive">Məlumat yüklənmədi</p>
    </article>
  )
}

export function DashboardPage() {
  const [periods, setPeriods] = useState<DashboardPeriod[]>([
    'monthly', 'monthly', 'monthly', 'monthly',
  ])

  const kpiQuery = useDashboardKpiSummaryQuery()
  const qrPeriod = periods[3]
  const qrQuery = useDashboardQrScansQuery(qrPeriod)

  function handlePeriodChange(index: number, value: string) {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? (value as DashboardPeriod) : p)),
    )
  }

  function renderKpiCard(index: 0 | 1 | 2) {
    const period = periods[index]
    const Icon = STAT_ICONS[index]
    const title = KPI_TITLES[index]

    if (kpiQuery.isLoading) {
      return <StatCardSkeleton key={title} />
    }

    if (kpiQuery.isError) {
      return <StatCardError key={title} title={title} />
    }

    const kpi = kpiQuery.data
    if (!kpi) {
      return <StatCardSkeleton key={title} />
    }

    const metric =
      index === 0
        ? kpi.activeCustomers
        : index === 1
          ? kpi.partners
          : kpi.activeSubscriptions

    return (
      <StatCard
        key={title}
        title={title}
        value={formatDashboardValue(metric.totalValue)}
        trend={signedPercentageChange(metric.percentageChange, metric.isPositiveTrend)}
        icon={Icon}
        period={period}
        onPeriodChange={(v) => handlePeriodChange(index, v)}
      />
    )
  }

  function renderQrCard() {
    const period = periods[3]
    const Icon = STAT_ICONS[3]
    const title = KPI_TITLES[3]

    if (qrQuery.isLoading) {
      return <StatCardSkeleton key={title} />
    }

    if (qrQuery.isError) {
      return <StatCardError key={title} title={title} />
    }

    const qr = qrQuery.data
    const pct = qr?.percentageChange ?? 0
    const positive = qr?.isPositiveTrend ?? true

    return (
      <StatCard
        key={title}
        title={title}
        value={formatDashboardValue(qr?.count ?? 0)}
        trend={signedPercentageChange(pct, positive)}
        icon={Icon}
        period={period}
        onPeriodChange={(v) => handlePeriodChange(3, v)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">Dashboard</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
          FitNest idarəetmə paneli
        </p>
      </div>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Əsas göstəricilər"
      >
        {renderKpiCard(0)}
        {renderKpiCard(1)}
        {renderKpiCard(2)}
        {renderQrCard()}
      </section>

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