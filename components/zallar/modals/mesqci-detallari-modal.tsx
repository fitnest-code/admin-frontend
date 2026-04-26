'use client'

import { useState } from 'react'
import { X, Pencil, Upload } from 'lucide-react'
import type { Mesqci } from '@/lib/zallar-data'

interface MesqciDetallariModalProps {
  mesqci: Mesqci
  onClose: () => void
  onSave: (m: Mesqci) => void
}

export function MesqciDetallariModal({ mesqci, onClose, onSave }: MesqciDetallariModalProps) {
  const [data, setData] = useState<Mesqci>(mesqci)

  function update(field: keyof Mesqci, val: string) {
    setData((prev) => ({ ...prev, [field]: val }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="mesqci-details-title">
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="mesqci-details-title" className="text-base font-semibold text-foreground">Məşqçi detalları</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Bağla">
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="flex gap-5">
            {/* Photo */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border">
              {data.photo ? (
                <img src={data.photo} alt={`${data.firstName} şəkli`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 cursor-pointer group">
                  <Upload size={16} className="text-muted-foreground group-hover:text-[#00B4CC]" />
                  <span className="text-[10px] text-muted-foreground">Şəkil yüklə</span>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <ReadField label="Ad" value={data.firstName} />
                <ReadField label="Soyad" value={data.lastName} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ReadField label="Qulluqçu" value="" placeholder="Rolu" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">İxtisas</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <span className="flex-1 text-sm text-foreground">{data.role}</span>
                    <button onClick={() => { const v = prompt('İxtisas:', data.role) ?? data.role; update('role', v) }}>
                      <Pencil size={12} className="text-muted-foreground hover:text-[#00B4CC]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zal */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Zal</span>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="flex-1 text-sm text-foreground">Fit Clup</span>
              <Pencil size={12} className="text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Telefon nömrəsi</span>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="flex-1 text-sm text-foreground truncate">{data.phone}</span>
                <Pencil size={12} className="text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">E-poçt</span>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="flex-1 text-sm text-foreground truncate">{data.email}</span>
                <Pencil size={12} className="text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(data)}
            className="w-full rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  )
}

function ReadField({ label, value, placeholder }: { label: string; value: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    </div>
  )
}
