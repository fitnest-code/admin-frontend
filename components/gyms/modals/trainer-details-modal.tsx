'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useRef } from 'react'
import type { Trainer } from '@/lib/gyms-data'

interface TrainerDetailsModalProps {
  trainer: Trainer
  gymName: string
  showGym?: boolean
  onClose: () => void
  onSave: (updated: Trainer) => void
}

export function TrainerDetailsModal({ trainer, gymName, showGym = true, onClose, onSave }: TrainerDetailsModalProps) {
  const [data, setData] = useState(trainer)
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: keyof Trainer, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setData((prev) => ({ ...prev, photo: URL.createObjectURL(file) }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Məşqçi detalları</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Photo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Məşqçi şəkli</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary hover:border-[#00B4CC] transition-colors"
              >
                {data.photo ? (
                  <img src={data.photo} alt={`${data.firstName} ${data.lastName}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[#00B4CC]">
                    {data.firstName[0]}{data.lastName[0]}
                  </span>
                )}
              </button>
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <InlineField label="Ad"    value={data.firstName} onChange={(v) => set('firstName', v)} />
                <InlineField label="Soyad" value={data.lastName}  onChange={(v) => set('lastName', v)} />
              </div>
              <InlineField label="Vəzifə" value={data.role} onChange={(v) => set('role', v)} />
            </div>
          </div>

          {/* Zal + Contact */}
          <div className="flex flex-col gap-3">
            {showGym && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Zal</span>
                <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-muted-foreground">
                  {gymName}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <InlineField label="Telefon nömrəsi" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+994 00 000 00 00" />
              <InlineField label="E-Poçt"          value={data.email} onChange={(v) => set('email', v)} placeholder="mail@example.com" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center border-t border-border px-5 py-4">
          <button
            onClick={() => onSave(data)}
            className="rounded-lg bg-[#00B4CC] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  )
}

function InlineField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors"
      />
    </div>
  )
}
