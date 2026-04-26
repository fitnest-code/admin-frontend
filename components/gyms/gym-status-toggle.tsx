'use client'

import { cn } from '@/lib/utils'

interface GymStatusToggleProps {
  active: boolean
  onToggle: () => void
}

export function GymStatusToggle({ active, onToggle }: GymStatusToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
        active ? 'bg-[#00B4CC]' : 'bg-muted',
      )}
    >
      <span className="sr-only">{active ? 'Deaktiv et' : 'Aktiv et'}</span>
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          active ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}
