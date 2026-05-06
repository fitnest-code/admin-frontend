'use client'

import { ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
}

interface CategorySelectProps {
  value: number | null
  onChange: (value: number | null) => void
  data?: { items: Category[] }
  loading: boolean
}

export function CategorySelect({
  value,
  onChange,
  data,
  loading,
}: CategorySelectProps) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <label className="text-sm  text-black">Kateqoriya</label>

      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value ? Number(e.target.value) : null)
          }
          disabled={loading}
          className={cn(
            'w-full appearance-none rounded-[12px] border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors cursor-pointer',
            !value ? 'text-muted-foreground' : 'text-foreground',
          )}
        >
          <option value="" disabled>
            {loading ? 'Yüklənir...' : 'Kateqoriya'}
          </option>

          {data?.items.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </span>
      </div>
    </div>
  )
}