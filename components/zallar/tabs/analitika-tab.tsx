'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Check, ChevronDown, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useDeleteGymEntranceHistory, useGymAnalytics, useUpdateGymAnalytics } from '@/lib/query/gym-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import type { GymEntranceHistoryAdminResponse } from '@/lib/types/gym'

interface AnalitikaTabProps {
  gymId?: string | number
}

export function AnalitikaTab({ gymId }: AnalitikaTabProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sort, setSort] = useState<string>('date_desc')
  const [dateRange, setDateRange] = useState<string>('')
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selected, setSelected] = useState<Map<number, GymEntranceHistoryAdminResponse>>(new Map())

  // Resizable column state & refs (ID, Ad/Soyad, Telefon, Tarix, Məbləğ, Nəticə)
  const [colWidths, setColWidths] = useState<number[]>([60, 160, 130, 110, 110, 80])
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const activeColIndexRef = useRef<number>(-1)
  const tableRef = useRef<HTMLTableElement>(null)
  const containerWidthRef = useRef<number>(0)
  const mouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null)
  const mouseUpRef = useRef<(() => void) | null>(null)
  const minWidths = [40, 100, 80, 80, 80, 60]

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return
    const deltaX = e.clientX - startXRef.current
    const minW = minWidths[activeColIndexRef.current] || 100
    const sumOthers = colWidths.reduce((acc, w, idx) => idx !== activeColIndexRef.current ? acc + w : acc, 0)
    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 90)
    const newWidth = Math.min(maxW, Math.max(minW, startWidthRef.current + deltaX))
    setColWidths((prev) => { const copy = [...prev]; copy[activeColIndexRef.current] = newWidth; return copy })
  }

  mouseUpRef.current = () => {
    activeColIndexRef.current = -1
    if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current)
    if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current)
  }

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    activeColIndexRef.current = index
    startXRef.current = e.clientX
    startWidthRef.current = colWidths[index]
    if (tableRef.current) containerWidthRef.current = tableRef.current.parentElement?.getBoundingClientRect().width || tableRef.current.getBoundingClientRect().width
    else containerWidthRef.current = 800
    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current)
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current)
  }

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current)
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current)
    }
  }, [])

  const handleDateRangeSelect = (range: string) => {
    if (range === 'custom') {
      setIsCalendarOpen(true)
      return
    }
    
    setDateRange(range)
    setSelectedRange(undefined)
    const today = new Date()
    let start = new Date()
    let end = new Date()
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'last7':
        start.setDate(today.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        start.setHours(0, 0, 0, 0)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'all':
        setStartDate('')
        setEndDate('')
        setPage(1)
        setSelected(new Map())
        return
      default:
        return
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
    setPage(1)
    setSelected(new Map())
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (range?.from && range?.to) {
      setStartDate(format(range.from, 'yyyy-MM-dd'))
      setEndDate(format(range.to, 'yyyy-MM-dd'))
      setPage(1)
      setSelected(new Map())
    }
  }

  const { data, isLoading } = useGymAnalytics(gymId, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: statusFilter || undefined,
    sort,
    page,
    pageSize
  })

  // Edit mode for the analytics summary cards (manual override)
  const [isEditing, setIsEditing] = useState(false)
  const [draftProfit, setDraftProfit] = useState('')
  const [draftSuccessful, setDraftSuccessful] = useState('')
  const [draftFailed, setDraftFailed] = useState('')
  const updateAnalytics = useUpdateGymAnalytics(gymId)
  const deleteEntranceHistory = useDeleteGymEntranceHistory(gymId)

  // Only the system admin (ROLE_ADMIN) may edit analytics overrides — not gym / super admins.
  const userRole = useAuthStore((s) => s.user?.role)?.toUpperCase()
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'

  useEffect(() => {
    if (!isEditing && data) {
      setDraftProfit((data.totalProfit ?? 0).toString())
      setDraftSuccessful((data.successfulScans ?? 0).toString())
      setDraftFailed((data.failedScans ?? 0).toString())
    }
  }, [data, isEditing])

  useEffect(() => {
    setSelected(new Map())
  }, [page, statusFilter, sort, query])

  const handleStartEdit = () => {
    setDraftProfit((data?.totalProfit ?? 0).toString())
    setDraftSuccessful((data?.successfulScans ?? 0).toString())
    setDraftFailed((data?.failedScans ?? 0).toString())
    setIsEditing(true)
  }

  const handleCancelEdit = () => setIsEditing(false)

  const handleSaveAnalytics = () => {
    const profit = Number(draftProfit)
    const successful = Number(draftSuccessful)
    const failed = Number(draftFailed)
    if ([profit, successful, failed].some((n) => !Number.isFinite(n) || n < 0)) {
      toast.error('Dəyərlər mənfi olmayan rəqəm olmalıdır')
      return
    }
    updateAnalytics.mutate(
      {
        totalProfit: profit,
        successfulScans: Math.round(successful),
        failedScans: Math.round(failed),
      },
      {
        onSuccess: () => {
          toast.success('Analitika göstəriciləri yeniləndi')
          setIsEditing(false)
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Göstəricilər yenilənmədi')
        },
      },
    )
  }

  const historyItems = data?.history?.items || []
  
  const filteredItems = query 
    ? historyItems.filter(item => 
        (item.firstName + ' ' + item.lastName).toLowerCase().includes(query.toLowerCase()) || 
        item.phone?.includes(query))
    : historyItems

  const selectableItems = filteredItems.filter((item) => item.id != null)
  const allOnPage = selectableItems.length > 0 && selectableItems.every((item) => selected.has(item.id))
  const colCount = isAdmin ? 8 : 7

  const toggleAll = () => {
    if (allOnPage) {
      setSelected((prev) => {
        const next = new Map(prev)
        selectableItems.forEach((item) => next.delete(item.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Map(prev)
        selectableItems.forEach((item) => next.set(item.id, item))
        return next
      })
    }
  }

  const toggleOne = (item: GymEntranceHistoryAdminResponse) => {
    if (item.id == null) return
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(item.id)) next.delete(item.id)
      else next.set(item.id, item)
      return next
    })
  }

  const handleDeleteSelected = () => {
    const ids = Array.from(selected.keys())
    if (ids.length === 0) return
    const confirmed = window.confirm(
      `Seçilmiş ${ids.length} müştəri girişini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`,
    )
    if (!confirmed) return

    deleteEntranceHistory.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} giriş silindi`)
        setSelected(new Map())
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Girişlər silinə bilmədi')
      },
    })
  }

  const totalPages = data?.history?.total ? Math.ceil(data.history.total / pageSize) : 1

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-4 sm:p-6 gap-8 font-sans shadow-sm">
      <div className="self-stretch flex flex-col items-start gap-8">
        
        {/* Zal analitikas Section Header */}
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-2">
          <div className="text-[18px] leading-[28px] font-bold text-black tracking-tight">Zal analitikası</div>
          {!isAdmin ? null : isEditing ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={updateAnalytics.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-[#ececed] bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <X size={14} /> Ləğv et
              </button>
              <button
                type="button"
                onClick={handleSaveAnalytics}
                disabled={updateAnalytics.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#009DB3] disabled:opacity-50"
              >
                {updateAnalytics.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {updateAnalytics.isPending ? 'Yadda saxlanılır...' : 'Yadda saxla'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={isLoading || !data}
              className="flex items-center gap-1.5 rounded-lg border border-[#ececed] bg-white px-3.5 py-2 text-[13px] font-semibold text-black transition-colors hover:border-[#00B4CC] hover:shadow-sm disabled:opacity-50"
            >
              <Pencil size={14} /> Düzəliş et
            </button>
          )}
        </div>

        <div className="self-stretch flex flex-col items-start gap-10">
          
          {/* Controls: Date Range & Export */}
          <div className="self-stretch rounded-xl border border-[#ececed] flex flex-col md:flex-row items-center justify-between p-2.5 gap-4 bg-slate-50/20">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-[220px] rounded-lg bg-white border border-[#ececed] flex items-center justify-center px-4 gap-4 text-sm font-medium text-black transition-all hover:border-[#00B4CC] hover:shadow-sm outline-none">
                    <span className="relative leading-[24px] truncate">
                      {dateRange === 'today' ? 'Bu gün' :
                       dateRange === 'last7' ? 'Son 7 gün' :
                       dateRange === 'thisMonth' ? 'Bu ay' :
                       dateRange === 'lastMonth' ? 'Keçən ay' : 
                       (dateRange === 'custom' && selectedRange?.from && selectedRange?.to) ? 
                        `${format(selectedRange.from, "dd.MM.yyyy")} - ${format(selectedRange.to, "dd.MM.yyyy")}` : 
                       dateRange === 'custom' ? 'Xüsusi tarix' : 'Bütün vaxtlar'}
                    </span>
                    <ChevronDown size={20} className="text-black" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[213px] rounded-[12px] bg-white border border-[#ececed] p-3 flex flex-col gap-3 shadow-xl">
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('today')}
                    className={cn(
                      "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'today' && "border-[#00B4CC]"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bu gün</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('last7')}
                    className={cn(
                      "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'last7' && "border-[#00B4CC]"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Son 7 gün</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('thisMonth')}
                    className={cn(
                      "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'thisMonth' && "border-[#00B4CC]"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bu ay</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('lastMonth')}
                    className={cn(
                      "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'lastMonth' && "border-[#00B4CC]"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Keçən ay</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('custom')}
                    className={cn(
                      "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'custom' && "border-[#00B4CC]"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Xüsusi tarix</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDateRangeSelect('all')}
                    className={cn(
                      "self-stretch flex items-center p-0 cursor-pointer hover:bg-transparent focus:bg-transparent",
                      dateRange === 'all' && "border-b border-[#00B4CC] pb-1"
                    )}
                  >
                    <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bütün vaxtlar</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogContent className="w-[395px] min-h-[389px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white font-sans flex flex-col">
                <div className="bg-[#fafafa] border-b border-[#ececed] p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] text-[#8e8c8c] font-bold uppercase tracking-wider">Tarix</div>
                    <button onClick={() => setIsCalendarOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                       <Image src="/close.svg" width={20} height={20} alt="close" className="opacity-40" />
                    </button>
                  </div>
                  <div className="h-[54px] w-full rounded-xl bg-white border border-[#ececed] flex items-center justify-between px-4 text-[15px] font-bold text-[#101828]">
                    <span>
                      {selectedRange?.from ? (
                        selectedRange.to ? (
                          <>
                            {format(selectedRange.from, "dd.MM.yyyy")} - {format(selectedRange.to, "dd.MM.yyyy")}
                          </>
                        ) : (
                          format(selectedRange.from, "dd.MM.yyyy")
                        )
                      ) : (
                        "Tarix seçin"
                      )}
                    </span>
                    <Image src="/Calendar.svg" width={22} height={22} alt="calendar" />
                  </div>
                </div>
                
                <div className="flex-1 px-4 py-2 flex justify-center overflow-y-auto">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={selectedRange?.from || new Date()}
                    selected={selectedRange}
                    onSelect={handleCustomDateSelect}
                    numberOfMonths={1}
                    locale={az}
                    className="w-full"
                  />
                </div>

                <div className="p-5 border-t border-[#ececed] flex items-center gap-3 bg-white mt-auto">
                  <button 
                    onClick={() => {
                      setSelectedRange(undefined);
                      setIsCalendarOpen(false);
                    }}
                    className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedRange?.from && selectedRange?.to) {
                        setDateRange('custom')
                        setIsCalendarOpen(false)
                      }
                    }}
                    disabled={!selectedRange?.from || !selectedRange?.to}
                    className="flex-1 h-11 rounded-xl bg-[#00B4CC] text-sm font-bold text-white hover:bg-[#009DB3] transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-300"
                  >
                    Tətbiq et
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <button className="h-10 rounded-lg bg-[#00B4CC] flex items-center justify-center px-5 gap-2 text-sm font-semibold text-white hover:bg-[#009DB3] transition-all shadow-sm active:scale-[0.98]">
              <span className="relative leading-[18px]">Hesabatı yüklə</span>
              <Image src="/DownloadSimple.svg" width={20} height={20} alt="download" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="self-stretch grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profit Card */}
            <div className="h-[94px] rounded-xl bg-white border border-[#ececed] flex items-center p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[rgba(0,180,204,0.15)] flex items-center justify-center shrink-0">
                <Image src="/vuesax/linear/dollar-square.png" width={24} height={24} alt="Profit" />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-xs">Ümumi gəlir</div>
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={draftProfit}
                      onChange={(e) => setDraftProfit(e.target.value)}
                      className="w-[110px] rounded-md border border-[#00B4CC] bg-white px-2 py-1 text-[18px] font-bold text-[#001028] outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
                    />
                    <span className="text-[14px] font-bold text-slate-400">AZN</span>
                  </div>
                ) : (
                  <b className="text-[22px] leading-[30px] text-[#001028] font-bold">
                    {isLoading ? '...' : `${data?.totalProfit?.toFixed(2) || '0.00'} AZN`}
                  </b>
                )}
              </div>
            </div>

            {/* Success Card */}
            <div className="h-[94px] rounded-xl bg-white border border-[#ececed] flex items-center p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#e7f8f2] flex items-center justify-center shrink-0">
                <Image src="/QrCode.png" width={24} height={24} alt="Success" />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-xs">Uğurlu girişlər</div>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={draftSuccessful}
                    onChange={(e) => setDraftSuccessful(e.target.value)}
                    className="w-[90px] rounded-md border border-[#00B4CC] bg-white px-2 py-1 text-[18px] font-bold text-black outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
                  />
                ) : (
                  <b className="text-[22px] leading-[30px] text-black font-bold">
                    {isLoading ? '...' : data?.successfulScans || 0}
                  </b>
                )}
              </div>
            </div>

            {/* Failed Card */}
            <div className="h-[94px] rounded-xl bg-white border border-[#ececed] flex items-center p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-[#feebef] flex items-center justify-center shrink-0">
                <Image src="/vuesax/linear/info-circle.png" width={24} height={24} alt="Failed" />
              </div>
              <div className="flex flex-1 flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-xs">Uğursuz girişlər</div>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={draftFailed}
                    onChange={(e) => setDraftFailed(e.target.value)}
                    className="w-[90px] rounded-md border border-[#00B4CC] bg-white px-2 py-1 text-[18px] font-bold text-black outline-none focus:ring-2 focus:ring-[#00B4CC]/30"
                  />
                ) : (
                  <b className="text-[22px] leading-[30px] text-black font-bold">
                    {isLoading ? '...' : data?.failedScans || 0}
                  </b>
                )}
              </div>
            </div>
          </div>

          {/* Customer Entries Section */}
          <div className="w-full flex flex-col items-start gap-5 pt-2">
            <div className="text-[18px] leading-[28px] font-bold text-black tracking-tight">Müştəri girişləri</div>
            
            <div className="self-stretch flex flex-col items-start gap-6">
              {/* Filters Row */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
                <div className="flex-1 w-full lg:w-[500px] h-10 bg-white rounded-lg border border-[#ececed] flex items-center px-4 py-1.5 gap-3 focus-within:border-[#00B4CC] transition-colors shadow-sm">
                  <Image src="/search.svg" width={20} height={20} alt="search" className="shrink-0 opacity-50" />
                  <input
                    type="text"
                    placeholder="Axtar..."
                    className="flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#94979c]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-[180px] rounded-lg bg-white border border-[#ececed] flex items-center justify-between px-4 py-1.5 outline-none hover:border-[#00B4CC] transition-all shadow-sm">
                        <span className="text-[13px] font-semibold">{statusFilter === 'SUCCESSFUL' ? 'Uğurlu' : statusFilter === 'UNSUCCESSFUL' ? 'Uğursuz' : 'Filter'}</span>
                        <ChevronDown size={18} className="text-black" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setStatusFilter('')}>Bütün statuslar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('SUCCESSFUL')}>Uğurlu</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('UNSUCCESSFUL')}>Uğursuz</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-[180px] rounded-lg bg-white border border-[#ececed] flex items-center justify-between px-4 py-1.5 outline-none hover:border-[#00B4CC] transition-all shadow-sm">
                        <span className="text-[13px] font-semibold">{sort === 'date_desc' ? 'Yeni-Köhnə' : 'Köhnə-Yeni'}</span>
                        <ChevronDown size={18} className="text-black" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSort('date_desc')}>Tarix (Yeni-Köhnə)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSort('date_asc')}>Tarix (Köhnə-Yeni)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {isAdmin && (
                <div className="flex flex-wrap items-center justify-between gap-4 w-full transition-all duration-300 animate-in fade-in-50 bg-white/50 p-2 rounded-lg border border-dashed border-[#00B4CC]/20">
                  <div className="flex items-center px-2">
                    <span className="text-[14px] font-medium text-foreground">Seçilib: {selected.size}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-[13.4px]">
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      disabled={selected.size === 0 || deleteEntranceHistory.isPending}
                      className={cn(
                        "flex h-[40px] min-w-[110px] w-fit items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer whitespace-nowrap",
                        selected.size === 0 || deleteEntranceHistory.isPending
                          ? "border-[#cecfd2]/40 bg-white text-muted-foreground opacity-40 cursor-not-allowed active:scale-100"
                          : "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300"
                      )}
                    >
                      {deleteEntranceHistory.isPending ? (
                        <Loader2 size={18} className="shrink-0 animate-spin" />
                      ) : (
                        <Trash2 size={18} className="shrink-0" />
                      )}
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="w-full overflow-x-auto rounded-[12px] border border-[#cecfd2] shadow-sm bg-white">
                <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
                  <colgroup>
                    {isAdmin && <col style={{ width: '48px' }} />}
                    {colWidths.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
                    <col />
                  </colgroup>
                  <thead>
                    <tr className="bg-[rgba(0,180,204,0.1)] text-left">
                      {isAdmin && (
                        <th className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={allOnPage}
                            onChange={toggleAll}
                            disabled={selectableItems.length === 0}
                            className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded disabled:opacity-40"
                            aria-label="Bütün girişləri seç"
                          />
                        </th>
                      )}
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider relative">ID
                        <div onMouseDown={(e) => handleMouseDown(0, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider relative">Ad / Soyad
                        <div onMouseDown={(e) => handleMouseDown(1, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider relative">Telefon
                        <div onMouseDown={(e) => handleMouseDown(2, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider relative">Tarix / Saat
                        <div onMouseDown={(e) => handleMouseDown(3, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider text-center relative">Məbləğ
                        <div onMouseDown={(e) => handleMouseDown(4, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider text-center relative">Nəticə
                        <div onMouseDown={(e) => handleMouseDown(5, e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"><div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" /></div>
                      </th>
                      <th className="px-5 py-3 text-[13px] font-bold text-[#101828] opacity-70 uppercase tracking-wider text-center">Səbəb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={colCount} className="p-20 text-center"><Loader2 className="animate-spin text-[#00B4CC] mx-auto" /></td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan={colCount} className="p-20 text-center text-slate-400 italic">Məlumat tapılmadı</td></tr>
                    ) : (
                      filteredItems.map((item, i) => {
                        const s = item.status?.toUpperCase();
                        const isSuccess = s === 'SUCCESSFUL' || s === 'ELIGIBLE' || s === 'UĞURLU' || s === 'UGURLU';
                        const [date, time] = item.scanDateTime ? item.scanDateTime.split(' ') : ['---', '---'];

                        return (
                          <tr key={item.id || i} className="border-b border-[#ececed] last:border-0 hover:bg-slate-50/80 transition-colors group">
                            {isAdmin && (
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.id != null && selected.has(item.id)}
                                  onChange={() => toggleOne(item)}
                                  disabled={item.id == null}
                                  className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded disabled:opacity-40"
                                  aria-label={`Giriş #${item.id || i} seç`}
                                />
                              </td>
                            )}
                            <td className="px-5 py-3 text-[14px] text-slate-400 font-medium">#{item.id || '---'}</td>
                            <td className="px-5 py-3 text-[14px]">
                              <div className="flex items-center gap-2 group-hover:text-[#00B4CC] transition-colors truncate">
                                {item.profilePhotoUrl ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ececed] relative shrink-0">
                                    <Image
                                      src={item.profilePhotoUrl}
                                      alt={`${item.firstName} ${item.lastName}`}
                                      fill
                                      sizes="32px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#d5f0f3] border border-[#ececed] flex items-center justify-center text-[11px] font-bold shrink-0">
                                    {item.firstName?.[0] || 'U'}
                                  </div>
                                )}
                                <span className="font-bold text-[#101828] group-hover:text-[#00B4CC] transition-colors truncate">
                                  {item.firstName} {item.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[14px] text-slate-600 font-medium">{item.phone || '---'}</td>
                            <td className="px-5 py-3 text-[14px]">
                              <div className="flex flex-col justify-center">
                                <span className="font-bold text-slate-700">{date}</span>
                                <span className="text-[12px] text-slate-400">{time}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[14px] font-bold text-[#101828] text-center">{item.amount?.toFixed(2) || '0.00'} AZN</td>
                            <td className="px-5 py-3 text-[14px]">
                              <div className="flex justify-center">
                                <div className={cn(
                                  "h-[24px] w-[73px] rounded-[20px] flex items-center justify-center gap-1.5 px-3 text-[10px] font-bold text-white shadow-xs",
                                  isSuccess ? "bg-[#166728]" : "bg-[#c9373a]"
                                )}>
                                  <div className="h-1 w-1 rounded-full bg-white shadow-sm" />
                                  <span className="uppercase tracking-tight">{isSuccess ? 'Uğurlu' : 'Xəta'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center text-slate-400 font-medium truncate text-[13px]">
                              {isSuccess ? (
                                <div className="flex justify-center">
                                  <div className="h-[1px] w-[16px] bg-[#cecfd2]" />
                                </div>
                              ) : item.reason || '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="w-full flex items-center justify-center gap-4 py-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center text-[15px] font-bold transition-all shadow-xs",
                        page === p 
                          ? "bg-[#00B4CC] text-white shadow-[#00B4CC40]" 
                          : "bg-white border border-[#ececed] text-black hover:border-[#00B4CC] hover:text-[#00B4CC]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
