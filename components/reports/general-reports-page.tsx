'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { 
  addMonths, 
  format, 
  getMonth, 
  getYear, 
  setMonth, 
  setYear,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth
} from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Dot,
  BarChart,
  Bar
} from 'recharts'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { apiGet } from '@/lib/api/client'

type PresetKey = 'today' | 'last7' | 'last30' | 'lastMonth' | 'custom'

interface DatePreset {
  key: PresetKey
}

const DATE_PRESETS: DatePreset[] = [
  { key: 'today' },
  { key: 'last7' },
  { key: 'last30' },
  { key: 'lastMonth' },
  { key: 'custom' },
]

const getPresetRange = (preset: PresetKey): DateRange | undefined => {
  const today = new Date()
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'last7':
      return { from: subDays(today, 6), to: today }
    case 'last30':
      return { from: subDays(today, 29), to: today }
    case 'lastMonth': {
      const lastMonthDate = subMonths(today, 1)
      return {
        from: startOfMonth(lastMonthDate),
        to: endOfMonth(lastMonthDate),
      }
    }
    default:
      return undefined
  }
}

const formatISO = (date: Date, isStart: boolean) => {
  const d = new Date(date)
  if (isStart) {
    d.setHours(0, 0, 0, 0)
  } else {
    d.setHours(23, 59, 59, 999)
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// Reusable Date Range Selector Component
interface DateRangeSelectorProps {
  selectedPreset: PresetKey | null
  setSelectedPreset: (key: PresetKey | null) => void
  periodRange: DateRange | undefined
  setPeriodRange: (range: DateRange | undefined) => void
  align?: 'start' | 'end'
  size?: 'sm' | 'md'
  variant?: 'default' | 'inline-teal'
}

function DateRangeSelector({
  selectedPreset,
  setSelectedPreset,
  periodRange,
  setPeriodRange,
  align = 'start',
  size = 'md',
  variant = 'default'
}: DateRangeSelectorProps) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [view, setView] = useState<'presets' | 'calendar'>('presets')

  const yearOptions = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i)

  useEffect(() => {
    if (open) {
      setView(selectedPreset === 'custom' ? 'calendar' : 'presets')
    }
  }, [open, selectedPreset])

  const handleSelectPreset = (preset: PresetKey) => {
    if (preset === 'custom') {
      setSelectedPreset('custom')
      setView('calendar')
    } else {
      setSelectedPreset(preset)
      setPeriodRange(getPresetRange(preset))
      setOpen(false)
    }
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    setPeriodRange(range)
    setSelectedPreset('custom')
  }

  const getPresetLabel = (key: PresetKey) => {
    switch (key) {
      case 'today': return t.reports.today
      case 'last7': return t.reports.last7Days
      case 'last30': return t.reports.last30Days
      case 'lastMonth': return t.reports.lastMonth
      case 'custom': return t.reports.custom
      default: return ''
    }
  }

  const getDisplayLabel = () => {
    if (!selectedPreset) return t.reports.dateRange
    if (selectedPreset === 'custom') {
      if (!periodRange?.from) return t.reports.dateRange
      if (!periodRange.to) return format(periodRange.from, 'dd.MM.yyyy')
      return `${format(periodRange.from, 'dd.MM.yyyy')} - ${format(periodRange.to, 'dd.MM.yyyy')}`
    }
    return getPresetLabel(selectedPreset)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            variant === 'inline-teal'
              ? "inline-flex items-center gap-1 text-[#00b4cc] hover:opacity-85 font-semibold transition-colors cursor-pointer text-[12px] bg-transparent p-0 border-0 outline-none shadow-none"
              : cn(
                  "flex items-center justify-between gap-2.5 rounded-[12px] border border-[#ececed] bg-white text-[#191919] hover:border-[#00b4cc] transition-colors shadow-3xs cursor-pointer",
                  size === 'sm' ? 'h-[36px] min-w-[130px] px-3 text-[13px]' : 'h-[42px] min-w-[170px] px-4 text-[14px]'
                )
          )}
        >
          <span className={cn(variant === 'inline-teal' ? "" : "text-[#191919] truncate")}>{getDisplayLabel()}</span>
          <ChevronDown 
            size={variant === 'inline-teal' ? 12 : (size === 'sm' ? 14 : 16)} 
            className={cn(
              'shrink-0 transition-transform', 
              variant === 'inline-teal' ? 'text-[#00b4cc]' : 'text-gray-500', 
              open && 'rotate-180'
            )} 
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} sideOffset={8} className="w-[240px] rounded-[16px] border-[#ececed] p-0 shadow-xl bg-white z-50 overflow-hidden">
        {view === 'presets' && (
          <div className="flex flex-col bg-white">
            {DATE_PRESETS.map((preset) => {
              const isPresetActive = selectedPreset === preset.key
              const isLastPresetBeforeCustom = preset.key === 'lastMonth'
              
              return (
                <div key={preset.key} className="w-full">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(preset.key)}
                    className={cn(
                      'w-full text-left h-[44px] px-5 flex items-center text-[15px] font-medium transition-colors hover:bg-slate-50 cursor-pointer',
                      isPresetActive ? 'text-[#00b4cc] font-bold' : 'text-black'
                    )}
                  >
                    {getPresetLabel(preset.key)}
                  </button>
                  {isLastPresetBeforeCustom && <div className="w-full h-[1px] bg-[#ececed]" />}
                </div>
              )
            })}
          </div>
        )}
        {view === 'calendar' && (
          <div className="rounded-[16px] bg-white p-3 border border-gray-100 min-w-[280px]">
            <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <button
                type="button"
                onClick={() => setView('presets')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> {t.reports.back}
              </button>
            </div>
            <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-1">
              <button
                type="button"
                onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-2">
                <select
                  value={getMonth(calendarMonth)}
                  onChange={(e) => setCalendarMonth(setMonth(calendarMonth, Number(e.target.value)))}
                  className="h-8 rounded-[8px] border border-[#ececed] bg-white px-2 text-[13px] font-medium outline-none focus:border-[#00b4cc]"
                >
                  {t.reports.months.map((m: string, idx: number) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
                <select
                  value={getYear(calendarMonth)}
                  onChange={(e) => setCalendarMonth(setYear(calendarMonth, Number(e.target.value)))}
                  className="h-8 rounded-[8px] border border-[#ececed] bg-white px-2 text-[13px] font-medium outline-none focus:border-[#00b4cc]"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <DatePicker
              mode="range"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              selected={periodRange}
              onSelect={handleCustomDateSelect}
              className="bg-white p-1"
              classNames={{
                months: 'flex flex-col',
                month: 'gap-3',
                month_caption: 'hidden',
                nav: 'hidden',
                weekdays: 'mt-1',
                weekday: 'text-xs font-normal text-gray-400 w-9 text-center',
                week: 'mt-1 flex justify-center',
                day: 'aspect-square p-0 w-9 h-9 flex items-center justify-center',
                day_button: cn(
                  'h-8 w-8 rounded-[8px] text-[14px] font-medium text-gray-800 hover:bg-gray-100 flex items-center justify-center transition-colors',
                  'data-[selected-single=true]:bg-[#00b4cc] data-[selected-single=true]:text-white',
                  'data-[range-start=true]:bg-[#00b4cc] data-[range-start=true]:text-white',
                  'data-[range-end=true]:bg-[#00b4cc] data-[range-end=true]:text-white',
                  'data-[range-middle=true]:bg-[#00b4cc]/10 data-[range-middle=true]:text-[#00b4cc]'
                ),
                outside: 'text-gray-300',
                today: 'border border-[#00b4cc] text-[#00b4cc] font-bold bg-transparent',
              }}
            />
            <div className="pt-2 pb-1 flex items-center justify-between border-t border-gray-100 mt-2 px-1">
              <button
                type="button"
                onClick={() => {
                  setPeriodRange(undefined)
                  setSelectedPreset(null)
                  setOpen(false)
                }}
                className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
              >
                {t.reports.clear}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#00b4cc] hover:opacity-85"
              >
                {t.reports.confirm}
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'

interface TierConfig {
  label: string
  color: string
}

const TIER_CONFIGS: Record<TierKey, TierConfig> = {
  bronze: { label: 'Bronze', color: '#B97A3C' },
  silver: { label: 'Silver', color: '#9BAAC7' },
  gold: { label: 'Gold', color: '#F8D57E' },
  platinum: { label: 'Platinum', color: '#515254' },
}

export function GeneralReportsPage() {
  const t = useT()

  // Main Date filter states
  const [mainPreset, setMainPreset] = useState<PresetKey | null>('last7')
  const [mainRange, setMainRange] = useState<DateRange | undefined>(() => getPresetRange('last7'))

  // Chart 1 (Gəlir Trendi) date states
  const [chart1Preset, setChart1Preset] = useState<PresetKey | null>('last30')
  const [chart1Range, setChart1Range] = useState<DateRange | undefined>(() => getPresetRange('last30'))

  // Chart 2 (İstifadəçi artımı) date states
  const [chart2Preset, setChart2Preset] = useState<PresetKey | null>('last30')
  const [chart2Range, setChart2Range] = useState<DateRange | undefined>(() => getPresetRange('last30'))
  
  // 7 cards state
  const [cardPresets, setCardPresets] = useState<(PresetKey | null)[]>(
    Array(7).fill('last30')
  )
  const [cardRanges, setCardRanges] = useState<(DateRange | undefined)[]>(() => {
    return Array.from({ length: 7 }, () => getPresetRange('last30'))
  })

  const setCardPreset = (index: number, val: PresetKey | null) => {
    setCardPresets(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  const setCardRange = (index: number, val: DateRange | undefined) => {
    setCardRanges(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (mainRange) {
      setCardRanges(Array.from({ length: 7 }, () => mainRange))
      setCardPresets(Array(7).fill(mainPreset))
      setChart1Range(mainRange)
      setChart1Preset(mainPreset)
      setChart2Range(mainRange)
      setChart2Preset(mainPreset)
    }
  }, [mainRange, mainPreset])
  
  const [selectedTier, setSelectedTier] = useState<TierKey>('bronze')
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false)
  const tierDropdownRef = useRef<HTMLDivElement>(null)

  // Click outside to close subscription tier dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(e.target as Node)) {
        setTierDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dynamic Card Data State
  const [cardData, setCardData] = useState<Record<string, { value: number; trend: string }>>({
    income: { value: 0, trend: '+ 0 %' },
    active_users: { value: 0, trend: '+ 0 %' },
    qr_scans: { value: 0, trend: '+ 0 %' },
    new_reg: { value: 0, trend: '+ 0 %' },
    active_sub: { value: 0, trend: '+ 0 %' },
    ending_sub: { value: 0, trend: '+ 0 %' },
    renew_sub: { value: 0, trend: '+ 0 %' },
  })

  // Dynamic Chart 1 (Income Trend) data state
  const [incomeTrend, setIncomeTrend] = useState<any[]>([])
  
  // Dynamic Chart 2 (User Growth) data state
  const [userGrowthTrend, setUserGrowthTrend] = useState<any[]>([])
  const [growthPercentage, setGrowthPercentage] = useState<number>(12)

  // Card 0 (Income)
  useEffect(() => {
    const range = cardRanges[0]
    if (!range?.from) return
    const fromVal = range.from
    const toVal = range.to || range.from
    async function fetchIncome() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/income', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setCardData(prev => ({
          ...prev,
          income: {
            value: data.totalIncome,
            trend: `${data.isPositiveTrend ? '+' : '-'} ${Math.abs(data.percentageChange).toFixed(1)} %`
          }
        }))
      } catch (e) {
        console.error(e)
      }
    }
    fetchIncome()
  }, [cardRanges[0]])

  // Card 1 (Active Users)
  useEffect(() => {
    const range = cardRanges[1]
    if (!range?.from) return
    const fromVal = range.from
    const toVal = range.to || range.from
    async function fetchActiveUsers() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/users', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setCardData(prev => ({
          ...prev,
          active_users: {
            value: data.activeUsers,
            trend: '+ 0 %'
          }
        }))
      } catch (e) {
        console.error(e)
      }
    }
    fetchActiveUsers()
  }, [cardRanges[1]])

  // Card 2 (QR Scans)
  useEffect(() => {
    const range = cardRanges[2]
    if (!range?.from) return
    const fromVal = range.from
    const toVal = range.to || range.from
    async function fetchQrScans() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/qr-scans', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setCardData(prev => ({
          ...prev,
          qr_scans: {
            value: data.count,
            trend: '+ 0 %'
          }
        }))
      } catch (e) {
        console.error(e)
      }
    }
    fetchQrScans()
  }, [cardRanges[2]])

  // Card 3 (New Registrations)
  useEffect(() => {
    const range = cardRanges[3]
    if (!range?.from) return
    const fromVal = range.from
    const toVal = range.to || range.from
    async function fetchNewReg() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/users', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setCardData(prev => ({
          ...prev,
          new_reg: {
            value: data.newRegistrations,
            trend: '+ 0 %'
          }
        }))
      } catch (e) {
        console.error(e)
      }
    }
    fetchNewReg()
  }, [cardRanges[3]])

  // Cards 4, 5, 6 (Subscriptions)
  const fetchSubscriptionsForCard = async (range: DateRange | undefined, cardKey: string) => {
    if (!range?.from) return
    const fromVal = range.from
    const toVal = range.to || range.from
    try {
      const fromStr = formatISO(fromVal, true)
      const toStr = formatISO(toVal, false)
      const data = await apiGet<any>('/admin/reports/subscriptions', {
        params: { startDate: fromStr, endDate: toStr }
      })
      let metricVal = 0
      if (cardKey === 'active_sub') metricVal = data.activeSubscriptions
      else if (cardKey === 'ending_sub') metricVal = data.endingSubscriptions
      else if (cardKey === 'renew_sub') metricVal = data.renewingSubscriptions

      setCardData(prev => ({
        ...prev,
        [cardKey]: {
          value: metricVal,
          trend: '+ 0 %'
        }
      }))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchSubscriptionsForCard(cardRanges[4], 'active_sub')
  }, [cardRanges[4]])

  useEffect(() => {
    fetchSubscriptionsForCard(cardRanges[5], 'ending_sub')
  }, [cardRanges[5]])

  useEffect(() => {
    fetchSubscriptionsForCard(cardRanges[6], 'renew_sub')
  }, [cardRanges[6]])

  // Fetch Chart 1 (Income Trend)
  useEffect(() => {
    if (!chart1Range?.from) return
    const fromVal = chart1Range.from
    const toVal = chart1Range.to || chart1Range.from
    async function fetchChart1Data() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/income', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setIncomeTrend(data.trend || [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchChart1Data()
  }, [chart1Range])

  // Fetch Chart 2 (User Growth)
  useEffect(() => {
    if (!chart2Range?.from) return
    const fromVal = chart2Range.from
    const toVal = chart2Range.to || chart2Range.from
    async function fetchChart2Data() {
      try {
        const fromStr = formatISO(fromVal, true)
        const toStr = formatISO(toVal, false)
        const data = await apiGet<any>('/admin/reports/users', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setUserGrowthTrend(data.growthTrend || [])
        
        if (data.growthTrend && data.growthTrend.length >= 2) {
          const len = data.growthTrend.length
          const prev = data.growthTrend[len - 2].newCustomers
          const curr = data.growthTrend[len - 1].newCustomers
          if (prev > 0) {
            const diff = ((curr - prev) / prev) * 100
            setGrowthPercentage(Math.round(diff))
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchChart2Data()
  }, [chart2Range])

  const baseCardStats = [
    { id: 'income', title: t.reports.cards.totalIncome, value: cardData.income.value, type: 'currency', trend: cardData.income.trend, icon: '/Hesabatlar/total_income.svg' },
    { id: 'active_users', title: t.reports.cards.activeUsers, value: cardData.active_users.value, type: 'number', trend: cardData.active_users.trend, icon: '/Hesabatlar/active_user.svg' },
    { id: 'qr_scans', title: t.reports.cards.qrScans, value: cardData.qr_scans.value, type: 'number', trend: cardData.qr_scans.trend, icon: '/Hesabatlar/generalQR_code entry.svg' },
    { id: 'new_reg', title: t.reports.cards.newRegistrations, value: cardData.new_reg.value, type: 'number', trend: cardData.new_reg.trend, icon: '/Hesabatlar/new_registrations.svg' },
    { id: 'active_sub', title: t.reports.cards.activeSubscriptions, value: cardData.active_sub.value, type: 'number', trend: cardData.active_sub.trend, icon: '/Hesabatlar/active_subscriptions.svg' },
    { id: 'ending_sub', title: t.reports.cards.endingSubscriptions, value: cardData.ending_sub.value, type: 'number', trend: cardData.ending_sub.trend, icon: '/Hesabatlar/expiring_subscriptions.svg' },
    { id: 'renew_sub', title: t.reports.cards.renewingSubscriptions, value: cardData.renew_sub.value, type: 'number', trend: cardData.renew_sub.trend, icon: '/Hesabatlar/renewing_subscriptions.svg' },
  ]

  const formatCardValue = (val: number, type: string) => {
    if (type === 'currency') {
      return `₼${val.toLocaleString('en-US')}`
    }
    return val.toLocaleString('en-US')
  }

  // Gelir Trendi Line Chart Data
  const currentTierMeta = TIER_CONFIGS[selectedTier]

  const getLineChartData = () => {
    return incomeTrend.map(point => ({
      name: point.periodLabel,
      value: point.tierValues[selectedTier] || 0,
      showLabel: true
    }))
  }

  const lineChartData = getLineChartData()

  // User growth grouped Bar Chart Data
  const getBarChartData = () => {
    return userGrowthTrend.map(point => ({
      name: point.periodLabel,
      yeni: point.newCustomers,
      aktiv: point.activeCustomers
    }))
  }

  const barChartData = getBarChartData()

  // Custom Tooltip for Gelir Trendi
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[10px] bg-[#00B4CC] px-3.5 py-1.5 text-center shadow-lg relative -top-12 border-0">
          <p className="text-[15px] font-bold text-white leading-tight">{payload[0].value} ₼</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#00B4CC]" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-black">
      {/* Title & Toolbar block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold leading-[32px] text-black">{t.reports.generalTitle}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Main Date selector */}
          <DateRangeSelector
            selectedPreset={mainPreset}
            setSelectedPreset={setMainPreset}
            periodRange={mainRange}
            setPeriodRange={setMainRange}
            align="end"
            size="md"
          />

          {/* Export Button */}
          <button
            type="button"
            className="flex h-[42px] items-center gap-2 rounded-[12px] border border-[#ececed] bg-white px-5 text-[14px] font-medium leading-none text-black hover:border-gray-300 transition-colors shadow-3xs cursor-pointer"
          >
            <Image src="/export-icon.svg" width={16} height={16} alt="Export" className="shrink-0" />
            <span>{t.reports.export}</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="flex flex-col gap-4">
        {/* Top row: 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {baseCardStats.slice(0, 4).map((card, idx) => {
            const globalIdx = idx
            return (
              <div 
                key={card.id} 
                className="flex flex-col justify-between rounded-[16px] border border-[#ececed] bg-white p-5 shadow-3xs hover:shadow-2xs transition-shadow h-[126px]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
                    <Image src={card.icon} fill alt={card.title} className="object-contain" />
                  </div>
                  <span className="text-[14px] font-medium text-gray-500">{card.title}</span>
                </div>
                <div className="text-[24px] font-bold leading-none text-black mt-2">
                  {formatCardValue(card.value, card.type)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold">
                  <Image src="/High-Low.svg" width={12} height={12} alt="Up" className="shrink-0" />
                  <span className="text-[#059669]">{card.trend}</span>
                  <span className="text-gray-300 font-light">/</span>
                  <DateRangeSelector
                    selectedPreset={cardPresets[globalIdx]}
                    setSelectedPreset={(preset) => setCardPreset(globalIdx, preset)}
                    periodRange={cardRanges[globalIdx]}
                    setPeriodRange={(range) => setCardRange(globalIdx, range)}
                    align="start"
                    size="sm"
                    variant="inline-teal"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom row: 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {baseCardStats.slice(4, 7).map((card, idx) => {
            const globalIdx = idx + 4
            return (
              <div 
                key={card.id} 
                className="flex flex-col justify-between rounded-[16px] border border-[#ececed] bg-white p-5 shadow-3xs hover:shadow-2xs transition-shadow h-[126px]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
                    <Image src={card.icon} fill alt={card.title} className="object-contain" />
                  </div>
                  <span className="text-[14px] font-medium text-gray-500">{card.title}</span>
                </div>
                <div className="text-[24px] font-bold leading-none text-black mt-2">
                  {formatCardValue(card.value, card.type)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold">
                  <Image src="/High-Low.svg" width={12} height={12} alt="Up" className="shrink-0" />
                  <span className="text-[#059669]">{card.trend}</span>
                  <span className="text-gray-300 font-light">/</span>
                  <DateRangeSelector
                    selectedPreset={cardPresets[globalIdx]}
                    setSelectedPreset={(preset) => setCardPreset(globalIdx, preset)}
                    periodRange={cardRanges[globalIdx]}
                    setPeriodRange={(range) => setCardRange(globalIdx, range)}
                    align="start"
                    size="sm"
                    variant="inline-teal"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Chart: Gelir Trendi */}
        <div className="flex flex-col gap-4 rounded-[16px] border border-[#ececed] bg-white p-5 shadow-3xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-black leading-tight">{t.reports.incomeTrend}</h2>
              <div className="mt-2.5 flex items-center gap-2 text-[14px]">
                {/* Custom subscription filter selector dropdown */}
                <div className="relative" ref={tierDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setTierDropdownOpen(p => !p)}
                    className="flex h-[36px] items-center gap-1.5 rounded-[12px] border border-[#ececed] bg-white px-3 text-[13px] font-medium text-[#191919] hover:border-gray-300 transition-colors shadow-3xs cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: currentTierMeta.color }} />
                    <span>{currentTierMeta.label}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  {tierDropdownOpen && (
                    <ul className="absolute left-0 top-full mt-1.5 z-50 w-[120px] rounded-[10px] border border-[#ececed] bg-white shadow-lg overflow-hidden py-1 divide-y divide-gray-50">
                      {(Object.keys(TIER_CONFIGS) as TierKey[]).map((tKey) => (
                        <li key={tKey}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTier(tKey)
                              setTierDropdownOpen(false)
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-slate-50 text-left",
                              selectedTier === tKey ? "text-[#00b4cc]" : "text-black"
                            )}
                          >
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: TIER_CONFIGS[tKey].color }} />
                            <span>{TIER_CONFIGS[tKey].label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Date Range Picker for Gelir Trendi */}
            <DateRangeSelector
              selectedPreset={chart1Preset}
              setSelectedPreset={setChart1Preset}
              periodRange={chart1Range}
              setPeriodRange={setChart1Range}
              align="end"
              size="sm"
            />
          </div>

          {/* Line Chart */}
          <div className="h-56 mt-2 relative">
            {lineChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-500 font-medium">
                {t.common.noData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip 
                    content={<CustomLineTooltip />}
                    trigger="hover"
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={
                      <Dot r={5} fill="#6366F1" stroke="#fff" strokeWidth={2} />
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Chart: Istifadeci artimi */}
        <div className="flex flex-col gap-4 rounded-[16px] border border-[#ececed] bg-white p-5 shadow-3xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-black leading-tight">{t.reports.userGrowth}</h2>
              <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#059669]">
                <Image src="/High-Low.svg" width={12} height={12} alt="Up" />
                <span>{growthPercentage >= 0 ? `+${growthPercentage}` : growthPercentage}% {t.reports.growthComparedToLastMonth}</span>
              </div>
            </div>
            {/* Custom Date Range Picker for Istifadeci artimi */}
            <DateRangeSelector
              selectedPreset={chart2Preset}
              setSelectedPreset={setChart2Preset}
              periodRange={chart2Range}
              setPeriodRange={setChart2Range}
              align="end"
              size="sm"
            />
          </div>

          <p className="text-[12px] font-medium text-gray-400 mt-1">{t.reports.customerCount}</p>

          {/* Grouped Bar Chart */}
          <div className="h-56 mt-1">
            {barChartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[14px] text-gray-500 font-medium">
                {t.common.noData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  barCategoryGap="35%"
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(val) => val === 0 ? '0' : val >= 1000 ? `${val / 1000}k` : val}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC', opacity: 0.5 }}
                    contentStyle={{ 
                      borderRadius: '10px', 
                      border: '1px solid #ececed', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Bar dataKey="yeni" fill="#00B4CC" radius={[4, 4, 0, 0]} name={t.reports.newCustomer} />
                  <Bar dataKey="aktiv" fill="#0A7D8C" radius={[4, 4, 0, 0]} name={t.reports.activeCustomer} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2 text-[12px] font-semibold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#00B4CC]" />
              <span>{t.reports.newCustomer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0A7D8C]" />
              <span>{t.reports.activeCustomer}</span>
              <span className="text-gray-400 font-normal ml-0.5 cursor-pointer hover:text-black">ⓘ</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
