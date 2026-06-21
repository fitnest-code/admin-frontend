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
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { addMonths, format, getMonth, getYear, setMonth, setYear } from 'date-fns'
import type { DateRange } from 'react-day-picker'

const FINANCE_TABS = [
  'Hesabatlıq',
  'Ödəniş tarixçəsi',
  'Köçürmələrin tarixçəsi',
  'Əməliyyat loqoları',
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

function FinanceTabs({ active, onChange }: { active: FinanceTab; onChange: (tab: FinanceTab) => void }) {
  return (
    <div className="overflow-x-auto border-b border-[#8e8c8c]">
      <div className="flex min-w-[900px] items-end gap-7 px-4">
        {FINANCE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              'pb-2 text-[14px] font-semibold transition-colors',
              active === tab ? 'border-b-2 border-black text-black' : 'text-[#767676] hover:text-black',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}

function FilterToggleButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-[10px] px-4 text-[15px] font-medium transition-colors',
        open ? 'bg-[#10adc2] text-white' : 'bg-[#10adc2] text-white',
      )}
    >
      <Image src="/filter.svg" alt="Filter" width={18} height={18} />
      Filtr
    </button>
  )
}

function UploadButton() {
  return (
    <button
      type="button"
      className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#00b4cc] px-4 text-[15px] font-medium text-[#00b4cc]"
    >
      <Image src="/Downloadİcon.svg" alt="Yüklə" width={18} height={18} />
      Yüklə
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
            'flex h-12 items-center justify-between rounded-xl border border-[#d9d9d9] bg-white px-3.5 text-[15px] text-[#1d2b43]',
            className,
          )}
        >
          <span className="truncate">{selected.label}</span>
          <ChevronDown size={18} className="shrink-0 text-[#3f4853]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] rounded-xl border-[#e5e7eb] p-2 sm:w-[380px]">
        <div className="max-h-[420px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[15px] text-[#1a1a1a] hover:bg-[#edf8fb]',
                value === option.value && 'bg-[#edf8fb]',
              )}
            >
              {value === option.value ? <Check size={18} /> : <span className="h-[18px] w-[18px]" />}
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
    <div className="flex h-12 items-center rounded-xl border border-[#d9d9d9] bg-white px-3.5 text-[15px] text-[#4b5563]">
      {value}
    </div>
  )
}

function SearchField({ placeholder = 'Axtarış' }: { placeholder?: string }) {
  return (
    <input
      placeholder={placeholder}
      className="h-12 rounded-xl border border-[#d9d9d9] px-3.5 text-[15px] text-[#4b5563] outline-none placeholder:text-[#4b5563]"
    />
  )
}

function ApplyButton() {
  return (
    <button
      type="button"
      className="h-12 rounded-xl bg-[#10adc2] px-6 text-[15px] font-medium text-white"
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
    <div className="inline-flex items-center gap-1 rounded-[10px] bg-[#c6e5eb] px-2 py-1">
      <Image src={positive ? '/High-Low.svg' : '/trend-down.svg'} alt="" width={12} height={12} className="h-3 w-3" />
      <span className="text-[12px] font-medium leading-none text-black">{value}</span>
    </div>
  )
}

function ChartPlaceholder({ withCurve = false }: { withCurve?: boolean }) {
  return (
    <div className="mt-4 w-full">
      <div className="grid grid-cols-[28px_1fr] gap-2">
        <div className="flex flex-col justify-between text-[11px] leading-[1.1] text-[#607d91]">
          {AXIS_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative h-[164px]">
          {withCurve ? (
            <svg viewBox="0 0 640 220" className="h-full w-full" preserveAspectRatio="none">
              <path
                d="M0 212 C40 212, 75 92, 125 84 C160 80, 170 210, 205 210 C258 210, 286 20, 332 20 C368 20, 350 158, 395 158 C425 158, 430 210, 470 210 L640 210"
                fill="rgba(0,180,204,0.18)"
              />
              <path
                d="M0 212 C40 212, 75 92, 125 84 C160 80, 170 210, 205 210 C258 210, 286 20, 332 20 C368 20, 350 158, 395 158 C425 158, 430 210, 470 210 L640 210"
                fill="none"
                stroke="#18c4d8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
          <div className={cn('absolute bottom-0 left-0 h-[4px] w-full bg-[#00b4cc]', withCurve && 'hidden')} />
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
}: {
  title: string
  value: string
  ops: string
  trend: string
  positive?: boolean
  withCurve?: boolean
}) {
  return (
    <section className="rounded-2xl border border-[#cecfd2] bg-white p-4">
      <h3 className="text-[16px] font-semibold leading-tight text-black">{title}</h3>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="text-[20px] font-semibold leading-none text-[#001233]">{value}</p>
        <TrendBadge value={trend} positive={positive} />
      </div>

      <p className="mt-2 text-[13px] font-medium leading-tight text-[#001233]">Əməliyyatlar: {ops}</p>
      <ChartPlaceholder withCurve={withCurve} />
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
  const transferAmountNumber = Number(transferAmount || '0')
  const commission = 0
  const transferNet = Number.isFinite(transferAmountNumber) ? transferAmountNumber : 0

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#cecfd2] bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#c6e5eb]">
            <Image src="/coin.svg" alt="" width={24} height={24} />
          </div>
          <h2 className="text-[15px] font-semibold text-black">Toplanılan məbləğ</h2>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-[15px] font-semibold text-black">0.88 AZN</p>
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            className="h-7 rounded-[10px] bg-[#00b4cc] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#009fb4]"
          >
            Köçürmə sorğusu
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#cecfd2] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[16px] font-semibold leading-tight text-black">Ödəniş</h2>
          <div className="flex items-center gap-4">
            <button type="button" className="h-7 rounded-[10px] border border-[#00b4cc] px-3 text-xs font-medium leading-none text-black">
              Yenilə
            </button>
            <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 min-w-[210px] items-center gap-2 rounded-[10px] border border-[#cecfd2] px-3 text-[13px] font-normal leading-none text-[#191919]"
                >
                  <Calendar size={14} className="shrink-0 text-[#555]" />
                  <span className="flex-1 text-left">{formatPeriodLabel(periodRange)}</span>
                  <ChevronDown size={14} className={cn('shrink-0 text-[#555] transition-transform', periodOpen && 'rotate-180')} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-auto rounded-2xl border-[#d9d9d9] p-0 shadow-xl">
                <div className="rounded-2xl bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f5f5f5]"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                      <select
                        value={getMonth(calendarMonth)}
                        onChange={(e) => setCalendarMonth(setMonth(calendarMonth, Number(e.target.value)))}
                        className="h-8 rounded-[10px] border border-[#d9d9d9] bg-white px-2 text-[13px]"
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
                        className="h-8 rounded-[10px] border border-[#d9d9d9] bg-white px-2 text-[13px]"
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
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#f5f5f5]"
                    >
                      <ChevronRight size={18} />
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
                        'h-10 w-10 rounded-[10px] text-[16px] font-normal text-[#2b2b2b] hover:bg-[#f5f5f5] data-[selected-single=true]:bg-[#11aec2] data-[selected-single=true]:text-white data-[range-start=true]:bg-[#11aec2] data-[range-start=true]:text-white data-[range-end=true]:bg-[#11aec2] data-[range-end=true]:text-white data-[range-middle=true]:bg-[#efefef] data-[range-middle=true]:text-[#2b2b2b]',
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
                      className="text-sm font-medium text-[#00b4cc] hover:opacity-80"
                    >
                      Təmizlə
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <p className="text-[22px] font-semibold leading-none text-[#001233]">0.00 AZN</p>
          <TrendBadge value="-100%" />
        </div>
        <p className="mt-2 text-[13px] font-medium leading-tight text-[#001233]">Əməliyyatlar: 0</p>

        <ChartPlaceholder />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PaymentMetricCard title="Köçürmələr" value="0.00 AZN" trend="-100%" ops="0" />
        <PaymentMetricCard title="Əməliyyat Loqoları" value="Əməliyyatlar 5" trend="+20%" ops="0" positive withCurve />
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

            <h3 className="text-center text-[18px] font-semibold text-[#1f2937]">Köçürmə sorğusu</h3>

            <div className="mt-4">
              <label className="mb-1.5 block text-[14px] font-normal text-[#1f2937]">Məbləğ</label>
              <input
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="h-11 w-full rounded-[10px] border border-[#d9d9d9] px-3 text-[15px] text-[#212121] outline-none focus:border-[#00b4cc]"
              />
            </div>

            <p className="mt-3 text-[16px] font-medium text-[#1f2937]">
              Komissiya: <span className="font-semibold">{commission.toFixed(2)} AZN</span>
            </p>
            <p className="mt-2 text-[16px] font-medium text-[#1f2937]">
              Ödəniş məbləği: <span className="font-semibold">{transferNet.toFixed(2)} AZN</span>
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" className="h-10 rounded-[10px] border border-[#00b4cc] text-[15px] font-medium text-[#161616] transition-colors hover:bg-[#f0fdff]">
                Göndər
              </button>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="h-10 rounded-[10px] bg-[#00b4cc] text-[15px] font-medium text-white transition-colors hover:bg-[#009fb4]"
              >
                Ləğv et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PaymentHistoryTab({ periodRange }: { periodRange?: DateRange }) {
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
        <UploadButton />
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
          <div className="grid grid-cols-[1.2fr_1fr_1fr_2.2fr_1fr_0.8fr_1fr_34px] items-center gap-3">
            <span>Kart sahibi</span>
            <span>Ödəniş növü</span>
            <span>Ödəniş üsulu</span>
            <span>Təsvir</span>
            <span className="text-center">RRN</span>
            <span className="text-center">Məbləğ ↑</span>
            <span className="text-center">Tarix ↑</span>
            <span />
          </div>
        </div>

        <div className="min-w-[1100px] border-x border-b border-[#d6d6d6]">
          {PAYMENT_HISTORY_ROWS.map((row) => {
            const isOpen = expanded === row.id
            return (
              <div key={row.id}>
                <div className="grid grid-cols-[1.2fr_1fr_1fr_2.2fr_1fr_0.8fr_1fr_34px] items-start gap-3 border-b border-[#d6d6d6] px-2 py-3 text-[14px] text-[#8a8a8a]">
                  <span>{row.owner}</span>
                  <span>{row.paymentType}</span>
                  <span>{row.method}</span>
                  <span className="whitespace-pre-line">{row.desc}</span>
                  <span className="text-center">{row.rrn}</span>
                  <span className="text-center">{row.amount}</span>
                  <span className="text-center">{row.date}</span>
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
                    <button
                      type="button"
                      className="mt-3 h-9 rounded-[10px] border border-[#00b4cc] px-4 text-[14px] text-[#00b4cc]"
                    >
                      Geri qaytar
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex justify-end px-3 py-3 text-[14px] text-[#777]">Cəmi: ₼0.01</div>
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
        <UploadButton />
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
        <UploadButton />
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
        <UploadButton />
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
  const [activeTab, setActiveTab] = useState<FinanceTab>('Hesabatlıq')
  const [periodOpen, setPeriodOpen] = useState(false)
  const [periodRange, setPeriodRange] = useState<DateRange | undefined>()
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState('0.89')
  const yearOptions = Array.from({ length: 16 }, (_, i) => getYear(new Date()) - 6 + i)

  return (
    <div className="flex flex-col gap-7">
      <div className="border-b border-[#dadada] pb-3">
        <h1 className="text-xl font-bold text-[#1e2430]">Analitika</h1>
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
      {activeTab === 'Əməliyyat loqoları' && <OperationLogsTab periodRange={periodRange} />}
      {activeTab === 'Balans tarixçəsi' && <BalanceHistoryTab periodRange={periodRange} />}
    </div>
  )
}
