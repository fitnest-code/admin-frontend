'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, ChevronDown, Search, Timer, UserCheck, UserX, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerSubscriptionType, SubscriptionPackageName } from '@/modules/customers'
import { DURATION_OPTIONS, SORT_OPTIONS, SUBSCRIPTION_STATUS_OPTIONS } from './customer-list-constants'
import type { CustomerSortValue } from './customer-list-utils'

function StatCard({
  icon: Icon,
  iconSrc,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ElementType
  iconSrc?: string
  label: string
  value: string | number
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-1 min-w-[210px] flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none',
        active
          ? 'border-[#00B4CC] shadow-sm bg-gradient-to-b from-white to-[#00b4cc]/[0.03]'
          : 'border-[#cecfd2]/60',
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {iconSrc ? (
          <Image src={iconSrc} width={16} height={16} alt="" className={cn('shrink-0', active ? '' : 'opacity-75')} />
        ) : (
          <Icon size={16} className={active ? 'text-[#00B4CC]' : 'text-muted-foreground'} />
        )}
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <span className="text-[20px] font-bold text-foreground tracking-tight">{value}</span>
      </div>
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
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-[#00B4CC] transition-all duration-200 shadow-sm"
      >
        {current ? current.label : label}
        <ChevronDown size={14} className={cn('transition-transform text-muted-foreground', open && 'rotate-180')} />
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
        className="flex h-[40px] items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-[#00B4CC] transition-all duration-200 shadow-sm"
      >
        {current ? current.label : 'Sırala'}
        <ChevronDown size={14} className={cn('transition-transform text-muted-foreground', open && 'rotate-180')} />
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
  selectedStatus,
  onStatusClick,
}: {
  total: number
  last7: number
  expired: number
  active: number
  selectedStatus?: Exclude<CustomerSubscriptionType, 'ALL'> | null
  onStatusClick?: (status: Exclude<CustomerSubscriptionType, 'ALL'> | null) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      <StatCard
        iconSrc="/vuesax/linear/People.svg"
        icon={Users}
        label="Ümumi Müştərilər"
        value={total}
        active={selectedStatus === null || selectedStatus === undefined}
        onClick={() => onStatusClick?.(null)}
      />
      <StatCard
        iconSrc="/abunelikde-7-gun.svg"
        icon={Timer}
        label="Abunəlikdə son 7 gün"
        value={last7}
        active={selectedStatus === 'LAST_7_DAYS'}
        onClick={() => onStatusClick?.('LAST_7_DAYS')}
      />
      <StatCard
        iconSrc="/bitmis-status.svg"
        icon={UserX}
        label="Bitmiş Status"
        value={expired}
        active={selectedStatus === 'FINISHED'}
        onClick={() => onStatusClick?.('FINISHED')}
      />
      <StatCard
        iconSrc="/dondurulmus-status.svg"
        icon={UserCheck}
        label="Dondurulmuş Status"
        value="YAXINDA"
        active={selectedStatus === 'FROZEN'}
        onClick={() => onStatusClick?.('FROZEN')}
      />
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
  subscriptionStatus: Exclude<CustomerSubscriptionType, 'ALL'> | null
  onSubscriptionStatusChange: (value: Exclude<CustomerSubscriptionType, 'ALL'> | null) => void
  sortBy: CustomerSortValue | null
  onSortChange: (value: CustomerSortValue | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      <div className="relative flex-1 min-w-[280px]">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış....."
          className="h-[40px] w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm font-medium outline-none focus:border-[#00B4CC] transition-all duration-200 shadow-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
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
          onChange={(value) => onSubscriptionStatusChange(value as Exclude<CustomerSubscriptionType, 'ALL'> | null)}
        />
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>
    </div>
  )
}
