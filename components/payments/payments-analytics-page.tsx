'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { addMonths, format, getMonth, getYear, setMonth, setYear } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { usePaymentsAnalytics, useRequestTransfer, useAdminPaymentsHistory } from '@/lib/query/use-payments-analytics'

const FINANCE_TABS = [
  'Hesabatlıq',
  'Ödəniş tarixçəsi',
  'Köçürmələrin tarixçəsi',
  'Əməliyyat loqları',
  'Balans tarixçəsi',
] as const

type FinanceTab = (typeof FINANCE_TABS)[number]

type Option = {
  label: string
  value: string
}

const AXIS_LABELS = ['1.0', '0.8', '0.6', '0.4', '0.2', '0']
const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

const STATUS_OPTIONS: Option[] = [
  { label: 'Statusu seçin', value: 'all' },
  { label: 'Təsdiq edildi', value: 'approved' },
  { label: 'İmtina edildi', value: 'declined' },
]

const PAYMENT_KIND_OPTIONS: Option[] = [
  { label: 'Növü seçin', value: 'all' },
  { label: 'Birbaşa ödəniş', value: 'direct' },
  { label: 'Google / Apple Pay', value: 'gpay_apple' },
  { label: 'Click to Pay', value: 'click_to_pay' },
  { label: 'Taksit', value: 'installment' },
  { label: 'Cüzdan', value: 'wallet' },
  { label: 'Pre - avtorizasiya', value: 'pre_auth' },
  { label: 'Birpos', value: 'birpos' },
  { label: 'Kreditlər', value: 'credits' },
  { label: 'Abunalik', value: 'subscription' },
]

const OPERATION_OPTIONS: Option[] = [
  { label: 'Növü seçin', value: 'all' },
  { label: 'İstifadəçi ödənişi', value: 'user_payment' },
  { label: 'Ödəniş kartının hesaba bağlanması', value: 'card_bind' },
  { label: 'Əməliyyatın ləğvi', value: 'cancel' },
  { label: 'Kartın silinməsi', value: 'card_delete' },
  { label: 'Abunə', value: 'subscribe' },
  { label: 'Saxlanmış kartla ödəniş', value: 'saved_card' },
  { label: 'Vəsaitin ödənilməsi', value: 'funds_payment' },
  { label: 'Kartın qeydiyyatı və ödənişi', value: 'register_and_pay' },
]

const CHANNEL_OPTIONS: Option[] = [
  { label: 'Hamısı', value: 'all' },
  { label: 'Biznes səhifə', value: 'business_page' },
  { label: 'API qoşulma', value: 'api_connection' },
  { label: 'Geri qaytarma', value: 'refund' },
]

const SOURCE_OPTIONS: Option[] = [
  { label: 'Ödəniş mənbəyini seçin', value: 'all' },
  { label: 'Biznes səhifə', value: 'business_page' },
  { label: 'Lending səhifə', value: 'lending_page' },
  { label: 'Otel', value: 'hotel' },
  { label: 'Link ilə ödəniş', value: 'link_payment' },
  { label: 'Əmlak', value: 'real_estate' },
  { label: 'Parqour', value: 'parkour' },
  { label: 'Parqour Cash', value: 'parkour_cash' },
  { label: 'Parqour No Cash', value: 'parkour_no_cash' },
  { label: 'Birpos', value: 'birpos' },
  { label: 'Kreditlər', value: 'credits' },
  { label: 'Abunalik', value: 'subscription' },
]

const PAYMENT_HISTORY_ROWS = [
  {
    id: 1,
    owner: 'Fitnest MMC',
    paymentType: 'Google Pay',
    method: 'API qoşulma',
    desc: 'Göndərənin adı: Seymur\nSifariş nömrəsi: b54435-b53535-f54336-26363\nAbunəlik: Bronze (1ay)',
    rrn: '613210082382',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
  {
    id: 2,
    owner: 'Fitnest MMC',
    paymentType: 'Apple Pay',
    method: 'Biznes səhifə',
    desc: 'Monthly package payment',
    rrn: '613210082382',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
]

const OPERATION_LOG_ROWS = [
  {
    id: 1,
    operation: 'Kartın qeydiyyatı və ödənişi',
    status: 'Bilinməyən bank xətası',
    statusColor: 'red' as const,
    description: 'Fitnest MMC: Fitness package\nmonthly payment',
    user: 'İstifadəçi tapılmadı',
    card: '*****3830',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
  {
    id: 2,
    operation: 'İstifadəçi ödənişi',
    status: 'Təsdiqlənib',
    statusColor: 'green' as const,
    description: 'Fitnest MMC: Fitness package\nmonthly payment',
    user: 'Fitnest MMC',
    card: '*****3830',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
  {
    id: 3,
    operation: 'Kartın qeydiyyatı və ödənişi',
    status: 'Linkin müddəti bitib',
    statusColor: 'red' as const,
    description: 'Fitnest MMC: Fitness package\nmonthly payment',
    user: 'İstifadəçi tapılmadı',
    card: '*****3830',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
  {
    id: 4,
    operation: 'Kartın qeydiyyatı və ödənişi',
    status: 'Timeout error',
    statusColor: 'red' as const,
    description: 'Fitnest MMC: Fitness package\nmonthly payment',
    user: 'İstifadəçi tapılmadı',
    card: '*****3830',
    amount: '3 AZN',
    date: '01.01.2026 21:05:01',
  },
]

function formatPeriodLabel(range?: DateRange) {
  if (!range?.from || !range?.to) return 'Dövr'
  return `${format(range.from, 'yyyy.MM.d')} - ${format(range.to, 'yyyy.MM.d')}`
}

function getRangeDateValues(range?: DateRange) {
  const fallback = '01.05.2026'
  return {
    from: range?.from ? format(range.from, 'dd.MM.yyyy') : fallback,
    to: range?.to ? format(range.to, 'dd.MM.yyyy') : fallback,
  }
}

import { useT } from '@/lib/i18n'

function FinanceTabs({ active, onChange }: { active: FinanceTab; onChange: (tab: FinanceTab) => void }) {
  const t = useT()

  const getTabTitle = (tab: FinanceTab) => {
    switch (tab) {
      case 'Hesabatlıq':
        return t.paymentsPage.tabs.reporting
      case 'Ödəniş tarixçəsi':
        return t.paymentsPage.tabs.paymentHistory
      case 'Köçürmələrin tarixçəsi':
        return t.paymentsPage.tabs.transferHistory
      case 'Əməliyyat loqları':
        return t.paymentsPage.tabs.operationLogs
      case 'Balans tarixçəsi':
        return t.paymentsPage.tabs.balanceHistory
      default:
        return tab
    }
  }

  return (
    <div className="w-full flex items-center justify-between gap-0 text-sm font-semibold sm:text-base text-[#71717a] border-b border-[#e4e4e7] overflow-x-auto">
      {FINANCE_TABS.map((tab) => {
        const isActive = active === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              'flex-1 flex items-center justify-center py-2.5 px-3 border-b-2 text-center transition-all shrink-0 sm:shrink cursor-pointer',
              isActive
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-[#71717a] hover:text-black hover:border-[#d4d4d4]',
            )}
          >
            <span className="truncate">{getTabTitle(tab)}</span>
          </button>
        )
      })}
    </div>
  )
}

function FilterToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-10 sm:h-11 items-center gap-2 rounded-lg sm:rounded-xl px-4 text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer select-none',
        open
          ? 'bg-gradient-to-r from-[#00b4cc] to-[#009fb4] text-white shadow-md shadow-[#00b4cc]/20 scale-[1.01] border border-[#00b4cc]'
          : 'bg-[#fafafa] text-[#001028] border border-[#ececed] hover:bg-[#f0fdff] hover:border-[#00b4cc] hover:text-[#00b4cc]',
      )}
    >
      <Image
        src="/filter.svg"
        alt="Filter"
        width={18}
        height={18}
        className={cn(
          'transition-transform duration-300 ease-in-out',
          open ? 'brightness-0 invert rotate-180 scale-110' : 'rotate-0 scale-100 opacity-80',
        )}
      />
      Filtr
    </button>
  )
}

function SelectFilter({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: Option[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => options.find((o) => o.value === value) ?? options[0], [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 sm:h-11 items-center justify-between rounded-lg sm:rounded-xl border border-[#ececed] bg-[#fafafa] px-3.5 text-sm font-medium text-[#101828]',
            className,
          )}
        >
          <span className="truncate">{selected.label}</span>
          <ChevronDown size={18} className="shrink-0 text-[#6b7280]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] rounded-xl border-[#e5e7eb] p-2 sm:w-[380px]">
        <div className="max-h-[380px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#edf8fb]',
                value === option.value && 'bg-[#edf8fb] font-medium text-[#00b4cc]',
              )}
            >
              {value === option.value ? <Check size={16} /> : <span className="h-[16px] w-[16px]" />}
              {option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DateField({ value }: { value: string }) {
  return (
    <div className="flex h-10 sm:h-11 items-center rounded-lg sm:rounded-xl border border-[#ececed] bg-[#fafafa] px-3.5 text-sm font-medium text-[#101828]">
      {value}
    </div>
  )
}

function DateFieldPicker({
  value,
  onChange,
  placeholder,
}: {
  value?: Date
  onChange: (date?: Date) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 sm:h-11 items-center justify-between rounded-lg sm:rounded-xl border border-[#ececed] bg-[#fafafa] px-3.5 text-sm font-medium text-[#101828] cursor-pointer hover:bg-white hover:border-[#00b4cc] transition-colors"
        >
          <span>{value ? format(value, 'dd.MM.yyyy') : placeholder}</span>
          <Calendar size={18} className="text-[#00b4cc] shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2 rounded-xl border-[#e5e7eb] bg-white shadow-xl">
        <DatePicker
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d)
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function SearchField({ placeholder = 'Axtarış' }: { placeholder?: string }) {
  return (
    <input
      placeholder={placeholder}
      className="h-10 sm:h-11 rounded-lg sm:rounded-xl border border-[#ececed] bg-[#fafafa] px-3.5 text-sm text-[#101828] outline-none placeholder:text-[#9ca3af] focus:border-[#00b4cc] focus:bg-white transition-all"
    />
  )
}

function ApplyButton() {
  return (
    <button
      type="button"
      className="h-10 sm:h-11 px-5 rounded-lg sm:rounded-xl bg-[#00b4cc] text-sm font-semibold text-white hover:bg-[#009fb4] transition-colors flex items-center justify-center cursor-pointer"
    >
      Tətbiq edin
    </button>
  )
}

function StatusPill({ label, color }: { label: string; color: 'red' | 'green' }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center justify-center rounded-full px-3 text-[11px] font-semibold text-white',
        color === 'green' ? 'bg-[#438b58]' : 'bg-[#d15d63]',
      )}
    >
      {label}
    </span>
  )
}

function TrendBadge({ value, positive = false }: { value: string; positive?: boolean }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-[#00b4cc]/15 px-2 py-0.5">
      <Image
        src={positive ? '/High-Low.svg' : '/trend-down.svg'}
        alt=""
        width={14}
        height={14}
        className="h-3.5 w-3.5 shrink-0"
      />
      <span className="text-xs font-medium text-[#101828]">{value}</span>
    </div>
  )
}

function generatePathFromValues(values: number[] = [], width = 439, height = 110) {
  if (!values || values.length === 0 || values.every((v) => v === 0)) {
    return {
      pathD: `M 0 ${height} L ${width} ${height}`,
      areaD: `M 0 ${height} L ${width} ${height} L ${width} ${height} L 0 ${height} Z`,
      yLabels: ['1.0', '0.8', '0.6', '0.4', '0.2', '0'],
    }
  }

  const maxVal = Math.max(...values, 1)
  const minVal = 0
  const range = maxVal - minVal

  const step = maxVal / 5
  const yLabels = Array.from({ length: 6 }, (_, i) => {
    const val = (5 - i) * step
    return maxVal >= 10 ? Math.round(val).toLocaleString() : val.toFixed(1)
  })

  const points = values.map((val, idx) => {
    const x = values.length === 1 ? width / 2 : (idx / (values.length - 1)) * width
    const norm = range === 0 ? 0 : (val - minVal) / range
    const y = height - norm * (height - 15)
    return { x, y }
  })

  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cp1x = curr.x + (next.x - curr.x) / 2
    const cp1y = curr.y
    const cp2x = curr.x + (next.x - curr.x) / 2
    const cp2y = next.y
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
  }

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return { pathD, areaD, yLabels }
}

function ChartGraphic({ withCurve = false, values = [] }: { withCurve?: boolean; values?: number[] }) {
  const { pathD, areaD, yLabels } = useMemo(() => generatePathFromValues(values), [values])

  return (
    <div className="mt-4 w-full">
      <div className="grid grid-cols-[44px_1fr] gap-2 items-stretch">
        <div className="flex flex-col justify-between text-xs font-medium text-[#7d94a0] select-none text-right pr-1">
          {yLabels.map((lbl, idx) => (
            <span key={idx} className="truncate">{lbl}</span>
          ))}
        </div>

        <div className="relative h-[110px] w-full flex items-end">
          {withCurve ? (
            <svg viewBox="0 0 439 110" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B4CC" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00B4CC" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#chartGrad)" />
              <path
                d={pathD}
                fill="none"
                stroke="#00B4CC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="w-full h-[3px] bg-[#00b4cc] rounded-full mb-1" />
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentMetricCard({
  title,
  value,
  ops,
  trend,
  positive = false,
  withCurve = false,
  chartValues = [],
}: {
  title: string
  value: string
  ops: string
  trend: string
  positive?: boolean
  withCurve?: boolean
  chartValues?: number[]
}) {
  const t = useT()
  return (
    <section className="flex-1 w-full rounded-xl border border-[#ececed] bg-white p-4 sm:p-5 flex flex-col justify-between gap-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <h3 className="text-sm font-semibold text-[#101828] sm:text-base">{title}</h3>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <b className="text-lg sm:text-xl font-bold text-[#001028]">{value}</b>
            <TrendBadge value={trend} positive={positive} />
          </div>
          <p className="text-xs font-medium text-[#6b7280]">
            {t.paymentsPage.operationsCount.replace('{count}', ops)}
          </p>
        </div>
      </div>

      <ChartGraphic withCurve={withCurve} values={chartValues} />
    </section>
  )
}

function ReportTabContent({
  periodOpen,
  setPeriodOpen,
  periodRange,
  setPeriodRange,
  calendarMonth,
  setCalendarMonth,
  yearOptions,
  transferOpen,
  setTransferOpen,
  transferAmount,
  setTransferAmount,
}: {
  periodOpen: boolean
  setPeriodOpen: (v: boolean) => void
  periodRange: DateRange | undefined
  setPeriodRange: (v: DateRange | undefined) => void
  calendarMonth: Date
  setCalendarMonth: (d: Date) => void
  yearOptions: number[]
  transferOpen: boolean
  setTransferOpen: (v: boolean) => void
  transferAmount: string
  setTransferAmount: (v: string) => void
}) {
  const t = useT()
  const { data: analytics, isLoading: analyticsLoading } = usePaymentsAnalytics()
  const transferMutation = useRequestTransfer()
  const transferAmountNumber = Number(transferAmount || '0')
  const commission = 0
  const transferNet = Number.isFinite(transferAmountNumber) ? transferAmountNumber : 0

  const accAmount = analytics?.accumulatedAmount ?? 0
  const payAmount = analytics?.totalPaymentsAmount ?? 0
  const payCount = analytics?.totalPaymentsCount ?? 0
  const payTrend = analytics?.paymentsTrendPct ?? 0
  const payPositive = analytics?.isPaymentsPositive ?? false
  const transAmount = analytics?.totalTransfersAmount ?? 0
  const transCount = analytics?.totalTransfersCount ?? 0
  const transTrend = analytics?.transfersTrendPct ?? 0
  const transPositive = analytics?.isTransfersPositive ?? false
  const opsCount = analytics?.operationLogsCount ?? 0
  const opsTrend = analytics?.operationLogsTrendPct ?? 0
  const opsPositive = analytics?.isOperationLogsPositive ?? false

  return (
    <>
      {/* Toplanılan Məbləğ Card */}
      <section className="w-full rounded-xl border border-[#ececed] bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#00b4cc]/15 p-2 flex items-center justify-center shrink-0">
            <Image src="/coin.svg" alt="Coin" width={20} height={20} className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-[#101828] sm:text-base">{t.paymentsPage.accumulatedAmount}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="text-lg sm:text-xl font-bold text-[#101828]">
            {analyticsLoading ? '...' : `${accAmount.toFixed(2)} AZN`}
          </span>
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            className="h-9 rounded-lg bg-[#00b4cc] px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#009fb4] cursor-pointer"
          >
            {t.paymentsPage.transferRequest}
          </button>
        </div>
      </section>

      {/* Ödəniş Chart Section */}
      <section className="w-full rounded-xl border border-[#ececed] bg-white p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <h2 className="text-sm font-semibold text-[#101828] sm:text-base">{t.paymentsPage.payment}</h2>
            <div className="flex items-center gap-3">
              <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 sm:h-9 items-center gap-2 rounded-lg border border-[#ececed] bg-[#fafafa] px-3 text-xs sm:text-sm font-medium text-[#3f3f46] hover:bg-white transition-colors cursor-pointer"
                  >
                    <Calendar size={14} className="shrink-0 text-[#00b4cc]" />
                    <span className="flex-1 text-left">{formatPeriodLabel(periodRange)}</span>
                    <ChevronDown size={14} className={cn('shrink-0 text-[#71717a] transition-transform', periodOpen && 'rotate-180')} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" sideOffset={10} className="w-auto rounded-xl border-[#d9d9d9] p-0 shadow-xl">
                  <div className="rounded-xl bg-white p-3">
                    <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#f5f5f5]"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="flex items-center gap-2">
                        <select
                          value={getMonth(calendarMonth)}
                          onChange={(e) => setCalendarMonth(setMonth(calendarMonth, Number(e.target.value)))}
                          className="h-7 rounded-md border border-[#d9d9d9] bg-white px-2 text-xs"
                        >
                          {MONTHS.map((m, idx) => (
                            <option key={m} value={idx}>
                              {m}
                            </option>
                          ))}
                        </select>

                        <select
                          value={getYear(calendarMonth)}
                          onChange={(e) => setCalendarMonth(setYear(calendarMonth, Number(e.target.value)))}
                          className="h-7 rounded-md border border-[#d9d9d9] bg-white px-2 text-xs"
                        >
                          {yearOptions.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#f5f5f5]"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <DatePicker
                      mode="range"
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      selected={periodRange}
                      onSelect={setPeriodRange}
                      className="bg-white p-2"
                      classNames={{
                        months: 'flex flex-col',
                        month: 'gap-3',
                        month_caption: 'hidden',
                        nav: 'hidden',
                        weekdays: 'mt-1',
                        weekday: 'text-xs font-normal text-[#7a7a7a]',
                        week: 'mt-1',
                        day: 'aspect-square p-0',
                        day_button:
                          'h-8 w-8 rounded-md text-xs font-normal text-[#2b2b2b] hover:bg-[#f5f5f5] data-[selected-single=true]:bg-[#00b4cc] data-[selected-single=true]:text-white data-[range-start=true]:bg-[#00b4cc] data-[range-start=true]:text-white data-[range-end=true]:bg-[#00b4cc] data-[range-end=true]:text-white data-[range-middle=true]:bg-[#efefef] data-[range-middle=true]:text-[#2b2b2b]',
                        outside: 'text-[#b8b8b8]',
                        today: 'bg-transparent text-[#2b2b2b]',
                      }}
                    />
                    <div className="pt-1 pb-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodRange(undefined)
                          setPeriodOpen(false)
                        }}
                        className="text-xs font-medium text-[#00b4cc] hover:opacity-80"
                      >
                        Təmizlə
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <b className="text-lg sm:text-xl font-bold text-[#001028]">
                {analyticsLoading ? '...' : `${payAmount.toFixed(2)} AZN`}
              </b>
              <TrendBadge value={`${payTrend >= 0 ? '+' : ''}${payTrend.toFixed(0)}%`} positive={payPositive} />
            </div>
            <p className="text-xs font-medium text-[#6b7280]">
              {t.paymentsPage.operationsCount.replace('{count}', String(payCount))}
            </p>
          </div>
        </div>

        <ChartGraphic withCurve={true} values={analytics?.paymentTrendPoints ?? []} />
      </section>

      {/* 2 Charts Side by Side */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PaymentMetricCard
          title={t.paymentsPage.transfers}
          value={analyticsLoading ? '...' : `${transAmount.toFixed(2)} AZN`}
          trend={`${transTrend >= 0 ? '+' : ''}${transTrend.toFixed(0)}%`}
          ops={String(transCount)}
          positive={transPositive}
          withCurve={false}
        />
        <PaymentMetricCard
          title={t.paymentsPage.operationLogs}
          value={analyticsLoading ? '...' : t.paymentsPage.operationsShort.replace('{count}', String(opsCount))}
          trend={`${opsTrend >= 0 ? '+' : ''}${opsTrend.toFixed(0)}%`}
          ops={String(opsCount)}
          positive={opsPositive}
          withCurve={true}
          chartValues={analytics?.operationLogsTrendPoints ?? []}
        />
      </div>

      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" onClick={() => setTransferOpen(false)}>
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#3b3b3b] hover:bg-[#f3f4f6]"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-center text-[18px] font-semibold text-[#1f2937]">{t.paymentsPage.transferModalTitle}</h3>

            <div className="mt-4">
              <label className="mb-1.5 block text-[14px] font-normal text-[#1f2937]">{t.paymentsPage.amount}</label>
              <input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-[10px] border border-[#d9d9d9] px-3 text-[15px] text-[#212121] outline-none focus:border-[#00b4cc]"
              />
            </div>

            <p className="mt-3 text-[16px] font-medium text-[#1f2937]">
              {t.paymentsPage.commission}: <span className="font-semibold">{commission.toFixed(2)} AZN</span>
            </p>
            <p className="mt-2 text-[16px] font-medium text-[#1f2937]">
              {t.paymentsPage.paymentAmount}: <span className="font-semibold">{transferNet.toFixed(2)} AZN</span>
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={transferMutation.isPending}
                onClick={async () => {
                  const amt = Number(transferAmount)
                  if (!amt || amt <= 0) return
                  try {
                    await transferMutation.mutateAsync({ amount: amt })
                    setTransferOpen(false)
                  } catch (err) {
                    // error handled by mutation
                  }
                }}
                className="h-10 rounded-[10px] border border-[#00b4cc] text-[15px] font-medium text-[#161616] transition-colors hover:bg-[#f0fdff] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {t.paymentsPage.send}
              </button>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="h-10 rounded-[10px] bg-[#00b4cc] text-[15px] font-medium text-white transition-colors hover:bg-[#009fb4]"
              >
                {t.paymentsPage.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PaymentHistoryTab({ periodRange }: { periodRange?: DateRange }) {
  const [showFilter, setShowFilter] = useState(false)
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value)
  const [kind, setKind] = useState(PAYMENT_KIND_OPTIONS[0].value)
  const [source, setSource] = useState(SOURCE_OPTIONS[0].value)
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 10

  const { data: paymentsList, isLoading } = useAdminPaymentsHistory()

  const rows = paymentsList ?? []
  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      if (kind !== 'all' && item.cardBrand && !item.cardBrand.toLowerCase().includes(kind.toLowerCase())) return false
      if (status !== 'all' && item.status && !item.status.toLowerCase().includes(status.toLowerCase())) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchOwner = item.owner?.toLowerCase().includes(q)
        const matchRrn = item.transactionId?.toLowerCase().includes(q)
        const matchPan = item.maskedPan?.toLowerCase().includes(q)
        const matchDesc = item.description?.toLowerCase().includes(q)
        if (!matchOwner && !matchRrn && !matchPan && !matchDesc) return false
      }
      if (startDate && item.occurredAt) {
        if (new Date(item.occurredAt) < startDate) return false
      }
      if (endDate && item.occurredAt) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(item.occurredAt) > end) return false
      }
      return true
    })
  }, [rows, kind, status, searchQuery, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE))
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filteredRows.slice(start, start + PER_PAGE)
  }, [filteredRows, currentPage])

  const totalSum = useMemo(() => {
    return filteredRows.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }, [filteredRows])

  return (
    <section className="w-full rounded-xl bg-white border border-[#ececed] p-4 sm:p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <FilterToggleButton open={showFilter} onClick={() => setShowFilter((v) => !v)} />
      </div>

      {showFilter && (
        <div className="flex flex-col gap-3 text-sm text-[#101828]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              placeholder="Axtarış"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 sm:h-11 rounded-lg sm:rounded-xl border border-[#ececed] bg-[#fafafa] px-3.5 text-sm text-[#101828] outline-none placeholder:text-[#9ca3af] focus:border-[#00b4cc] focus:bg-white transition-all"
            />
            <DateFieldPicker value={startDate} onChange={setStartDate} placeholder="Başlanğıc tarixi" />
            <DateFieldPicker value={endDate} onChange={setEndDate} placeholder="Bitiş tarixi" />
            <SelectFilter
              value={kind}
              onChange={(v) => {
                setKind(v)
                setCurrentPage(1)
              }}
              options={PAYMENT_KIND_OPTIONS}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SelectFilter
              value={status}
              onChange={(v) => {
                setStatus(v)
                setCurrentPage(1)
              }}
              options={STATUS_OPTIONS}
              className="w-[220px]"
            />
            <SelectFilter
              value={source}
              onChange={(v) => {
                setSource(v)
                setCurrentPage(1)
              }}
              options={SOURCE_OPTIONS}
              className="min-w-[220px]"
            />
            <ApplyButton />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#ececed]">
        <div className="min-w-[1200px] bg-[#00b4cc]/15 dark:bg-[#00b4cc]/10 px-4 py-3 text-xs font-bold uppercase text-foreground/80">
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1.6fr_1fr_0.9fr_1.1fr_0.9fr_1.1fr_1fr_1fr_34px] items-center gap-3">
            <span>Kart sahibi</span>
            <span>Ödəniş növü</span>
            <span>Ödəniş üsulu</span>
            <span>Təsvir</span>
            <span>RRN</span>
            <span>Məbləğ ↑</span>
            <span>Tarix ↑</span>
            <span>Komissiya ↑</span>
            <span>Əməliyyat Komissiyası ↑</span>
            <span>Kartın nömrəsi</span>
            <span>Ödəniş qəbzi</span>
            <span />
          </div>
        </div>

        <div className="min-w-[1200px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-[#00b4cc] gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Yüklənir...</span>
            </div>
          ) : paginatedRows.length > 0 ? (
            paginatedRows.map((row) => {
              const isOpen = expanded === row.paymentId
              const dateStr = row.occurredAt ? format(new Date(row.occurredAt), 'dd.MM.yyyy HH:mm') : '-'
              return (
                <div key={row.paymentId}>
                  <div className="grid grid-cols-[1.1fr_1fr_1fr_1.6fr_1fr_0.9fr_1.1fr_0.9fr_1.1fr_1fr_1fr_34px] items-center gap-3 border-b border-[#ececed] px-3.5 py-3.5 text-[15px] text-[#4b5563]">
                    <span>{row.owner || 'Fitnest MMC'}</span>
                    <span>{row.cardBrand || 'Google Pay'}</span>
                    <span>{row.type || 'API qoşulma'}</span>
                    <span className="whitespace-pre-line truncate">{row.description || 'Abunəlik Ödənişi'}</span>
                    <span>{row.transactionId || '-'}</span>
                    <span>{row.amount ? `${row.amount.toFixed(2)} ${row.currency || 'AZN'}` : '0.00 AZN'}</span>
                    <span>{dateStr}</span>
                    <span>₼ 0.00</span>
                    <span>₼ 0.00</span>
                    <span>{row.maskedPan || '**** 4127'}</span>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#00b4cc] px-2.5 py-1 text-[13px] font-medium text-[#00b4cc] hover:bg-[#00b4cc]/10 transition-colors cursor-pointer"
                      >
                        <Image src="/Downloadİcon.svg" alt="" width={14} height={14} />
                        Yüklə
                      </button>
                    </div>
                    <button
                      type="button"
                      className="flex items-center justify-center text-[#8a8a8a] cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : row.paymentId)}
                    >
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-b border-[#ececed] bg-[#fafafa] px-5 py-4 text-[14px] text-[#4b5563]">
                      <div className="grid grid-cols-1 gap-2.5 md:max-w-[460px]">
                        <InfoLine label="RRN" value={row.transactionId || '-'} />
                        <InfoLine label="Tarix" value={dateStr} />
                        <InfoLine label="Komissiya" value="₼ 0.00" />
                        <InfoLine label="Əməliyyat komissiyası" value="₼ 0.00" />
                        <InfoLine label="Kartın nömrəsi" value={row.maskedPan || '**** **** **** 4127'} />
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[13px] text-[#4b5563]">Ödəniş qəbzi</span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#00b4cc] px-3 py-1 text-[13px] font-medium text-[#00b4cc] hover:bg-[#00b4cc]/10 transition-colors cursor-pointer"
                          >
                            <Image src="/Downloadİcon.svg" alt="" width={14} height={14} />
                            Yüklə
                          </button>
                        </div>
                        <InfoLine label="Yerinə yetirdi" value="API" />
                        <InfoLine label="Operator" value="-//-" />
                        <InfoLine label="Ödəniş mənbəyi" value="-//-" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-3 py-10 text-center text-[15px] text-[#7a7a7a]">
              Seçilmiş dövr üçün heç bir məlumat tapılmadı.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-[#ececed] px-4 py-3 bg-white">
              {pages.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer',
                    p === currentPage ? 'bg-[#00b4cc] text-white font-semibold' : 'text-[#4b5563] hover:bg-[#f3f4f6]',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end px-4 py-3 text-[18px] font-medium text-[#001028]">
            Cəmi: {totalSum.toFixed(2)} AZN
          </div>
        </div>
      </div>
    </section>
  )
}

function TransferHistoryTab({ periodRange }: { periodRange?: DateRange }) {
  const [showFilter, setShowFilter] = useState(true)
  const { from, to } = getRangeDateValues(periodRange)

  return (
    <section className="rounded-2xl border border-[#d6d6d6] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <FilterToggleButton open={showFilter} onClick={() => setShowFilter((v) => !v)} />
      </div>

      {showFilter && (
        <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_220px]">
          <SearchField />
          <DateField value={from} />
          <DateField value={to} />
          <ApplyButton />
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[1100px] rounded-2xl bg-[#b9dbe3] px-3 py-3 text-[15px] font-medium text-[#6e6f72]">
          <div className="grid grid-cols-[1fr_1fr_1fr_0.8fr_1fr_0.9fr_1.2fr_0.9fr_1fr] gap-2">
            <span>Ad</span>
            <span>Kateqoriya</span>
            <span>Təsvir</span>
            <span>RRN</span>
            <span>Tarix ↑</span>
            <span>Məbləğ ↑</span>
            <span>Yerinə yetirdi ↑</span>
            <span>Cəmi ↑</span>
            <span>Ödəniş qəbzi ↑</span>
          </div>
        </div>
        <div className="py-8 text-center text-[14px] text-[#7a7a7a]">Seçilmiş dövr üçün heç bir məlumat tapılmadı.</div>
      </div>
    </section>
  )
}

function OperationLogsTab({ periodRange }: { periodRange?: DateRange }) {
  const [showFilter, setShowFilter] = useState(true)
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value)
  const [kind, setKind] = useState(PAYMENT_KIND_OPTIONS[0].value)
  const [operationKind, setOperationKind] = useState(OPERATION_OPTIONS[0].value)
  const [channel, setChannel] = useState(CHANNEL_OPTIONS[0].value)
  const [source, setSource] = useState(SOURCE_OPTIONS[0].value)
  const [expanded, setExpanded] = useState<number | null>(1)
  const { from, to } = getRangeDateValues(periodRange)

  return (
    <section className="rounded-2xl border border-[#d6d6d6] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <FilterToggleButton open={showFilter} onClick={() => setShowFilter((v) => !v)} />
      </div>

      {showFilter && (
        <div className="mb-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <SearchField />
            <DateField value={from} />
            <DateField value={to} />
            <SelectFilter value={kind} onChange={setKind} options={PAYMENT_KIND_OPTIONS} />
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
            <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} />
            <SelectFilter value={operationKind} onChange={setOperationKind} options={OPERATION_OPTIONS} />
            <SelectFilter value={channel} onChange={setChannel} options={CHANNEL_OPTIONS} />
            <SelectFilter value={source} onChange={setSource} options={SOURCE_OPTIONS} />
            <ApplyButton />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[1100px] rounded-t-2xl bg-[#b9dbe3] px-2 py-3 text-[15px] font-medium text-[#6e6f72]">
          <div className="grid grid-cols-[1.4fr_1fr_1.8fr_1fr_0.8fr_0.8fr_1fr_34px] items-center gap-3">
            <span>Əməliyyat ↑</span>
            <span>Status</span>
            <span>Təsvir</span>
            <span>İstifadəçi</span>
            <span>Kart</span>
            <span>Məbləğ ↑</span>
            <span>Tarix ↑</span>
            <span />
          </div>
        </div>

        <div className="min-w-[1100px] border-x border-b border-[#d6d6d6]">
          {OPERATION_LOG_ROWS.map((row) => {
            const isOpen = expanded === row.id
            return (
              <div key={row.id}>
                <div className="grid grid-cols-[1.4fr_1fr_1.8fr_1fr_0.8fr_0.8fr_1fr_34px] items-start gap-3 border-b border-[#d6d6d6] px-2 py-3 text-[14px] text-[#8a8a8a]">
                  <span className="whitespace-pre-line">{row.operation}</span>
                  <span>
                    <StatusPill label={row.status} color={row.statusColor} />
                  </span>
                  <span className="whitespace-pre-line">{row.description}</span>
                  <span>{row.user}</span>
                  <span>{row.card}</span>
                  <span>{row.amount}</span>
                  <span>{row.date}</span>
                  <button
                    type="button"
                    className="mt-0.5 flex items-center justify-center text-[#8a8a8a]"
                    onClick={() => setExpanded(isOpen ? null : row.id)}
                  >
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="border-b border-[#d6d6d6] px-4 py-3 text-[14px] text-[#8a8a8a]">
                    <div className="grid grid-cols-1 gap-2 md:max-w-[420px]">
                      <InfoLine label="RRN" value="424353Y63677" />
                      <InfoLine label="Tarix" value="12.05.2026 14:41" />
                      <InfoLine label="Komissiya" value="₼ 0.00" />
                      <InfoLine label="Əməliyyat komissiyası" value="₼ 0.00" />
                      <InfoLine label="**** **** **** 4127" value="₼ 0.00" />
                      <InfoLine label="Ödəniş qəbzi" value="Yüklə" />
                      <InfoLine label="Yerinə yetirdi" value="API" />
                      <InfoLine label="Operator" value="-//-" />
                      <InfoLine label="Ödəniş mənbəyi" value="-//-" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function BalanceHistoryTab({ periodRange }: { periodRange?: DateRange }) {
  const [showFilter, setShowFilter] = useState(false)
  const [showRows, setShowRows] = useState(false)
  const { from, to } = getRangeDateValues(periodRange)

  return (
    <section className="rounded-2xl border border-[#d6d6d6] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <FilterToggleButton open={showFilter} onClick={() => setShowFilter((v) => !v)} />
      </div>

      {showFilter && (
        <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_220px]">
          <DateField value={from} />
          <DateField value={to} />
          <button
            type="button"
            onClick={() => setShowRows(true)}
            className="h-12 rounded-xl bg-[#10adc2] px-8 text-[15px] font-medium text-white"
          >
            Tətbiq edin
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px] rounded-t-2xl bg-[#b9dbe3] px-3 py-3 text-[15px] font-medium text-[#6e6f72]">
          <div className="grid grid-cols-[1fr_1fr_1fr]">
            <span>#</span>
            <span className="text-center">Balans ↑</span>
            <span className="text-right">Tarix ↑</span>
          </div>
        </div>

        <div className="min-w-[900px] border-x border-b border-[#d6d6d6]">
          {showRows ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_1fr] border-b border-[#d6d6d6] px-3 py-3 text-[14px] text-[#767676]">
                <span>1192980</span>
                <span className="text-center">0,88</span>
                <span className="text-right">01.0602026</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-7 text-center text-[14px] text-[#7a7a7a]">Seçilmiş dövr üçün heç bir məlumat tapılmadı.</div>
          )}
        </div>
      </div>
    </section>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px]">{label}</p>
      <p className="text-[14px] text-[#434a57]">{value}</p>
    </div>
  )
}

export function PaymentsAnalyticsPage() {
  const t = useT()
  const [activeTab, setActiveTab] = useState<FinanceTab>('Hesabatlıq')
  const [periodOpen, setPeriodOpen] = useState(false)
  const [periodRange, setPeriodRange] = useState<DateRange | undefined>()
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const yearOptions = Array.from({ length: 16 }, (_, i) => getYear(new Date()) - 6 + i)

  return (
    <div className="flex flex-col gap-7">
      <div className="border-b border-[#dadada] pb-3">
        <h1 className="text-xl font-bold text-[#1e2430]">{t.paymentsPage.title}</h1>
      </div>

      <FinanceTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Hesabatlıq' && (
        <ReportTabContent
          periodOpen={periodOpen}
          setPeriodOpen={setPeriodOpen}
          periodRange={periodRange}
          setPeriodRange={setPeriodRange}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          yearOptions={yearOptions}
          transferOpen={transferOpen}
          setTransferOpen={setTransferOpen}
          transferAmount={transferAmount}
          setTransferAmount={setTransferAmount}
        />
      )}

      {activeTab === 'Ödəniş tarixçəsi' && <PaymentHistoryTab periodRange={periodRange} />}
      {activeTab === 'Köçürmələrin tarixçəsi' && <TransferHistoryTab periodRange={periodRange} />}
      {activeTab === 'Əməliyyat loqları' && <OperationLogsTab periodRange={periodRange} />}
      {activeTab === 'Balans tarixçəsi' && <BalanceHistoryTab periodRange={periodRange} />}
    </div>
  )
}
