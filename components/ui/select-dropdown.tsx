'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  value: string
  label: string
}

interface SelectDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SelectDropdown({ options, value, onChange, className }: SelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border bg-card',
          'px-3 py-1.5 text-xs font-medium text-muted-foreground',
          'transition-colors hover:border-[#00B4CC] hover:text-[#00B4CC]',
          open && 'border-[#00B4CC] text-[#00B4CC]',
        )}
      >
        {selected?.label}
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute right-0 z-50 mt-1.5 min-w-[120px] overflow-hidden',
            'rounded-xl border border-border bg-card shadow-lg',
          )}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2',
                'px-3 py-2 text-xs font-medium transition-colors',
                opt.value === value
                  ? 'bg-[#00B4CC26] text-[#00B4CC]'
                  : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              {opt.label}
              {opt.value === value && <Check size={11} className="text-[#00B4CC]" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
