'use client'

import { useState } from 'react'
import { Search, ChevronDown, Filter, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Reservation {
  id: string
  user: {
    name: string
    avatar?: string
  }
  date: string
  time: string
  gymName: string
  status: 'active' | 'completed' | 'cancelled'
}

const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', user: { name: 'Nigar Məmmədova' }, date: '31 Mart, 2025', time: '14:00', gymName: 'FIT CLUB', status: 'active' },
  { id: '2', user: { name: 'Ramil Babayev' },   date: '30 Mart, 2025', time: '10:00', gymName: 'FIT CLUB', status: 'completed' },
  { id: '3', user: { name: 'Aynur Həsənova' },  date: '29 Mart, 2025', time: '18:30', gymName: 'FIT CLUB', status: 'cancelled' },
  { id: '4', user: { name: 'Orxan Nəbiyev' },   date: '28 Mart, 2025', time: '09:00', gymName: 'FIT CLUB', status: 'completed' },
]

const STATUS_LABELS = {
  active: 'Gözləmədə',
  completed: 'Təsdiq edildi',
  cancelled: 'Rədd edildi',
}

const STATUS_STYLES = {
  active: 'bg-amber-50 text-amber-600 border border-amber-100',
  completed: 'bg-green-50 text-green-600 border border-green-100',
  cancelled: 'bg-red-50 text-red-600 border border-red-100',
}

export function ReservationsTab() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const filtered = MOCK_RESERVATIONS.filter(r => {
    const matchQuery = r.user.name.toLowerCase().includes(query.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchQuery && matchStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Müştəri, Zalın statusu..."
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
            Sırala
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
            Status
            <Filter size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Müştəri</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Tarix</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Zal adı</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Status</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-right">Detallı</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] items-center gap-4 px-4 py-3.5 hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B4CC15] text-xs font-bold text-[#00B4CC]">
                  {r.user.name[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{r.user.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{r.date}</span>
              <span className="text-sm text-foreground">{r.gymName}</span>
              <div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', STATUS_STYLES[r.status])}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button className="p-1.5 text-muted-foreground hover:text-[#00B4CC] transition-colors" title="Detallı bax">
                  <Eye size={16} />
                </button>
                <button className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors" title="Sil">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
