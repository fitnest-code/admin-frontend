'use client'

import { useState } from 'react'
import { Plus, ChevronRight, Users, Search } from 'lucide-react'
import type { Trainer } from '@/lib/gyms-data'
import { useGymTrainersQuery } from '@/modules/gyms'
import { AddTrainerModal } from '../modals/add-trainer-modal'
import { TrainerDetailsModal } from '../modals/trainer-details-modal'

interface TrainersTabProps {
  gymId: string
  trainers: Trainer[]
  gymName: string
  isNew?: boolean
}

export function TrainersTab({ gymId, trainers: initial, gymName, isNew = false }: TrainersTabProps) {
  const trainersQuery = useGymTrainersQuery(gymId)
  const [trainers, setTrainers] = useState<Trainer[]>(initial)
  const [showAdd, setShowAdd]   = useState(false)
  const [selected, setSelected] = useState<Trainer | null>(null)
  const [query, setQuery]       = useState('')

  function handleAdd(t: Omit<Trainer, 'id'>) {
    setTrainers((prev) => [...prev, { ...t, id: `t${Date.now()}` }])
    setShowAdd(false)
  }

  function handleUpdate(updated: Trainer) {
    setTrainers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelected(null)
  }

  const source = trainersQuery.data?.items ?? trainers

  const filtered = source.filter((t) => {
    const q = query.toLowerCase()
    return (
      !q ||
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-50 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ax: Təlimatçı, Zal axtar..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={14} aria-hidden />
          Məşqçi əlavə et
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          onAdd={() => setShowAdd(true)}
          hasQuery={!!query}
          isLoading={trainersQuery.isLoading}
          hasError={trainersQuery.isError}
        />
      ) : (
        <TrainerTable trainers={filtered} onSelect={setSelected} gymName={gymName} showGym={!isNew} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Yadda saxla
        </button>
      </div>

      {showAdd && (
        <AddTrainerModal gymName={gymName} showGym={!isNew} onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {selected && (
        <TrainerDetailsModal
          trainer={selected}
          gymName={gymName}
          showGym={!isNew}
          onClose={() => setSelected(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  )
}

function EmptyState({
  onAdd,
  hasQuery,
  isLoading,
  hasError,
}: {
  onAdd: () => void
  hasQuery: boolean
  isLoading: boolean
  hasError: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/30 py-16 text-sm text-muted-foreground">
        Məşqçilər yüklənir...
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary/30 py-16 text-sm text-red-500">
        Məşqçilər yüklənmədi.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-secondary/30 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
        <Users size={22} className="text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-foreground">
          {hasQuery ? 'Nəticə tapılmadı' : 'Hələ məşqçi yoxdur'}
        </p>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          {hasQuery
            ? 'Başqa açar söz sınayın.'
            : 'Bu zala hələ heç bir məşqçi əlavə edilməyib.'}
        </p>
      </div>
      {!hasQuery && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={14} />
          Məşqçi əlavə et
        </button>
      )}
    </div>
  )
}

function TrainerTable({
  trainers,
  onSelect,
  gymName,
  showGym,
}: {
  trainers: Trainer[]
  onSelect: (t: Trainer) => void
  gymName: string
  showGym: boolean
}) {
  const cols = showGym
    ? 'grid-cols-[2fr_1fr_1fr_1fr_2rem]'
    : 'grid-cols-[2fr_1fr_1fr_2rem]'

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className={`grid ${cols} items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3`}>
        <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
        <span className="text-xs font-semibold text-foreground">Telefon</span>
        <span className="text-xs font-semibold text-foreground">E-poçt</span>
        {showGym && <span className="text-xs font-semibold text-foreground">Zal</span>}
        <span />
      </div>
      {trainers.map((t) => (
        <div
          key={t.id}
          className={`grid ${cols} items-center gap-4 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer`}
          onClick={() => onSelect(t)}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B4CC26] text-xs font-bold text-[#00B4CC]">
              {t.firstName[0]}{t.lastName[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {t.firstName} {t.lastName}
              </span>
              <span className="text-xs text-muted-foreground truncate">{t.role}</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground truncate">{t.phone}</span>
          <span className="text-sm text-muted-foreground truncate">{t.email}</span>
          {showGym && <span className="text-sm text-muted-foreground truncate">{gymName}</span>}
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      ))}
    </div>
  )
}
