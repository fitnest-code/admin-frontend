'use client'

import { useState, useRef } from 'react'
import { X, Upload } from 'lucide-react'
import type { Trainer } from '@/lib/gyms-data'

interface AddTrainerModalProps {
  gymName: string
  showGym?: boolean
  onSave: (t: Omit<Trainer, 'id'>) => void
  onClose: () => void
}

export function AddTrainerModal({ gymName, showGym = true, onSave, onClose }: AddTrainerModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [role, setRole]           = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [photo, setPhoto]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ firstName, lastName, role, phone, email, gymId: '1', photo: photo ?? undefined })
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
          <h2 className="text-sm font-semibold text-foreground">Məşqçi əlavə et</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Photo upload */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Məşqçi şəkli</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary hover:border-[#00B4CC] transition-colors group"
              >
                {photo ? (
                  <img src={photo} alt="Məşqçi" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <>
                    <Upload size={18} className="text-muted-foreground group-hover:text-[#00B4CC]" />
                    <span className="text-[10px] text-muted-foreground">Yüklə</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-muted-foreground">JPG or PNG • max 5MB</span>
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ad"     value={firstName} onChange={setFirstName} placeholder="Məşqçinin adı" />
                <Field label="Soyad"  value={lastName}  onChange={setLastName}  placeholder="Məşqçi soyadı" />
              </div>
              <Field label="Vəzifə" value={role} onChange={setRole} placeholder="Məşqçinin vəzifəsi" />
              {showGym && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Zal</label>
                  <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                    {gymName}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefon nömrəsi" value={phone} onChange={setPhone} placeholder="Əlaqə nömrəsi" />
                <Field label="E-Poçt"          value={email} onChange={setEmail} placeholder="Mail" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center border-t border-border pt-4">
            <button
              type="submit"
              className="rounded-lg bg-[#00B4CC] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
            >
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
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
