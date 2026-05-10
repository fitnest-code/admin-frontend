'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Wallet, UserCheck, UserX, Search, Filter, Download, ChevronDown, Calendar, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymAnalytics } from '@/lib/query/gym-query'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
  
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const handleDateRangeSelect = (range: string) => {
    setDateRange(range)
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
        return
      default:
        return
    }
    
    setStartDate(start.toISOString())
    setEndDate(end.toISOString())
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
  
  // Client-side search (since query wasn't added to backend API)
  const filteredItems = query 
    ? historyItems.filter(item => 
        (item.firstName + ' ' + item.lastName).toLowerCase().includes(query.toLowerCase()) || 
        item.phone?.includes(query))
    : historyItems

  const totalPages = data?.history?.total ? Math.ceil(data.history.total / pageSize) : 1

  return (
    <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-start p-5 sm:p-[20px_28px] text-left text-foreground font-sans">
      <div className="self-stretch flex flex-col items-start gap-7">
        
        {/* Header */}
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Zal analitikası</div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-10 text-base">
          
          {/* Controls: Date Range & Export */}
          <div className="self-stretch rounded-xl border border-[#ececed] flex flex-wrap items-center justify-between p-3 gap-5">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-12 w-[237px] rounded-xl bg-white border border-[#ececed] flex items-center justify-center px-4 gap-5 text-sm sm:text-base text-foreground transition-colors hover:border-[#00B4CC]">
                    <span className="relative leading-[24px]">
                      {dateRange === 'today' ? 'Bu gün' :
                       dateRange === 'last7' ? 'Son 7 gün' :
                       dateRange === 'thisMonth' ? 'Bu ay' :
                       dateRange === 'lastMonth' ? 'Keçən ay' : 'Bütün vaxtlar'}
                    </span>
                    <ChevronDown size={20} className="text-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => handleDateRangeSelect('all')}>Bütün vaxtlar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDateRangeSelect('today')}>Bu gün</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDateRangeSelect('last7')}>Son 7 gün</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDateRangeSelect('thisMonth')}>Bu ay</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDateRangeSelect('lastMonth')}>Keçən ay</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button className="rounded-xl bg-[#00B4CC] flex items-center justify-center p-[6px_12px_6px_24px] gap-3 text-sm text-[#fafafa] hover:bg-[#008799] transition-colors">
              <div className="relative leading-[18px]">Hesabatı yüklə</div>
              <Download size={18} className="text-white" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="self-stretch flex flex-wrap items-center justify-between gap-5 text-[#7d94a0]">
            <div className="flex-1 min-w-[300px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4">
              <div className="rounded-lg bg-[rgba(0,180,204,0.15)] flex items-center justify-center p-[10px]">
                <Image src="/vuesax/linear/dollar-square.png" width={24} height={24} alt="Total Profit" />
              </div>
              <div className="flex-1 flex flex-col items-start">
                <div className="self-stretch relative leading-[24px] font-medium text-sm">Ümumi gəlir</div>
                <b className="self-stretch relative text-2xl leading-[36px] text-[#001028]">
                  {isLoading ? '...' : `${data?.totalProfit?.toFixed(2) || '0.00'} AZN`}
                </b>
              </div>
            </div>

            <div className="flex-1 min-w-[300px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4">
              <div className="rounded-lg bg-[#e7f8f2] flex items-center justify-center p-[10px]">
                <Image src="/QrCode.png" width={24} height={24} alt="Successful Scans" />
              </div>
              <div className="flex-1 flex flex-col items-start">
                <div className="self-stretch relative leading-[24px] font-medium text-sm">Uğurlu girişlər</div>
                <b className="self-stretch relative text-2xl leading-[36px] text-[#000]">
                  {isLoading ? '...' : data?.successfulScans || 0}
                </b>
              </div>
            </div>

            <div className="flex-1 min-w-[300px] rounded-xl bg-white border border-[#ececed] flex items-center p-6 gap-4">
              <div className="rounded-lg bg-[#feebef] flex items-center justify-center p-[10px]">
                <Image src="/vuesax/linear/info-circle.png" width={24} height={24} alt="Unsuccessful Scans" />
              </div>
              <div className="flex-1 flex flex-col items-start">
                <div className="self-stretch relative leading-[24px] font-medium text-sm">Uğursuz girişlər</div>
                <b className="self-stretch relative text-2xl leading-[36px] text-[#000]">
                  {isLoading ? '...' : data?.failedScans || 0}
                </b>
              </div>
            </div>
          </div>

      {/* Customer Check-ins Table Section */}
      <div className="w-full relative flex flex-col items-center gap-[24px] text-left text-[20px] text-black font-sans">
        <div className="self-stretch flex flex-col items-start gap-[16px]">
          <div className="relative leading-[30px] font-semibold">Müştəri girişləri</div>
          
          <div className="self-stretch flex flex-col items-start gap-[20px] text-[16px]">
            {/* Search & Filters */}
            {/* Search & Filters */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex-1 h-12 bg-white rounded-xl border border-[#ececed] flex items-center px-4 gap-3">
                <Image src="/search.svg" width={24} height={24} alt="search" />
                <input
                  type="text"
                  placeholder="Axtar..."
                  className="flex-1 bg-transparent text-[14px] text-[#94979c] outline-none placeholder:text-[#94979c]"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-[48px] w-[216px] rounded-xl bg-white border border-[#ececed] flex items-center justify-center p-[6px_12px_6px_24px] gap-[12px] outline-none">
                    <div className="relative leading-[24px]">
                      {statusFilter === 'SUCCESSFUL' ? 'Uğurlu' : statusFilter === 'UNSUCCESSFUL' ? 'Uğursuz' : 'Filter'}
                    </div>
                    <div className="h-[20px] w-[20px] relative">
                      <ChevronDown className="absolute inset-0 w-full h-full text-black" strokeWidth={1.5} />
                    </div>
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
                  <button className="h-[48px] w-[216px] rounded-xl bg-white border border-[#ececed] flex items-center justify-center p-[6px_12px_6px_24px] gap-[12px] outline-none">
                    <div className="relative leading-[24px]">
                      {sort === 'date_desc' ? 'Yeni-Köhnə' : sort === 'date_asc' ? 'Köhnə-Yeni' : 'Sırala'}
                    </div>
                    <div className="h-[20px] w-[20px] relative">
                      <ChevronDown className="absolute inset-0 w-full h-full text-black" strokeWidth={1.5} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSort('date_desc')}>Tarix (Yeni-Köhnə)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('date_asc')}>Tarix (Köhnə-Yeni)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('status_asc')}>Status (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort('status_desc')}>Status (Z-A)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table Area */}
            <div className="w-full overflow-x-auto border-t border-[#ececed] mt-4">
              <div className="min-w-[1000px] flex flex-col">
                {/* Table Header */}
                <div className="w-full bg-[#00B4CC14] border-b border-[#ececed] flex items-center px-7 py-4 gap-4 text-[16px]">
                  <div className="w-[80px] relative leading-[24px] shrink-0 font-semibold text-[#101828]">ID</div>
                  <div className="flex-1 relative leading-[24px] font-semibold text-[#101828]">Ad / Soyad</div>
                  <div className="w-[180px] relative leading-[24px] shrink-0 font-semibold text-[#101828]">Telefon</div>
                  <div className="w-[180px] relative leading-[24px] shrink-0 font-semibold text-[#101828]">Tarix / Saat</div>
                  <div className="w-[120px] relative leading-[24px] shrink-0 font-semibold text-[#101828] text-center">Giriş məbləği</div>
                  <div className="w-[100px] relative leading-[24px] shrink-0 font-semibold text-[#101828]">Nəticə</div>
                  <div className="w-[100px] relative leading-[24px] shrink-0 font-semibold text-[#101828] text-center">Səbəb</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col w-full text-[16px]">
                  {isLoading ? (
                    <div className="w-full bg-white border-b border-x border-[#ececed] flex justify-center items-center py-10 text-[#94979c]">Yüklənir...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="w-full bg-white border-b border-x border-[#ececed] flex justify-center items-center py-20 text-[#94979c]">Məlumat tapılmadı</div>
                  ) : (
                    filteredItems.map((row, i) => {
                      const isSuccess = row.status === 'Uğurlu' || row.status === 'SUCCESSFUL' || row.status === 'ELIGIBLE'
                      
                      // Format date and time
                      const [dateStr, timeStr] = row.scanDateTime ? row.scanDateTime.split(' ') : ['---', '---']
                      
                      return (
                        <div key={row.id || i} className="w-full bg-white border-b border-[#ececed] flex items-center px-7 py-4 gap-4 hover:bg-slate-50 transition-colors">
                          <div className="w-[80px] relative leading-[24px] shrink-0 text-[#667085] font-medium">{row.id || '---'}</div>
                          <div className="flex-1 relative leading-[24px] font-semibold text-[#101828] font-['SF_Pro']">{row.firstName} {row.lastName}</div>
                          <div className="w-[180px] relative leading-[24px] shrink-0 text-[#667085] font-medium">{row.phone || '---'}</div>
                          <div className="w-[180px] flex flex-col items-start justify-center gap-[2px] shrink-0 text-[#667085] font-medium">
                            <div className="relative leading-[24px]">{dateStr}</div>
                            <div className="relative leading-[24px]">{timeStr}</div>
                          </div>
                          <div className="w-[120px] relative leading-[24px] text-center shrink-0 text-[#667085] font-medium">{row.amount?.toFixed(2) || '0.00'} AZN</div>
                          <div className="w-[100px] shrink-0">
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full gap-1.5",
                              isSuccess ? "bg-green-50" : "bg-red-50"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", isSuccess ? "bg-green-600" : "bg-red-600")} />
                              <span className={cn("text-[12px] font-semibold", isSuccess ? "text-green-700" : "text-red-700")}>
                                {isSuccess ? "Uğurlu" : "Xəta"}
                              </span>
                            </div>
                          </div>
                          <div className="w-[100px] flex items-center justify-center shrink-0 text-[#667085] font-medium">
                            {row.reason || '—'}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-end justify-center gap-[18px] text-center text-[16px] pt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 5 && p > 3 && p < totalPages - 1 && Math.abs(page - p) > 1) {
                    if (p === 4) return (
                      <div key={p} className="h-[32px] w-[32px] rounded-[4px] bg-white border border-[#ececed] flex flex-col items-center justify-center">
                        <div className="rounded-[4px] flex items-center justify-center gap-[1px]">
                           <div className="h-[3px] w-[3px] relative rounded-full bg-[#000]" />
                           <div className="h-[3px] w-[3px] relative rounded-full bg-[#000]" />
                           <div className="h-[3px] w-[3px] relative rounded-full bg-[#000]" />
                        </div>
                      </div>
                    );
                    return null;
                  }
                  
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-[32px] w-[32px] rounded-[4px] flex flex-col items-center justify-center transition-colors outline-none",
                        page === p 
                          ? "bg-[#00B4CC] text-white" 
                          : "bg-white border border-[#ececed] text-[#000] hover:bg-slate-50"
                      )}
                    >
                      <div className="self-stretch relative leading-[24px] font-semibold">{p}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
