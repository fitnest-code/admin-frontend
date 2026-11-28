'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Download,
  Info,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  UserCheck,
  UserPlus,
  Percent,
  QrCode,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SelectDropdown } from '@/components/ui/select-dropdown'
import {
  formatCurrencyCompact,
  formatDashboardValue,
  getLocalDateRangeForPeriod,
  type DashboardPeriod,
} from '@/modules/dashboard/period'
import { useDashboardV2SummaryQuery } from '@/modules/dashboard/hooks'
import type { DashboardV2PackageCard, DashboardV2TopGym } from '@/modules/dashboard/types'

const PERIOD_SEGMENTS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'daily', label: 'Gün' },
  { value: 'weekly', label: 'Həftə' },
  { value: 'monthly', label: 'Ay' },
]

const TIER_BAR: Record<string, string> = {
  bronze: 'bg-[#B87333]',
  silver: 'bg-[#9CA3AF]',
  gold: 'bg-[#D4A017]',
  platinum: 'bg-[#1E3A5F]',
}

function formatManat(value: number): string {
  return `${Math.round(value).toLocaleString('az-AZ')} ₼`
}

function TrendPill({
  value,
  suffix = '%',
  invert = false,
}: {
  value: number | null | undefined
  suffix?: string
  invert?: boolean
}) {
  if (value == null || Number.isNaN(value)) return null
  const positive = invert ? value <= 0 : value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
      )}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {value >= 0 ? '+' : ''}
      {value.toFixed(1)}
      {suffix}
    </span>
  )
}

function sparkPoints(values: number[] | undefined | null): string {
  if (!values || values.length === 0) {
    return '0,24 80,24'
  }
  const max = Math.max(...values, 0.0001)
  const min = Math.min(...values, 0)
  const span = Math.max(max - min, 0.0001)
  const n = values.length
  return values
    .map((v, i) => {
      const x = n === 1 ? 40 : (i / (n - 1)) * 80
      const y = 24 - ((v - min) / span) * 20
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function Sparkline({
  color = '#00B4CC',
  values,
}: {
  color?: string
  values?: number[] | null
}) {
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={sparkPoints(values)}
      />
    </svg>
  )
}

function MetricCard({
  title,
  value,
  trend,
  trendSuffix,
  invertTrend,
  icon: Icon,
  sparkColor,
  sparkline,
  footer,
}: {
  title: string
  value: string
  trend?: number | null
  trendSuffix?: string
  invertTrend?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  sparkColor?: string
  sparkline?: number[] | null
  footer?: string
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F8FB]">
              <Icon size={16} className="text-[#00B4CC]" />
            </span>
          ) : null}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <Info size={14} className="text-muted-foreground/60" aria-hidden />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <TrendPill value={trend} suffix={trendSuffix} invert={invertTrend} />
          </div>
          {footer ? <p className="mt-1 text-[11px] text-muted-foreground">{footer}</p> : null}
        </div>
        <Sparkline color={sparkColor} values={sparkline} />
      </div>
    </article>
  )
}

function PackageCard({ card }: { card: DashboardV2PackageCard }) {
  const key = (card.packageName || '').toLowerCase()
  const bar = TIER_BAR[key] ?? 'bg-[#00B4CC]'
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{card.packageName}</p>
        <span className="text-xs text-muted-foreground">payı {card.sharePct.toFixed(0)}%</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">{card.activeCount}</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${Math.min(card.sharePct, 100)}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        <div>
          <p className="text-muted-foreground">Son 7 gün</p>
          <p className="mt-0.5 font-semibold text-foreground">{card.last7DaysCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Dondurulmuş</p>
          <p className="mt-0.5 font-semibold text-foreground">{card.frozenCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground">30 gündə bitir</p>
          <p className="mt-0.5 font-semibold text-foreground">{card.endingIn30DaysCount}</p>
        </div>
      </div>
      {card.revenue != null ? (
        <p className="border-t border-border pt-2 text-sm text-muted-foreground">
          Gəlir <span className="font-semibold text-foreground">{formatManat(card.revenue)}</span>
        </p>
      ) : null}
    </article>
  )
}

function TopGymsTable({ gyms }: { gyms: DashboardV2TopGym[] }) {
  const [limit, setLimit] = useState('10')
  const rows = useMemo(() => gyms.slice(0, Number(limit) || 10), [gyms, limit])

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Top zallar</h3>
          <p className="text-xs text-muted-foreground">
            Sütun başlığına kliklə: sırala · sətrə kliklə: zalın dashboard-u
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Göstər</span>
            <SelectDropdown
              value={limit}
              onChange={setLimit}
              options={[
                { value: '5', label: 'Top 5' },
                { value: '10', label: 'Top 10' },
                { value: '20', label: 'Top 20' },
              ]}
            />
          </div>
          <Link href="/gyms" className="text-sm font-medium text-[#00B4CC] hover:underline">
            Bütün zallar →
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Zal</th>
              <th className="px-4 py-3 font-medium">Kateqoriya</th>
              <th className="px-4 py-3 font-medium">Paketlər</th>
              <th className="px-4 py-3 font-medium">QR girişlər</th>
              <th className="px-4 py-3 font-medium">Unikal müştəri</th>
              <th className="px-4 py-3 font-medium">Əsas zal seçən</th>
              <th className="px-4 py-3 font-medium">Hesablanmış ödəniş</th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((gym, index) => (
              <tr key={gym.gymId} className="border-t border-border hover:bg-secondary/20">
                <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/gyms/${gym.gymId}`} className="font-medium text-[#00B4CC] hover:underline">
                    {gym.gymName}
                  </Link>
                </td>
                <td className="px-4 py-3">{gym.category || '—'}</td>
                <td className="px-4 py-3">{gym.packages || '—'}</td>
                <td className="px-4 py-3 font-medium">{gym.qrCount}</td>
                <td className="px-4 py-3">{gym.uniqueCustomers}</td>
                <td className="px-4 py-3">{gym.primaryGymSelectors}</td>
                <td className="px-4 py-3">{formatCurrencyCompact(gym.amount)} ₼</td>
                <td className="px-4 py-3">
                  <TrendPill value={gym.trendPct} />
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Məlumat yoxdur
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('monthly')
  const query = useDashboardV2SummaryQuery(period)
  const data = query.data
  const range = getLocalDateRangeForPeriod(period)

  const finance = data?.finance
  const customers = data?.customers
  const subscriptions = data?.subscriptions
  const packageCards = data?.packageCards ?? []
  const qr = data?.qr
  const topGyms = data?.topGyms ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">FitNest idarəetmə paneli</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            {range.dateFrom} – {range.dateTo}
          </div>
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {PERIOD_SEGMENTS.map((seg) => (
              <button
                key={seg.value}
                type="button"
                onClick={() => setPeriod(seg.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  period === seg.value
                    ? 'bg-[#00B4CC] text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {seg.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw size={14} />
            Yenilə
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Download size={14} />
            İxrac
          </button>
        </div>
      </div>

      {data?.blockErrors?.length ? (
        <p className="text-xs text-amber-600">Qismən yükləndi: {data.blockErrors.join(', ')}</p>
      ) : null}

      {/* Maliyyə */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">Maliyyə</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MetricCard
            title="Ümumi gəlir"
            value={formatManat(finance?.totalIncome ?? 0)}
            trend={finance?.incomeDeltaPct}
            sparkColor="#00B4CC"
            sparkline={finance?.incomeSparkline}
          />
          <MetricCard
            title="Zallara öhdəlik"
            value={formatManat(finance?.totalObligation ?? 0)}
            trend={finance?.obligationDeltaPct}
            invertTrend
            sparkColor="#F97316"
            sparkline={finance?.obligationSparkline}
          />
          <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm lg:row-span-1">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">Xalis qalıq</span>
              <Info size={14} className="text-muted-foreground/60" />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatManat(finance?.netBalance ?? 0)}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <TrendPill value={finance?.netDeltaPct} />
                  <span className="text-xs text-muted-foreground">
                    marja {(finance?.marginPct ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Sparkline values={finance?.netSparkline} />
            </div>
            <p className="rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              {formatManat(finance?.totalIncome ?? 0)} − {formatManat(finance?.totalObligation ?? 0)} ={' '}
              <span className="font-semibold text-foreground">
                {formatManat(finance?.netBalance ?? 0)}
              </span>
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="flex h-full w-full">
                <div
                  className="h-full bg-orange-400"
                  style={{
                    width: `${
                      (finance?.totalIncome ?? 0) > 0
                        ? Math.min(
                            100,
                            ((finance?.totalObligation ?? 0) / (finance?.totalIncome ?? 1)) * 100,
                          )
                        : 0
                    }%`,
                  }}
                />
                <div className="h-full flex-1 bg-[#00B4CC]" />
              </div>
            </div>
            <ul className="space-y-2">
              {(finance?.obligationGyms ?? []).slice(0, 4).map((gym) => (
                <li key={gym.gymId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {gym.gymName}
                    <span className="ml-2 text-xs">({gym.qrCount} giriş)</span>
                  </span>
                  <span className="font-medium text-foreground">{formatManat(gym.amount)}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Müştərilər */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Müştərilər</h2>
          <p className="text-xs text-muted-foreground">Kartlar Müştərilər və Hesabatlar modullarından</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Ümumi müştərilər"
            value={formatDashboardValue(customers?.totalCustomers ?? 0)}
            trend={customers?.totalDeltaPct}
            icon={Users}
          />
          <MetricCard
            title="Aktiv istifadəçi"
            value={formatDashboardValue(customers?.activeCustomers ?? 0)}
            trend={customers?.activeDeltaPct}
            icon={UserCheck}
          />
          <MetricCard
            title="Yeni qeydiyyatlar"
            value={formatDashboardValue(customers?.newRegistrations ?? 0)}
            trend={customers?.newDeltaPct}
            icon={UserPlus}
            footer="Son 7 gündə bitən abunəliklər (proxy)"
          />
          <MetricCard
            title="Konversiya"
            value={`${(customers?.conversionPct ?? 0).toFixed(1)}%`}
            trend={customers?.conversionDeltaPp}
            trendSuffix=" pp"
            icon={Percent}
          />
        </div>
      </section>

      {/* Abunəliklər */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Abunəliklər</h2>
          <p className="text-xs text-muted-foreground">Karta kliklə: həmin statusdakı müştərilərin siyahısı</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <MetricCard
            title="Son 7 gün"
            value={formatDashboardValue(subscriptions?.last7DaysCount ?? 0)}
            sparkline={subscriptions?.sparkline}
          />
          <MetricCard
            title="Aktiv"
            value={formatDashboardValue(subscriptions?.activeCount ?? 0)}
            trend={subscriptions?.activeDeltaPct}
            sparkline={subscriptions?.sparkline}
          />
          <MetricCard
            title="Dondurulmuş"
            value={formatDashboardValue(subscriptions?.frozenCount ?? 0)}
            sparkColor="#F97316"
            sparkline={subscriptions?.sparkline}
          />
          <MetricCard
            title="Bitmiş"
            value={formatDashboardValue(subscriptions?.endedInPeriod ?? 0)}
            sparkColor="#F97316"
            sparkline={subscriptions?.sparkline}
          />
          <MetricCard
            title="Yenilənən"
            value={formatDashboardValue(subscriptions?.renewedInPeriod ?? 0)}
            sparkline={subscriptions?.sparkline}
          />
        </div>
      </section>

      {/* Package cards */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Aktiv abunəliklər — paketlər üzrə</h2>
          <p className="text-xs text-muted-foreground">Paket kartına kliklə: həmin paketin müştəri siyahısı</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packageCards.map((card) => (
            <PackageCard key={card.packageId} card={card} />
          ))}
          {packageCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Paket məlumatı yoxdur</p>
          ) : null}
        </div>
      </section>

      {/* QR */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground">QR girişlər</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title="Ümumi QR giriş"
            value={formatDashboardValue(qr?.totalScans ?? 0)}
            trend={qr?.totalDeltaPct}
            icon={QrCode}
            footer="əvvəlki dövrə nisbətən"
            sparkline={qr?.sparkline}
          />
          <MetricCard
            title="Light Mode skan"
            value={formatDashboardValue(qr?.lightScans ?? 0)}
            trend={qr?.lightDeltaPct}
            icon={Sun}
            sparkline={qr?.sparkline}
          />
          <MetricCard
            title="Dark Mode skan"
            value={formatDashboardValue(qr?.darkScans ?? 0)}
            trend={qr?.darkDeltaPct}
            icon={Moon}
            sparkline={qr?.sparkline}
          />
        </div>
        <TopGymsTable gyms={topGyms} />
      </section>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">Yüklənir…</p>
      ) : null}
      {query.isError ? (
        <p className="text-sm text-destructive">Dashboard məlumatı yüklənmədi</p>
      ) : null}
    </div>
  )
}
