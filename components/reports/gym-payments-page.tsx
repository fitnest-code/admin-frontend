'use client'

import { useState, useEffect } from 'react'
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
  differenceInDays,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth
} from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { SubscriptionBadge } from '@/components/ui/subscription-badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
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
  { key: 'last30', label: 'Son 30 gün' },
  { key: 'lastMonth', label: 'Keçən ay' },
  { key: 'custom', label: 'Custom' },
]

export function GymPaymentsPage() {
  const [periodOpen, setPeriodOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null)
  const [periodRange, setPeriodRange] = useState<DateRange | undefined>()
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [view, setView] = useState<'presets' | 'calendar'>('presets')
  
  const yearOptions = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i)

  // Sync menu view state when popover opens/closes
  useEffect(() => {
    if (periodOpen) {
      setView(selectedPreset === 'custom' ? 'calendar' : 'presets')
    }
  }, [periodOpen, selectedPreset])

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

  const handleSelectPreset = (preset: PresetKey) => {
    if (preset === 'custom') {
      setSelectedPreset('custom')
      setView('calendar')
    } else {
      setSelectedPreset(preset)
      setPeriodRange(getPresetRange(preset))
      setPeriodOpen(false)
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

  // Base mock data exactly representing the screenshot
  const baseMockData = [
    { id: 1, gymName: 'FİTnest Club', qrCount: 100, subscription: 'Gold', baseAmount: 100 },
    { id: 2, gymName: 'FİTnest Club', qrCount: 100, subscription: 'Platinum', baseAmount: 100 },
    { id: 3, gymName: 'FİTnest Club', qrCount: 100, subscription: 'Bronze', baseAmount: 100 },
    { id: 4, gymName: 'FİTnest Club', qrCount: 100, subscription: 'Silver', baseAmount: 100 },
  ]

  // Calculate dynamic data based on selected date range to make the UI feel alive
  const getDynamicData = () => {
    if (!periodRange?.from) {
      return baseMockData
    }

    const today = new Date()
    const from = periodRange.from
    const to = periodRange.to || from
    const days = Math.max(1, differenceInDays(to, from) + 1)
    
    // Scale count and amount realistically based on the number of days selected
    return baseMockData.map((item) => {
      // Base calculation: roughly 3 entries per day on average
      const scaleFactor = Math.max(0.1, (days * 3.3) / 100)
      const dynamicCount = Math.round(item.qrCount * scaleFactor)
      const dynamicAmount = Math.round(item.baseAmount * scaleFactor)
      
      return {
        ...item,
        qrCount: dynamicCount > 0 ? dynamicCount : 1,
        baseAmount: dynamicAmount > 0 ? dynamicAmount : 1,
      }
    })
  }

  const tableData = getDynamicData()

  return (
    <div className="flex flex-col gap-6 font-sans text-black">
      {/* Title block */}
      <div>
        <h1 className="text-[24px] font-bold leading-[32px] text-black">Zallar üzrə ödəniş öhdəliyi</h1>
        <p className="text-[14px] leading-[20px] text-gray-500 mt-1">FitNestin zallara ödəyəcəyi məbləğ</p>
      </div>

      {/* Filters section */}
      <div className="flex flex-wrap items-center gap-4">
        <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-[42px] min-w-[170px] items-center justify-between gap-4 rounded-[12px] border border-[#ececed] bg-white px-4 text-[14px] font-medium leading-none text-[#191919] hover:border-[#00b4cc] transition-colors shadow-3xs cursor-pointer"
            >
              <span className="text-[#191919]">{getDisplayLabel()}</span>
              <ChevronDown size={16} className={cn('shrink-0 text-gray-500 transition-transform', periodOpen && 'rotate-180')} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-[240px] rounded-[16px] border-[#ececed] p-0 shadow-xl bg-white z-50 overflow-hidden">
            
            {/* Presets List View */}
            {view === 'presets' && (
              <div className="flex flex-col bg-white">
                {DATE_PRESETS.map((preset, index) => {
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
                      
                      {/* Divider line before Custom option as seen in the mockup */}
                      {isLastPresetBeforeCustom && (
                        <div className="w-full h-[1px] bg-[#ececed]" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Custom Calendar View */}
            {view === 'calendar' && (
              <div className="rounded-[16px] bg-white p-3 border border-gray-100 min-w-[280px]">
                {/* Back to presets header */}
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
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={getMonth(calendarMonth)}
                      onChange={(e) => setCalendarMonth(setMonth(calendarMonth, Number(e.target.value)))}
                      className="h-8 rounded-[8px] border border-[#ececed] bg-white px-2 text-[13px] font-medium outline-none focus:border-[#00b4cc]"
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
                      className="h-8 rounded-[8px] border border-[#ececed] bg-white px-2 text-[13px] font-medium outline-none focus:border-[#00b4cc]"
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
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
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
                      setPeriodOpen(false)
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
                  >
                    Təmizlə
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodOpen(false)}
                    className="text-xs font-semibold text-[#00b4cc] hover:opacity-85 transition-opacity"
                  >
                    Təsdiq et
                  </button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden rounded-[12px] border border-[#ececed] bg-white shadow-3xs">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow className="bg-[#00B4CC]/5 hover:bg-[#00B4CC]/5 border-b border-[#ececed]">
              <TableHead className="h-[48px] px-6 text-left text-[14px] font-semibold text-black border-r border-[#ececed]">
                Zal adı
              </TableHead>
              <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black border-r border-[#ececed] w-[20%]">
                QR giriş sayı
              </TableHead>
              <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black border-r border-[#ececed] w-[25%]">
                Zalın Abunəliyi
              </TableHead>
              <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black w-[20%]">
                Məbləğ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow 
                key={row.id} 
                className="border-b border-[#ececed] last:border-0 hover:bg-[#00B4CC]/2 transition-colors h-[56px]"
              >
                <TableCell className="px-6 text-left text-[14px] font-medium text-black border-r border-[#ececed]">
                  {row.gymName}
                </TableCell>
                <TableCell className="px-6 text-center text-[14px] font-medium text-black border-r border-[#ececed]">
                  {row.qrCount}
                </TableCell>
                <TableCell className="px-6 text-center border-r border-[#ececed]">
                  <SubscriptionBadge type={row.subscription} />
                </TableCell>
                <TableCell className="px-6 text-center text-[14px] font-semibold text-black">
                  {row.baseAmount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
