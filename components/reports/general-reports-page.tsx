'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  TrendingUp,
  Download
} from 'lucide-react'
import { 
  addMonths, 
  format, 
  getMonth, 
  getYear, 
  setMonth, 
  setYear,
  differenceInDays,
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

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyun', 'İyul', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

type PresetKey = 'today' | 'last7' | 'last30' | 'lastMonth' | 'custom'

interface DatePreset {
  key: PresetKey
  label: string
}

const DATE_PRESETS: DatePreset[] = [
  { key: 'today', label: 'Bu gün' },
  { key: 'last7', label: 'Son 7 gün' },
  { key: 'last30', label: 'Son 1 ay' },
  { key: 'lastMonth', label: 'Keçən ay' },
  { key: 'custom', label: 'Custom' },
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

  const getDisplayLabel = () => {
    if (!selectedPreset) return 'Tarix aralığı'
    if (selectedPreset === 'custom') {
      if (!periodRange?.from) return 'Tarix aralığı'
      if (!periodRange.to) return format(periodRange.from, 'dd.MM.yyyy')
      return `${format(periodRange.from, 'dd.MM.yyyy')} - ${format(periodRange.to, 'dd.MM.yyyy')}`
    }
    const preset = DATE_PRESETS.find(p => p.key === selectedPreset)
    return preset ? preset.label : 'Tarix aralığı'
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
                    {preset.label}
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
                <ArrowLeft size={14} /> Geri
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
                  {MONTHS.map((m, idx) => (
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
                Təmizlə
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-[#00b4cc] hover:opacity-85"
              >
                Təsdiq et
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Subscription Tiers config for Gelir Trendi
type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum'

interface TierConfig {
  label: string
  color: string
  subscribers: number
  growth: number
  dataValues: number[]
}

const TIER_CONFIGS: Record<TierKey, TierConfig> = {
  bronze: {
    label: 'Bronze',
    color: '#B97A3C',
    subscribers: 500,
    growth: 12,
    dataValues: [100, 310, 310, 330, 300, 380, 230, 360, 360, 500, 450, 450, 220, 485, 520],
  },
  silver: {
    label: 'Silver',
    color: '#9BAAC7',
    subscribers: 420,
    growth: 9,
    dataValues: [120, 280, 290, 350, 320, 360, 250, 380, 390, 480, 460, 440, 260, 450, 500],
  },
  gold: {
    label: 'Gold',
    color: '#F8D57E',
    subscribers: 680,
    growth: 15,
    dataValues: [140, 340, 350, 380, 340, 420, 270, 410, 420, 520, 490, 480, 280, 510, 560],
  },
  platinum: {
    label: 'Platinum',
    color: '#515254',
    subscribers: 240,
    growth: 18,
    dataValues: [160, 390, 380, 410, 390, 460, 300, 440, 460, 560, 530, 510, 320, 550, 610],
  },
}

export function GeneralReportsPage() {
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

  // Base metrics mock data
  const baseCardStats = [
    { id: 'income', title: 'Ümumi Gəlir', value: 234500, type: 'currency', trend: '+ 4.2 %', icon: '/Hesabatlar/total_income.svg' },
    { id: 'active_users', title: 'Aktiv istifadəçi', value: 32, type: 'number', trend: '+ 2', icon: '/Hesabatlar/active_user.svg' },
    { id: 'qr_scans', title: 'Ümumi QR giriş', value: 1000, type: 'number', trend: '+ 12 %', icon: '/Hesabatlar/generalQR_code entry.svg' },
    { id: 'new_reg', title: 'Yeni Qeydiyyatlar', value: 85, type: 'number', trend: '+ 1 %', icon: '/Hesabatlar/new_registrations.svg' },
    { id: 'active_sub', title: 'Aktiv Abunəliklər', value: 85, type: 'number', trend: '+ 1 %', icon: '/Hesabatlar/active_subscriptions.svg' },
    { id: 'ending_sub', title: 'Bitən Abunəliklər', value: 85, type: 'number', trend: '+ 1 %', icon: '/Hesabatlar/expiring_subscriptions.svg' },
    { id: 'renew_sub', title: 'Yenilənən Abunəliklər', value: 85, type: 'number', trend: '+ 1 %', icon: '/Hesabatlar/renewing_subscriptions.svg' },
  ]

  const getDynamicCardStats = () => {
    return baseCardStats.map((stat, index) => {
      const range = cardRanges[index]
      if (!range?.from) {
        return stat
      }
      const from = range.from
      const to = range.to || from
      const days = Math.max(1, differenceInDays(to, from) + 1)
      
      const scaleFactor = Math.max(0.08, (days * 3.3) / 100)
      let dynamicVal = Math.round(stat.value * scaleFactor)
      
      if (stat.id === 'active_users' && dynamicVal < 3) dynamicVal = 5
      if (dynamicVal < 1) dynamicVal = 1
      
      return {
        ...stat,
        value: dynamicVal
      }
    })
  }

  const cardStats = getDynamicCardStats()

  const formatCardValue = (val: number, type: string) => {
    if (type === 'currency') {
      return `₼${val.toLocaleString('en-US')}`
    }
    return val.toLocaleString('en-US')
  }

  // Gelir Trendi Line Chart Data
  const currentTierMeta = TIER_CONFIGS[selectedTier]
  const monthsList = [
    { name: 'Yanvar', index: 0 },
    { name: 'Jan-2', index: 1 },
    { name: 'Jan-3', index: 2 },
    { name: 'Fevral', index: 3 },
    { name: 'Feb-2', index: 4 },
    { name: 'Feb-3', index: 5 },
    { name: 'Mart', index: 6 },
    { name: 'Mar-2', index: 7 },
    { name: 'Mar-3', index: 8 },
    { name: 'Aprel', index: 9 },
    { name: 'Apr-2', index: 10 },
    { name: 'Apr-3', index: 11 },
    { name: 'May', index: 12 },
    { name: 'May-2', index: 13 },
    { name: 'May-3', index: 14 },
  ]

  const getLineChartData = () => {
    const scaleFactor = chart1Range?.from ? Math.max(0.2, (differenceInDays(chart1Range.to || chart1Range.from, chart1Range.from) + 1) / 30) : 1
    
    return monthsList.map(month => ({
      name: month.name,
      value: Math.round(currentTierMeta.dataValues[month.index] * scaleFactor),
      showLabel: month.name === 'Yanvar' || month.name === 'Fevral' || month.name === 'Mart' || month.name === 'Aprel' || month.name === 'May'
    }))
  }

  const lineChartData = getLineChartData()

  // User growth grouped Bar Chart Data
  const baseBarChartData = [
    { name: 'Jan', yeni: 1200, aktiv: 2600 },
    { name: 'Feb', yeni: 1600, aktiv: 2500 },
    { name: 'Mar', yeni: 3200, aktiv: 3800 },
    { name: 'Apr', yeni: 2800, aktiv: 2900 },
    { name: 'May', yeni: 4200, aktiv: 4800 },
    { name: 'Jun', yeni: 2600, aktiv: 4100 },
  ]

  const getBarChartData = () => {
    if (!chart2Range?.from) {
      return baseBarChartData
    }
    const days = Math.max(1, differenceInDays(chart2Range.to || chart2Range.from, chart2Range.from) + 1)
    const scaleFactor = Math.max(0.1, (days * 3.3) / 100)
    
    return baseBarChartData.map(d => ({
      name: d.name,
      yeni: Math.round(d.yeni * scaleFactor),
      aktiv: Math.round(d.aktiv * scaleFactor),
    }))
  }

  const barChartData = getBarChartData()

  // Custom Tooltip for Gelir Trendi
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-[10px] bg-[#00B4CC] px-3.5 py-1.5 text-center shadow-lg relative -top-12 border-0">
          <p className="text-[11px] font-medium text-white/90">Aprel</p>
          <p className="text-[15px] font-bold text-white leading-tight">{payload[0].value}</p>
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
          <h1 className="text-[24px] font-bold leading-[32px] text-black">Ümumi</h1>
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
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="flex flex-col gap-4">
        {/* Top row: 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardStats.slice(0, 4).map((card, idx) => {
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
          {cardStats.slice(4, 7).map((card, idx) => {
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
              <h2 className="text-[16px] font-bold text-black leading-tight">Gelir Trendi</h2>
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

                <div className="flex items-center gap-1.5 text-gray-500 font-semibold text-[13px] ml-1">
                  <span className="text-black font-bold">{currentTierMeta.subscribers}</span>
                  <span>abunə</span>
                  <span className="text-gray-300 font-light">/</span>
                  <div className="flex items-center gap-1 text-[#059669]">
                    <Image src="/High-Low.svg" width={11} height={11} alt="Up" />
                    <span>+{currentTierMeta.growth}% artım</span>
                  </div>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(val, index) => {
                    const item = lineChartData[index]
                    return item && item.showLabel ? item.name : ''
                  }}
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[100, 'auto']}
                />
                <Tooltip 
                  content={<CustomLineTooltip />}
                  trigger="hover"
                  cursor={false}
                />
                <ReferenceLine 
                  x="Aprel" 
                  stroke="#8B5CF6" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
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
          </div>
        </div>

        {/* Right Chart: Istifadeci artimi */}
        <div className="flex flex-col gap-4 rounded-[16px] border border-[#ececed] bg-white p-5 shadow-3xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-black leading-tight">İstifadəçi artımı</h2>
              <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#059669]">
                <Image src="/High-Low.svg" width={12} height={12} alt="Up" />
                <span>+12% artım (keçən aya nisbətən)</span>
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

          <p className="text-[12px] font-medium text-gray-400 mt-1">Müştəri sayı</p>

          {/* Grouped Bar Chart */}
          <div className="h-56 mt-1">
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
                <Bar dataKey="yeni" fill="#00B4CC" radius={[4, 4, 0, 0]} name="Yeni müştəri" />
                <Bar dataKey="aktiv" fill="#0A7D8C" radius={[4, 4, 0, 0]} name="Aktiv müştəri" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2 text-[12px] font-semibold text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#00B4CC]" />
              <span>Yeni müştəri</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0A7D8C]" />
              <span>Aktiv müştəri</span>
              <span className="text-gray-400 font-normal ml-0.5 cursor-pointer hover:text-black">ⓘ</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
