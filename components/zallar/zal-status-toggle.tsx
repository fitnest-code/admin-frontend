'use client'

import { cn } from '@/lib/utils'

interface ZalStatusToggleProps {
  active: boolean
  onToggle: () => void
}

export function ZalStatusToggle({ active, onToggle }: ZalStatusToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4CC] focus-visible:ring-offset-2',
        active ? 'bg-[#00B4CC]' : 'bg-[#D1D5DB]',
      )}
      aria-label={active ? 'Aktiv — söndürmək üçün basın' : 'Deaktiv — aktivləşdirmək üçün basın'}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          active ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
