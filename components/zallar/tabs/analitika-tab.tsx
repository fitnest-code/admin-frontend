'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymAnalytics } from '@/lib/query/gym-query'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { Calendar as CalendarIcon } from 'lucide-react'

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
        return
      default:
        return
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
    setPage(1)
  }

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (range?.from && range?.to) {
      setStartDate(format(range.from, 'yyyy-MM-dd'))
      setEndDate(format(range.to, 'yyyy-MM-dd'))
      setPage(1)
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

  const historyItems = data?.history?.items || []
  
  const filteredItems = query 
    ? historyItems.filter(item => 
        (item.firstName + ' ' + item.lastName).toLowerCase().includes(query.toLowerCase()) || 
        item.phone?.includes(query))
    : historyItems

  const totalPages = data?.history?.total ? Math.ceil(data.history.total / pageSize) : 1

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-6 sm:p-8 gap-10 font-sans shadow-sm">
      <div className="self-stretch flex flex-col items-start gap-8">
        
        {/* Zal analitikas Section Header */}
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-2">
          <div className="text-[20px] leading-[30px] font-bold text-black tracking-tight">Zal analitikası</div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-10">
          
          {/* Controls: Date Range & Export */}
          <div className="self-stretch rounded-xl border border-[#ececed] flex flex-col md:flex-row items-center justify-between p-3 gap-5 bg-slate-50/20">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-12 w-[237px] rounded-xl bg-white border border-[#ececed] flex items-center justify-center px-4 gap-5 text-base font-medium text-black transition-all hover:border-[#00B4CC] hover:shadow-sm outline-none">
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

            <button className="h-11 rounded-xl bg-[#00B4CC] flex items-center justify-center px-6 gap-3 text-sm font-semibold text-white hover:bg-[#009DB3] transition-all shadow-sm active:scale-[0.98]">
              <span className="relative leading-[18px]">Hesabatı yüklə</span>
              <Image src="/DownloadSimple.svg" width={24} height={24} alt="download" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="self-stretch grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profit Card */}
            <div className="h-[110px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-[rgba(0,180,204,0.15)] flex items-center justify-center shrink-0">
                <Image src="/vuesax/linear/dollar-square.png" width={28} height={28} alt="Profit" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-sm">Ümumi gəlir</div>
                <b className="text-[26px] leading-[36px] text-[#001028] font-bold">
                  {isLoading ? '...' : `${data?.totalProfit?.toFixed(2) || '0.00'} AZN`}
                </b>
              </div>
            </div>

            {/* Success Card */}
            <div className="h-[110px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-[#e7f8f2] flex items-center justify-center shrink-0">
                <Image src="/QrCode.png" width={28} height={28} alt="Success" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-sm">Uğurlu girişlər</div>
                <b className="text-[26px] leading-[36px] text-black font-bold">
                  {isLoading ? '...' : data?.successfulScans || 0}
                </b>
              </div>
            </div>

            {/* Failed Card */}
            <div className="h-[110px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-lg bg-[#feebef] flex items-center justify-center shrink-0">
                <Image src="/vuesax/linear/info-circle.png" width={28} height={28} alt="Failed" />
              </div>
              <div className="flex flex-col items-start justify-center">
                <div className="text-slate-500 font-medium text-sm">Uğursuz girişlər</div>
                <b className="text-[26px] leading-[36px] text-black font-bold">
                  {isLoading ? '...' : data?.failedScans || 0}
                </b>
              </div>
            </div>
          </div>

          {/* Customer Entries Section */}
          <div className="w-full flex flex-col items-start gap-6 pt-4">
            <div className="text-[20px] leading-[30px] font-bold text-black tracking-tight">Müştəri girişləri</div>
            
            <div className="self-stretch flex flex-col items-start gap-6">
              {/* Filters Row */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
                <div className="flex-1 w-full lg:w-[527px] h-12 bg-white rounded-xl border border-[#ececed] flex items-center px-6 py-1.5 gap-3 focus-within:border-[#00B4CC] transition-colors shadow-sm">
                  <Image src="/search.svg" width={24} height={24} alt="search" className="shrink-0 opacity-50" />
                  <input
                    type="text"
                    placeholder="Axtar..."
                    className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#94979c]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-12 w-[216px] rounded-xl bg-white border border-[#ececed] flex items-center justify-between px-6 py-1.5 outline-none hover:border-[#00B4CC] transition-all shadow-sm">
                        <span className="text-sm font-semibold">{statusFilter === 'SUCCESSFUL' ? 'Uğurlu' : statusFilter === 'UNSUCCESSFUL' ? 'Uğursuz' : 'Filter'}</span>
                        <ChevronDown size={20} className="text-black" />
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
                      <button className="h-12 w-[216px] rounded-xl bg-white border border-[#ececed] flex items-center justify-between px-6 py-1.5 outline-none hover:border-[#00B4CC] transition-all shadow-sm">
                        <span className="text-sm font-semibold">{sort === 'date_desc' ? 'Yeni-Köhnə' : 'Köhnə-Yeni'}</span>
                        <ChevronDown size={20} className="text-black" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSort('date_desc')}>Tarix (Yeni-Köhnə)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSort('date_asc')}>Tarix (Köhnə-Yeni)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Table Container */}
              <div className="w-full overflow-x-auto rounded-[12px] border border-[#cecfd2] shadow-sm bg-white">
                <div className="min-w-[1000px] flex flex-col bg-white">
                  {/* Table Header */}
                  <div className="w-full h-[64px] bg-[rgba(0,180,204,0.15)] flex items-center px-[28px] gap-[48px] text-[16px] font-bold text-[#101828]">
                    <div className="w-[71px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider">ID</div>
                    <div className="w-[110px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider">Ad / Soyad</div>
                    <div className="w-[150px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider">Telefon</div>
                    <div className="w-[111px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider">Tarix / Saat</div>
                    <div className="w-[120px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider text-center">Giriş məbləği</div>
                    <div className="w-[73px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider text-center">Nəticə</div>
                    <div className="w-[60px] shrink-0 opacity-80 uppercase text-[13px] tracking-wider text-center">Səbəb</div>
                  </div>

                  {/* Rows */}
                  <div className="flex flex-col w-full divide-y divide-[#ececed]">
                    {isLoading ? (
                      <div className="p-20 flex justify-center items-center"><Loader2 className="animate-spin text-[#00B4CC]" /></div>
                    ) : filteredItems.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 italic">Məlumat tapılmadı</div>
                    ) : (
                      filteredItems.map((item, i) => {
                        const s = item.status?.toUpperCase();
                        const isSuccess = s === 'SUCCESSFUL' || s === 'ELIGIBLE' || s === 'UĞURLU' || s === 'UGURLU';
                        const [date, time] = item.scanDateTime ? item.scanDateTime.split(' ') : ['---', '---'];

                        return (
                          <div key={item.id || i} className="w-full h-[84px] flex items-center px-[28px] gap-[48px] text-[16px] hover:bg-slate-50/80 transition-colors group">
                            <div className="w-[71px] shrink-0 text-slate-400 font-medium">#{item.id || '---'}</div>
                            <div className="w-[110px] shrink-0 font-bold text-[#101828] group-hover:text-[#00B4CC] transition-colors truncate">{item.firstName} {item.lastName}</div>
                            <div className="w-[150px] shrink-0 text-slate-600 font-medium">{item.phone || '---'}</div>
                            <div className="w-[111px] shrink-0 flex flex-col justify-center">
                              <span className="font-bold text-slate-700">{date}</span>
                              <span className="text-[14px] text-slate-400">{time}</span>
                            </div>
                            <div className="w-[120px] shrink-0 font-bold text-[#101828] text-center">{item.amount?.toFixed(2) || '0.00'} AZN</div>
                            <div className="w-[73px] shrink-0 flex justify-center">
                              <div className={cn(
                                "h-[26px] w-[73px] rounded-[20px] flex items-center justify-center gap-1.5 px-3 text-[12px] font-bold text-white shadow-xs",
                                isSuccess ? "bg-[#166728]" : "bg-[#c9373a]"
                              )}>
                                <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                                <span className="uppercase tracking-tight text-[10px]">{isSuccess ? 'Uğurlu' : 'Xəta'}</span>
                              </div>
                            </div>
                            <div className="w-[60px] shrink-0 text-center text-slate-400 font-medium truncate">
                              {isSuccess ? (
                                <div className="flex justify-center">
                                  <div className="h-[1.5px] w-[18px] bg-[#cecfd2]" />
                                </div>
                              ) : item.reason || '—'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
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
