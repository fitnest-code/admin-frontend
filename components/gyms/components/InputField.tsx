'use client'

import { cn } from '@/lib/utils'

interface InputFieldProps {
  label: string
  type?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function InputField({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <label className="text-sm  text-black">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-[12px] border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors',
        )}
      />
    </div>
  )
}