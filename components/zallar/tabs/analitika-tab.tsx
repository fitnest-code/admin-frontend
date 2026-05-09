'use client'

import { useState } from 'react'
import { Wallet, UserCheck, UserX, Search, Filter, ArrowUpDown, Download, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface CheckIn {
  id: string
  fullName: string
  phone: string
  dateTime: string
  amount: string
  result: 'uğurlu' | 'xəta'
  reason?: string
}

const MOCK_CHECKINS: CheckIn[] = [
  {
    id: '0000000',
    fullName: 'Ramil Babayev',
    phone: '+994 50 000 00 00',
    dateTime: '24 fevral 2025 21:00',
    amount: '60 AZN',
    result: 'uğurlu',
  },
  {
    id: '0000000',
    fullName: 'Ramil Babayev',
    phone: '+994 50 000 00 00',
    dateTime: '24 fevral 2025 21:00',
    amount: '60 AZN',
    result: 'xəta',
    reason: 'İnternet',
  },
]

export function AnalitikaTab() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Analytics Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Zal analitikası</h2>
        <div className="flex items-center justify-between">
          <div className="relative">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
              Tarix aralığı
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#008799] transition-colors shadow-sm shadow-[#00B4CC]/20">
            <Download size={14} />
            Hesabatı yüklə
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00B4CC1A] text-[#00B4CC]">
            <Wallet size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Ümumi gəlir</span>
            <span className="text-lg font-bold text-foreground">2600 AZN</span>
          </div>
        </div>

        {/* Successful Check-ins */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-500">
            <UserCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Uğurlu girişlər</span>
            <span className="text-lg font-bold text-foreground">5</span>
          </div>
        </div>

        {/* Unsuccessful Check-ins */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <UserX size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Uğursuz girişlər</span>
            <span className="text-lg font-bold text-foreground">2</span>
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
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
            Filter
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
            Sırala
            <ChevronDown size={14} />
          </button>
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
            {MOCK_CHECKINS.map((row, i) => (
              <div key={i} className="grid grid-cols-[5rem_1fr_1fr_1.5fr_1fr_1fr_1fr] items-center gap-4 px-4 py-4 hover:bg-secondary/40 transition-colors">
                <span className="text-xs text-foreground font-mono">{row.id}</span>
                <span className="text-xs font-medium text-foreground">{row.fullName}</span>
                <span className="text-xs text-muted-foreground">{row.phone}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{row.dateTime}</span>
                <span className="text-xs text-muted-foreground font-medium">{row.amount}</span>
                <div className="flex justify-center">
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 min-w-[75px] justify-center",
                    row.result === 'uğurlu' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", row.result === 'uğurlu' ? "bg-green-700" : "bg-red-500")} />
                    {row.result === 'uğurlu' ? "Uğurlu" : "Xəta"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground text-center">{row.reason || "—"}</span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4 bg-card/50">
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00B4CC] text-[11px] font-bold text-white shadow-sm shadow-[#00B4CC]/20 transition-transform active:scale-90">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors active:scale-90">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors active:scale-90">3</button>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors active:scale-90">4</button>
            <span className="px-1 text-muted-foreground text-[11px]">...</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:bg-secondary transition-colors active:scale-90">34</button>
          </div>
        </div>
      </div>
    </div>
  )
}
