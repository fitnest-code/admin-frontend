'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft,
  RotateCcw
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
import { useT, useI18nStore } from '@/lib/i18n'
import { az, enUS, ru } from 'date-fns/locale'
import { apiGet, apiDelete } from '@/lib/api/client'

type PresetKey = 'today' | 'last7' | 'lastMonth' | 'allTime' | 'custom'

interface DatePreset {
  key: PresetKey
}

const DATE_PRESETS: DatePreset[] = [
  { key: 'today' },
  { key: 'last7' },
  { key: 'lastMonth' },
  { key: 'allTime' },
  { key: 'custom' },
]

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

export function GymPaymentsPage() {
  const t = useT()
  const activeLocale = useI18nStore((s) => s.locale)
  const dateFnsLocale = activeLocale === 'EN' ? enUS : activeLocale === 'RU' ? ru : az

  const [periodOpen, setPeriodOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>('allTime')
  
  const getPresetRange = (preset: PresetKey): DateRange | undefined => {
    const today = new Date()
    switch (preset) {
      case 'today':
        return { from: today, to: today }
      case 'last7':
        return { from: subDays(today, 6), to: today }
      case 'lastMonth': {
        const lastMonthDate = subMonths(today, 1)
        return {
          from: startOfMonth(lastMonthDate),
          to: endOfMonth(lastMonthDate),
        }
      }
      case 'allTime':
        return { from: new Date(2020, 0, 1), to: today }
      default:
        return undefined
    }
  }

  const [periodRange, setPeriodRange] = useState<DateRange | undefined>(() => getPresetRange('allTime'))
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [view, setView] = useState<'presets' | 'calendar'>('presets')
  
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState<Map<string, any>>(new Map())

  const yearOptions = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i)

  // Sync menu view state when popover opens/closes
  useEffect(() => {
    if (periodOpen) {
      setView(selectedPreset === 'custom' ? 'calendar' : 'presets')
    }
  }, [periodOpen, selectedPreset])

  // Clear selection on period range changes
  useEffect(() => {
    setSelected(new Map())
  }, [periodRange])

  // Fetch report data from backend
  useEffect(() => {
    async function fetchGymPayments() {
      if (!periodRange?.from) return
      setLoading(true)
      try {
        const fromStr = formatISO(periodRange.from, true)
        const toStr = formatISO(periodRange.to || periodRange.from, false)
        const data = await apiGet<any[]>('/admin/reports/gym-payments', {
          params: { startDate: fromStr, endDate: toStr }
        })
        setTableData(data)
      } catch (err) {
        console.error("Failed to fetch gym payments", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGymPayments()
  }, [periodRange, refreshKey])

  const allOnPage = tableData.length > 0 && tableData.every((row) => selected.has(`${row.gymId}_${row.packageId}`))

  const toggleAll = () => {
    if (allOnPage) {
      setSelected((prev) => {
        const next = new Map(prev)
        tableData.forEach((row) => next.delete(`${row.gymId}_${row.packageId}`))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Map(prev)
        tableData.forEach((row) => {
          next.set(`${row.gymId}_${row.packageId}`, row)
        })
        return next
      })
    }
  }

  const toggleOne = (row: any) => {
    const key = `${row.gymId}_${row.packageId}`
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.set(key, row)
      }
      return next
    })
  }

  const handleResetHistory = async () => {
    const confirmed = window.confirm("Seçilmiş idman zallarının giriş tarixçəsini sıfırlamaq istədiyinizdən əminsiniz?")
    if (!confirmed) return

    setLoading(true)
    try {
      const selectedList = Array.from(selected.values())
      await Promise.all(
        selectedList.map((item) => {
          const gymId = item.gymId
          const packageId = item.packageId || 0
          return apiDelete(`/admin/gyms/${gymId}/packages/${packageId}/history`)
        })
      )
      setSelected(new Map())
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      console.error("Failed to delete history", err)
      alert("Xəta baş verdi. Giriş tarixçəsi silinə bilmədi.")
    } finally {
      setLoading(false)
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

  const getPresetLabel = (key: PresetKey) => {
    switch (key) {
      case 'today': return t.reports.today
      case 'last7': return t.reports.last7Days
      case 'lastMonth': return t.reports.lastMonth
      case 'allTime': return t.reports.allTime
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

  const getTier = (pkgName: string) => {
    const name = (pkgName || '').toLowerCase()
    if (name.includes('silver')) return 'Silver'
    if (name.includes('gold')) return 'Gold'
    if (name.includes('platinum')) return 'Platinum'
    return 'Bronze'
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-black">
      {/* Title block */}
      <div>
        <h1 className="text-[24px] font-bold leading-[32px] text-black">{t.reports.gymPaymentsTitle}</h1>
        <p className="text-[14px] leading-[20px] text-gray-500 mt-1">{t.reports.gymPaymentsSubtitle}</p>
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
          <PopoverContent align="start" sideOffset={8} className="w-[280px] rounded-[16px] border-[#ececed] p-0 shadow-xl bg-white z-50 overflow-hidden">
            
            {/* Presets List View */}
            {view === 'presets' && (
              <div className="flex flex-col bg-white">
                {DATE_PRESETS.map((preset) => {
                  const isPresetActive = selectedPreset === preset.key
                  const isLastPresetBeforeCustom = preset.key === 'allTime'
                  
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
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>

                  <div className="flex items-center gap-2">
                    <select
                      value={getMonth(calendarMonth)}
                      onChange={(e) => setCalendarMonth(setMonth(calendarMonth, Number(e.target.value)))}
                      className="h-8 rounded-[8px] border border-[#ececed] bg-white px-2 text-[13px] font-medium outline-none focus:border-[#00b4cc]"
                    >
                      {t.reports.months.map((m: string, idx: number) => (
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
                  locale={dateFnsLocale}
                  className="bg-white p-1"
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
                    {t.reports.clear}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodOpen(false)}
                    className="text-xs font-semibold text-[#00b4cc] hover:opacity-85 transition-opacity"
                  >
                    {t.reports.confirm}
                  </button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full transition-all duration-300 animate-in fade-in-50 bg-white/50 p-2 rounded-lg border border-dashed border-[#00B4CC]/20">
        <div className="flex items-center px-2">
          <span className="text-[14px] font-medium text-foreground">Seçilib: {selected.size}</span>
        </div>
        <div className="flex flex-wrap items-center gap-[13.4px]">
          <button
            onClick={handleResetHistory}
            disabled={selected.size === 0}
            className={cn(
              "flex h-[40px] min-w-[110px] w-fit items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer whitespace-nowrap",
              selected.size === 0
                ? "border-[#cecfd2]/40 bg-white text-muted-foreground opacity-40 cursor-not-allowed active:scale-100 hover:bg-white hover:border-[#cecfd2]"
                : "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300"
            )}
          >
            <RotateCcw size={18} className="shrink-0" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden rounded-[12px] border border-[#ececed] bg-white shadow-3xs">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-[14px] text-gray-500 font-medium">
            {t.common.loading}
          </div>
        ) : (
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-[#00B4CC]/5 hover:bg-[#00B4CC]/5 border-b border-[#ececed]">
                <TableHead className="h-[48px] w-[50px] px-4 text-center border-r border-[#ececed]">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
                  />
                </TableHead>
                <TableHead className="h-[48px] px-6 text-left text-[14px] font-semibold text-black border-r border-[#ececed]">
                  {t.reports.gymName}
                </TableHead>
                <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black border-r border-[#ececed] w-[20%]">
                  {t.reports.qrCount}
                </TableHead>
                <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black border-r border-[#ececed] w-[25%]">
                  {t.reports.gymSubscription}
                </TableHead>
                <TableHead className="h-[48px] px-6 text-center text-[14px] font-semibold text-black w-[20%]">
                  {t.reports.amount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500 text-[14px] font-medium">
                    {t.common.noData}
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="border-b border-[#ececed] last:border-0 hover:bg-[#00B4CC]/2 transition-colors h-[56px]"
                  >
                    <TableCell className="px-4 text-center border-r border-[#ececed] w-[50px]">
                      <input
                        type="checkbox"
                        checked={selected.has(`${row.gymId}_${row.packageId}`)}
                        onChange={() => toggleOne(row)}
                        className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
                      />
                    </TableCell>
                    <TableCell className="px-6 text-left text-[14px] font-medium text-black border-r border-[#ececed]">
                      {row.gymName}
                    </TableCell>
                    <TableCell className="px-6 text-center text-[14px] font-medium text-black border-r border-[#ececed]">
                      {row.qrCount}
                    </TableCell>
                    <TableCell className="px-6 text-center border-r border-[#ececed]">
                      <SubscriptionBadge type={getTier(row.subscription)} />
                    </TableCell>
                    <TableCell className="px-6 text-center text-[14px] font-semibold text-black">
                      {row.baseAmount} ₼
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
