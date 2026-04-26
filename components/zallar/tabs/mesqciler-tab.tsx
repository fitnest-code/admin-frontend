'use client'

import { useState } from 'react'
import { Plus, ChevronRight, Users } from 'lucide-react'
import type { Mesqci } from '@/lib/zallar-data'
import { MesqciElavEtModal } from '../modals/mesqci-elave-et-modal'
import { MesqciDetallariModal } from '../modals/mesqci-detallari-modal'

interface MesqcilerTabProps {
  mesqciler: Mesqci[]
  zalName: string
}

export function MesqcilerTab({ mesqciler: initial, zalName }: MesqcilerTabProps) {
  const [mesqciler, setMesqciler] = useState<Mesqci[]>(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedMesqci, setSelectedMesqci] = useState<Mesqci | null>(null)

  function handleAdd(m: Omit<Mesqci, 'id'>) {
    setMesqciler((prev) => [
      ...prev,
      { ...m, id: `m${Date.now()}` },
    ])
    setShowAdd(false)
  }

  const isEmpty = mesqciler.length === 0

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Ax: Təlimatçı, Zal axtar...
          </span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={14} aria-hidden />
          Məşqçi əlavə et
        </button>
      </div>

      {isEmpty ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <MesqciTable
          mesqciler={mesqciler}
          onSelect={setSelectedMesqci}
        />
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Yadda saxla
        </button>
      </div>

      {showAdd && (
        <MesqciElavEtModal
          zalName={zalName}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {selectedMesqci && (
        <MesqciDetallariModal
          mesqci={selectedMesqci}
          onClose={() => setSelectedMesqci(null)}
          onSave={(updated) => {
            setMesqciler((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            )
            setSelectedMesqci(null)
          }}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-secondary/40 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
        <Users size={22} className="text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-foreground">Hələ məşqçi yoxdur</p>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
          Bu zala hələ heç bir məşqçi əlavə edilməyib. İlk məşqçini əlavə edin.
        </p>
      </div>
    </div>
  )
}

function MesqciTable({
  mesqciler,
  onSelect,
}: {
  mesqciler: Mesqci[]
  onSelect: (m: Mesqci) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2rem] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3">
        <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
        <span className="text-xs font-semibold text-foreground">Telefon</span>
        <span className="text-xs font-semibold text-foreground">E-poçt</span>
        <span className="text-xs font-semibold text-foreground">Zal</span>
        <span />
      </div>
      {mesqciler.map((m) => (
        <div
          key={m.id}
          className="grid grid-cols-[2fr_1fr_1fr_1fr_2rem] items-center gap-4 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer"
          onClick={() => onSelect(m)}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B4CC26] text-xs font-bold text-[#00B4CC]">
              {m.firstName[0]}{m.lastName[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground truncate">
                {m.firstName} {m.lastName}
              </span>
              <span className="text-xs text-muted-foreground">{m.role}</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground truncate">{m.phone}</span>
          <span className="text-sm text-muted-foreground truncate">{m.email}</span>
          <span className="text-sm text-muted-foreground truncate">{m.zalId === '1' ? 'Fit Clup' : 'Zal'}</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      ))}
    </div>
  )
}
