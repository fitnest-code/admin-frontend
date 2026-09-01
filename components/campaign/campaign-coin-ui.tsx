'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function CoinTabLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
    </div>
  )
}

export function CoinSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[#ececed]/80 bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.04)]',
        className,
      )}
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-[15px] font-semibold tracking-tight text-[#101828]">{title}</h2>
        {description ? <p className="text-[13px] leading-relaxed text-[#667085]">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function CoinNumberField({
  label,
  hint,
  value,
  onChange,
  step = '0.01',
  min,
  max,
  suffix,
}: {
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  step?: string
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <Label className="text-[13px] font-medium text-[#344054]">{label}</Label>
        {hint ? <p className="text-[12px] text-[#98a2b3]">{hint}</p> : null}
      </div>
      <div className="relative">
        <Input
          type="number"
          step={step}
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] px-3.5 text-[13px] shadow-none transition-colors focus-visible:bg-white focus-visible:ring-[#00B4CC]/20"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[12px] font-medium text-[#98a2b3]">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function CoinToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#ececed]/80 bg-[#fafafa] px-4 py-3.5">
      <div className="space-y-0.5">
        <Label className="text-[13px] font-medium text-[#344054]">{label}</Label>
        {hint ? <p className="text-[12px] text-[#98a2b3]">{hint}</p> : null}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#00B4CC]"
      />
    </div>
  )
}

export function CoinSaveBar({
  onSave,
  isSaving,
  savingLabel,
  saveLabel,
  extra,
}: {
  onSave: () => void
  isSaving: boolean
  savingLabel: string
  saveLabel: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ececed]/80 bg-[#f9fafb] px-4 py-3">
      <Button
        type="button"
        disabled={isSaving}
        onClick={onSave}
        className="h-10 rounded-xl bg-[#00B4CC] px-5 text-[13px] font-medium hover:bg-[#00B4CC]/90"
      >
        {isSaving ? savingLabel : saveLabel}
      </Button>
      {extra}
    </div>
  )
}

export function MultiplierCard({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string
  subtitle?: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="group rounded-xl border border-[#ececed]/70 bg-gradient-to-b from-white to-[#fafafa] p-4 transition-all hover:border-[#00B4CC]/30 hover:shadow-[0_4px_12px_rgba(0,180,204,0.08)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#101828]">{title}</p>
          {subtitle ? <p className="text-[12px] text-[#98a2b3]">{subtitle}</p> : null}
        </div>
        <span className="shrink-0 rounded-full bg-[#00B4CC]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00B4CC]">
          ×
        </span>
      </div>
      <Input
        type="number"
        step="0.01"
        min={0}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 rounded-lg border-[#ececed] bg-white text-center text-[14px] font-medium tabular-nums shadow-none focus-visible:ring-[#00B4CC]/20"
      />
    </div>
  )
}
