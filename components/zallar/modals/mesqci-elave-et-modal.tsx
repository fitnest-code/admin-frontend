'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import type { Mesqci } from '@/lib/zallar-data'

interface MesqciElavEtModalProps {
  zalName: string
  onSave: (m: Omit<Mesqci, 'id'>) => void
  onClose: () => void
}

export function MesqciElavEtModal({ zalName, onSave, onClose }: MesqciElavEtModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [role, setRole]           = useState('')
  const [ixtisas, setIxtisas]     = useState('')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      firstName,
      lastName,
      role: ixtisas || role,
      phone,
      email,
      zalId: '1',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="add-mesqci-title">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="add-mesqci-title" className="text-base font-semibold text-foreground">Məşqçi əlavə et</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Bağla">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Məşqçi şəkli</span>
            <div className="flex gap-5">
              {/* Photo upload */}
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-[#00B4CC] transition-colors group">
                <Upload size={18} className="text-muted-foreground group-hover:text-[#00B4CC]" />
                <span className="text-[10px] text-muted-foreground">Yüklə</span>
              </div>

              {/* Right fields */}
              <div className="flex flex-1 flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <ModalField label="Ad" value={firstName} onChange={setFirstName} placeholder="Məşqçinin adı" required />
                  <ModalField label="Soyad" value={lastName} onChange={setLastName} placeholder="Məşqçi soyadı" required />
                </div>
                <ModalField label="Qulluqçu" value={role} onChange={setRole} placeholder="Məşqçinin rolu" />
                <ModalField label="İxtisas" value={ixtisas} onChange={setIxtisas} placeholder="Məşqçinin ixtisası" />
              </div>
            </div>
          </div>

          {/* Zal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Zal</label>
            <input
              type="text"
              value={zalName}
              readOnly
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed"
              placeholder="Fəaliyyatdəki olduğu zal"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <ModalField label="Telefon nömrəsi" value={phone} onChange={setPhone} placeholder="Əlaqə nömrəsi" type="tel" />
            <ModalField label="E-poçt" value={email} onChange={setEmail} placeholder="Mail" type="email" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors mt-1"
          >
            Yadda saxla
          </button>
        </form>
      </div>
    </div>
  )
}

function ModalField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors"
      />
    </div>
  )
}
