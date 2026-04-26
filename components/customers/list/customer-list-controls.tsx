'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, Timer, UserCheck, UserX, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerSubscriptionType, SubscriptionPackageName } from '@/modules/customers'
import { DURATION_OPTIONS, SORT_OPTIONS, SUBSCRIPTION_STATUS_OPTIONS } from './customer-list-constants'
import type { CustomerSortValue } from './customer-list-utils'

function StatCard({ icon: Icon, label, value, active }: { icon: React.ElementType; label: string; value: number; active?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-1 min-w-35 flex-col gap-2 rounded-xl border px-4 py-3 transition-colors',
        active ? 'border-[#00B4CC] bg-[#00B4CC0D]' : 'border-border bg-card',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon size={15} className={active ? 'text-[#00B4CC]' : 'text-muted-foreground'} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn('text-2xl font-bold', active ? 'text-[#00B4CC]' : 'text-foreground')}>{value}</span>
    </div>
  )
}

function FilterDropdown<T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: readonly { value: T; label: string }[]
  selected: T | null
  onChange: (v: T | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const current = options.find((option) => option.value === selected)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
      >
        {current ? current.label : label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <button
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
              selected === null && 'text-[#00B4CC] font-medium',
            )}
          >
            <Check size={13} className={cn('shrink-0', selected === null ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')} />
            Bütün {label.toLowerCase()}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                selected === option.value && 'text-[#00B4CC] font-medium',
              )}
            >
              <Check
                size={13}
                className={cn('shrink-0', selected === option.value ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SortDropdown({
  value,
  onChange,
}: {
  value: CustomerSortValue | null
  onChange: (v: CustomerSortValue | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const current = SORT_OPTIONS.find((option) => option.value === value)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
      >
        {current ? current.label : 'Sırala'}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">Sırala</p>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                value === option.value && 'text-[#00B4CC] font-medium',
              )}
            >
              <Check size={13} className={cn('shrink-0', value === option.value ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CustomerStats({
  total,
  last7,
  expired,
  active,
}: {
  total: number
  last7: number
  expired: number
  active: number
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <StatCard icon={Users} label="Ümumi Müştərilər" value={total} />
      <StatCard icon={Timer} label="Abunəlikdə son 7 gün" value={last7} />
      <StatCard icon={UserX} label="Bitmiş abunəlik" value={expired} />
      <StatCard icon={UserCheck} label="Aktiv abunəlik" value={active} />
    </div>
  )
}

export function CustomerFilters({
  search,
  onSearchChange,
  packageOptions,
  selectedPackageId,
  onPackageChange,
  duration,
  onDurationChange,
  subscriptionStatus,
  onSubscriptionStatusChange,
  sortBy,
  onSortChange,
}: {
  search: string
  onSearchChange: (value: string) => void
  packageOptions: SubscriptionPackageName[]
  selectedPackageId: number | null
  onPackageChange: (value: number | null) => void
  duration: number | null
  onDurationChange: (value: number | null) => void
  subscriptionStatus: Exclude<CustomerSubscriptionType, 'all'> | null
  onSubscriptionStatusChange: (value: Exclude<CustomerSubscriptionType, 'all'> | null) => void
  sortBy: CustomerSortValue | null
  onSortChange: (value: CustomerSortValue | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-50">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış...."
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-[#00B4CC] transition-colors"
        />
      </div>
      <FilterDropdown
        label="Paketlər"
        options={packageOptions.map((option) => ({ value: option.id, label: option.name }))}
        selected={selectedPackageId}
        onChange={(value) => onPackageChange(value as number | null)}
      />
      <FilterDropdown
        label="Müddət"
        options={DURATION_OPTIONS}
        selected={duration}
        onChange={(value) => onDurationChange(value as number | null)}
      />
      <FilterDropdown
        label="Abunəlik"
        options={SUBSCRIPTION_STATUS_OPTIONS}
        selected={subscriptionStatus}
        onChange={(value) => onSubscriptionStatusChange(value as Exclude<CustomerSubscriptionType, 'all'> | null)}
      />
      <SortDropdown value={sortBy} onChange={onSortChange} />
    </div>
  )
}
