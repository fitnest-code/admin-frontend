'use client'

import { useState } from 'react'
import { StatCard } from './stat-card'
import dynamic from 'next/dynamic'
import { STAT_ICONS } from '@/lib/dashboard-data'
import {
  formatCurrencyCompact,
  formatDashboardValue,
  signedPercentageChange,
  type DashboardPeriod,
} from '@/modules/dashboard/period'
import {
  useDashboardKpiSummaryQuery,
  useDashboardQrScansQuery,
  useDashboardV2SummaryQuery,
} from '@/modules/dashboard/hooks'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import { PERIOD_OPTIONS } from '@/lib/dashboard-data'

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

function V2MetricCard({
  title,
  value,
  trend,
  subtitle,
}: {
  title: string
  value: string
  trend?: number | null
  subtitle?: string
}) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {trend != null && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
          {trend >= 0 ? '+' : ''}
          {trend.toFixed(1)}%
        </p>
      )}
      {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
    </article>
  )
}

export function DashboardPage() {
  const [periods, setPeriods] = useState<DashboardPeriod[]>([
    'monthly', 'monthly', 'monthly', 'monthly',
  ])
  const [v2Period, setV2Period] = useState<DashboardPeriod>('monthly')

  const kpiQuery = useDashboardKpiSummaryQuery()
  const qrPeriod = periods[3]
  const qrQuery = useDashboardQrScansQuery(qrPeriod)
  const v2Query = useDashboardV2SummaryQuery(v2Period)

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

  const v2 = v2Query.data
  const incomeTrend =
    v2?.income?.incomeDeltaPct != null
      ? signedPercentageChange(v2.income.incomeDeltaPct, v2.income.incomePositiveTrend)
      : null
  const subTrend =
    v2?.subscriptions?.activeDeltaPct != null
      ? signedPercentageChange(
          v2.subscriptions.activeDeltaPct,
          v2.subscriptions.activePositiveTrend,
        )
      : null

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

      <section className="flex flex-col gap-4" aria-label="Dashboard V2 göstəriciləri">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Əməliyyat xülasəsi</h2>
            <p className="text-xs text-muted-foreground">
              Gəlir, öhdəliklər, abunəliklər və top zallar
            </p>
          </div>
          <SelectDropdown
            value={v2Period}
            onChange={(v) => setV2Period(v as DashboardPeriod)}
            options={PERIOD_OPTIONS}
            className="w-[140px]"
          />
        </div>

        {v2Query.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : v2Query.isError ? (
          <p className="text-sm text-destructive">Xülasə yüklənmədi</p>
        ) : (
          <>
            {v2?.blockErrors?.length ? (
              <p className="text-xs text-amber-600">
                Qismən yükləndi: {v2.blockErrors.join(', ')}
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <V2MetricCard
                title="Gəlir"
                value={formatCurrencyCompact(v2?.income?.totalIncome ?? 0)}
                trend={incomeTrend}
                subtitle={
                  v2?.income
                    ? `Refund: ${formatCurrencyCompact(v2.income.refundAmount)} · BNPL: ${formatCurrencyCompact(v2.income.pendingBnplAmount)}`
                    : undefined
                }
              />
              <V2MetricCard
                title="Zal öhdəlikləri"
                value={formatCurrencyCompact(v2?.obligations?.totalObligation ?? 0)}
                subtitle={
                  v2?.obligations
                    ? `${v2.obligations.gyms.length} zal`
                    : undefined
                }
              />
              <V2MetricCard
                title="Aktiv / Dondurulmuş"
                value={`${formatDashboardValue(v2?.subscriptions?.activeCount ?? 0)} / ${formatDashboardValue(v2?.subscriptions?.frozenCount ?? 0)}`}
                trend={subTrend}
                subtitle={
                  v2?.subscriptions
                    ? `Bitən: ${v2.subscriptions.endedInPeriod} · Yenilənən: ${v2.subscriptions.renewedInPeriod}`
                    : undefined
                }
              />
              <V2MetricCard
                title="Top zal"
                value={v2?.topGyms?.[0]?.gymName ?? '—'}
                subtitle={
                  v2?.topGyms?.[0]
                    ? `${formatCurrencyCompact(v2.topGyms[0].amount)} · ${v2.topGyms[0].qrCount} QR`
                    : undefined
                }
              />
            </div>

            {v2?.subscriptions?.packageCards?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {v2.subscriptions.packageCards.map((card) => (
                  <article
                    key={card.packageId}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">{card.packageName}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {card.activeCount} aktiv · {card.frozenCount} dondurulmuş
                    </p>
                  </article>
                ))}
              </div>
            ) : null}

            {v2?.topGyms?.length ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 font-medium">Zal</th>
                      <th className="px-4 py-2 font-medium">QR</th>
                      <th className="px-4 py-2 font-medium">Məbləğ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v2.topGyms.slice(0, 5).map((gym) => (
                      <tr key={gym.gymId} className="border-t border-border">
                        <td className="px-4 py-2">{gym.gymName}</td>
                        <td className="px-4 py-2">{gym.qrCount}</td>
                        <td className="px-4 py-2">{formatCurrencyCompact(gym.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        )}
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
