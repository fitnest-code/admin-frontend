'use client'

import { useState } from 'react'
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
    <div className="flex flex-col gap-6 py-2">
      {/* Analytics Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Zal analitikası</h2>
        <div className="flex items-center justify-between">
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
                  <Calendar size={14} />
                  {dateRange === 'today' ? 'Bu gün' :
                   dateRange === 'last7' ? 'Son 7 gün' :
                   dateRange === 'thisMonth' ? 'Bu ay' :
                   dateRange === 'lastMonth' ? 'Keçən ay' : 'Bütün vaxtlar'}
                  <ChevronDown size={14} />
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
          <button className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#008799] transition-colors shadow-sm shadow-[#00B4CC]/20">
            <Download size={14} />
            Hesabatı yüklə
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00B4CC1A] text-[#00B4CC]">
            <Wallet size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Ümumi gəlir</span>
            <span className="text-lg font-bold text-foreground">
              {isLoading ? '...' : `${data?.totalProfit?.toFixed(2) || '0.00'} AZN`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-500">
            <UserCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Uğurlu girişlər</span>
            <span className="text-lg font-bold text-foreground">
              {isLoading ? '...' : data?.successfulScans || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <UserX size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Uğursuz girişlər</span>
            <span className="text-lg font-bold text-foreground">
              {isLoading ? '...' : data?.failedScans || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Check-ins Table Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Müştəri girişləri</h2>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 focus-within:border-[#00B4CC] transition-colors">
            <Search size={14} className="shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Axtar..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
                <Filter size={14} />
                {statusFilter === 'SUCCESSFUL' ? 'Uğurlu' : statusFilter === 'UNSUCCESSFUL' ? 'Uğursuz' : 'Bütün statuslar'}
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setStatusFilter('')}>Bütün statuslar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('SUCCESSFUL')}>Uğurlu</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('UNSUCCESSFUL')}>Uğursuz</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
                <ArrowUpDown size={14} />
                {sort === 'date_desc' ? 'Tarix (Yeni-Köhnə)' : sort === 'date_asc' ? 'Tarix (Köhnə-Yeni)' : 'Sırala'}
                <ChevronDown size={14} />
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

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[5rem_1fr_1fr_1.5fr_1fr_1fr_1fr] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3">
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">ID</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Ad / Soyad</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Telefon</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Tarix / Saat</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Giriş məbləği</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider text-center">Nəticə</span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider text-center">Səbəb</span>
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="flex justify-center p-8 text-sm text-muted-foreground">Yüklənir...</div>
            ) : filteredItems.length === 0 ? (
              <div className="flex justify-center p-8 text-sm text-muted-foreground">Məlumat tapılmadı</div>
            ) : (
              filteredItems.map((row, i) => {
                const isSuccess = row.status === 'Uğurlu' || row.status === 'SUCCESSFUL' || row.status === 'ELIGIBLE'
                return (
                  <div key={row.id || i} className="grid grid-cols-[5rem_1fr_1fr_1.5fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 hover:bg-secondary/40 transition-colors">
                    <span className="text-xs text-foreground font-mono">{row.id || '---'}</span>
                    <span className="text-xs font-medium text-foreground">{row.firstName} {row.lastName}</span>
                    <span className="text-xs text-muted-foreground">{row.phone || '---'}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{row.scanDateTime}</span>
                    <span className="text-xs text-muted-foreground font-medium">{row.amount?.toFixed(2)} AZN</span>
                    <div className="flex justify-center">
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 min-w-[75px] justify-center",
                        isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isSuccess ? "bg-green-700" : "bg-red-500")} />
                        {isSuccess ? "Uğurlu" : "Xəta"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{row.reason || "—"}</span>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4 bg-card/50">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold transition-transform active:scale-90",
                    page === p 
                      ? "bg-[#00B4CC] text-white shadow-sm shadow-[#00B4CC]/20" 
                      : "border border-border text-muted-foreground hover:bg-secondary"
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
  )
}
