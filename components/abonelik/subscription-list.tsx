'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SubPackage, type PriceTier, type SubStatus,
  MOCK_SUB_PACKAGES, ENTRY_LIMIT_OPTIONS,
} from '@/lib/subscription-data'

const PAGE_SIZE = 6

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ total, page, perPage, onChange }: {
  total: number; page: number; perPage: number; onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {p}
          </button>
        ),
      )}
    </div>
  )
}

// ── Entry limit select ────────────────────────────────────────────────────────
function EntryLimitSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground">Giriş sayı (Limit)</label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none hover:border-[#00B4CC] transition-colors"
        >
          <span>{value || '-'}</span>
          <ChevronDown size={14} className={cn('transition-transform text-muted-foreground', open && 'rotate-180')} />
        </button>
        {open && (
          <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden overflow-y-auto rounded-xl border border-border bg-card shadow-xl max-h-52">
            {ENTRY_LIMIT_OPTIONS.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => { onChange(o); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors',
                    value === o && 'text-[#00B4CC] font-medium',
                  )}
                >
                  <Check size={13} className={cn('shrink-0', value === o ? 'opacity-100 text-[#00B4CC]' : 'opacity-0')} />
                  {o}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Package Form ──────────────────────────────────────────────────────────────
function PackageForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SubPackage
  onSave: (pkg: Omit<SubPackage, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    initial?.priceTiers?.length ? initial.priceTiers : [{ duration: '', price: 0, discountPrice: 0 }],
  )
  const [entryLimit, setEntryLimit] = useState(
    initial?.entryLimit ? `${initial.entryLimit} giriş` : '12 giriş',
  )
  const [services, setServices] = useState<string[]>(initial?.services ?? [])
  const [serviceInput, setServiceInput] = useState('')
  const [status, setStatus] = useState<SubStatus>(initial?.status ?? 'active')

  function addTier() {
    setPriceTiers((prev) => [...prev, { duration: '', price: 0, discountPrice: 0 }])
  }

  function removeTier(i: number) {
    setPriceTiers((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateTier<K extends keyof PriceTier>(i: number, key: K, value: PriceTier[K]) {
    setPriceTiers((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: value } : t))
  }

  function addService() {
    const s = serviceInput.trim()
    if (!s || services.length >= 20) return
    setServices((prev) => [...prev, s])
    setServiceInput('')
  }

  function removeService(i: number) {
    setServices((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    const entryLimitNum = parseInt(entryLimit) || 0
    onSave({ name, priceTiers, entryLimit: entryLimitNum, services, status })
  }

  return (
    <div className="rounded-xl border border-[#00B4CC] bg-card p-5 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Yeni abunəlik formu</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Adı */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Paket adı"
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
            />
          </div>

          {/* Müddət və qiymətlər */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Müddət və qiymətlər</label>
              <button
                type="button"
                onClick={addTier}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-[#00B4CC] text-[#00B4CC] hover:bg-[#00B4CC] hover:text-white transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>

            {priceTiers.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-[1fr_1fr_1fr_1.5rem] gap-2">
                  <span className="text-xs text-muted-foreground">Müddət (Ay)</span>
                  <span className="text-xs text-muted-foreground">Qiymət (Azn)</span>
                  <span className="text-xs text-muted-foreground">Qiymət (Endirimli)</span>
                  <span />
                </div>
                {priceTiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1.5rem] gap-2 items-center">
                    <input
                      value={tier.duration}
                      onChange={(e) => updateTier(i, 'duration', e.target.value)}
                      placeholder="1 ay"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#00B4CC] transition-colors"
                    />
                    <input
                      type="number"
                      value={tier.price || ''}
                      onChange={(e) => updateTier(i, 'price', Number(e.target.value))}
                      placeholder="0"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#00B4CC] transition-colors"
                    />
                    <input
                      type="number"
                      value={tier.discountPrice || ''}
                      onChange={(e) => updateTier(i, 'discountPrice', Number(e.target.value))}
                      placeholder="0"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[#00B4CC] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      disabled={priceTiers.length === 1}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md transition-colors disabled:opacity-30',
                        i === priceTiers.length - 1
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Giriş sayı */}
          <EntryLimitSelect value={entryLimit} onChange={setEntryLimit} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Xidmətlər */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Xidmətlər (1-20)</label>
            <div className="flex gap-2">
              <input
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                placeholder="Xidmət adı"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
              />
              <button
                type="button"
                onClick={addService}
                disabled={!serviceInput.trim() || services.length >= 20}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#00B4CC] text-[#00B4CC] hover:bg-[#00B4CC] hover:text-white disabled:opacity-40 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="min-h-25 rounded-lg border border-border bg-background">
              {services.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                  Heç bir xidmət əlavə edilməyib
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-foreground">{s}</span>
                      <button
                        onClick={() => removeService(i)}
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                          i === services.length - 1
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground">{services.length}/20 xidmət</div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Status</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
                  status === 'active'
                    ? 'bg-[#00B4CC] text-white'
                    : 'border border-border text-foreground hover:bg-secondary',
                )}
              >
                Aktiv et
              </button>
              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
                  status === 'inactive'
                    ? 'bg-foreground text-background'
                    : 'border border-border text-foreground hover:bg-secondary',
                )}
              >
                Deaktiv et
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Ləğv et
        </button>
        <button
          onClick={handleSave}
          className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          Yadda saxla
        </button>
      </div>
    </div>
  )
}

// ── Package Card ───────────────────────────────────────────────────────────────
function PackageCard({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: SubPackage
  onEdit: (p: SubPackage) => void
  onDelete: (id: string) => void
}) {
  const firstTier = pkg.priceTiers[0]
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground">{pkg.name}</span>
        <span className={cn(
          'rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1',
          pkg.status === 'active' ? 'bg-green-600 text-white' : 'bg-[#6B7280] text-white',
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
          {pkg.status === 'active' ? 'Aktiv' : 'Deaktiv'}
        </span>
      </div>

      {/* Price tiers */}
      <div className="flex flex-col gap-1">
        {pkg.priceTiers.map((tier, i) => (
          <div key={i} className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground shrink-0">{tier.duration}</span>
            <div className="flex items-baseline gap-1.5">
              {tier.discountPrice > 0 && tier.discountPrice !== tier.price && (
                <span className="text-xs text-muted-foreground line-through">{tier.price}</span>
              )}
              <span className="text-lg font-bold text-foreground">{tier.discountPrice || tier.price}</span>
              <span className="text-xs text-muted-foreground">AZN</span>
            </div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 text-sm border-t border-border pt-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Limit:</span>
          <span className="font-medium text-foreground">{pkg.entryLimit} giriş</span>
        </div>
        {firstTier && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Başlanğıc müddət:</span>
            <span className="font-medium text-foreground">{firstTier.duration}</span>
          </div>
        )}
      </div>

      {/* Services */}
      {pkg.services.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Xidmətlər</span>
          <div className="flex flex-wrap gap-1.5">
            {pkg.services.map((s) => (
              <span key={s} className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(pkg)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#00B4CC] py-2 text-sm font-medium text-[#00B4CC] hover:bg-[#00B4CC0D] transition-colors"
        >
          <Pencil size={14} /> Dəyiş
        </button>
        <button
          onClick={() => onDelete(pkg.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} /> Sil
        </button>
      </div>
    </div>
  )
}

// ── Delete confirm modal ───────────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-center text-sm font-medium text-foreground">
          Bu paketi silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Ləğv et</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors">Sil</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SubscriptionList() {
  const [packages, setPackages] = useState<SubPackage[]>(MOCK_SUB_PACKAGES)
  const [showForm, setShowForm] = useState(false)
  const [editingPkg, setEditingPkg] = useState<SubPackage | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const paginated = packages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSave(data: Omit<SubPackage, 'id'>) {
    if (editingPkg) {
      setPackages((prev) => prev.map((p) => p.id === editingPkg.id ? { ...editingPkg, ...data } : p))
    } else {
      setPackages((prev) => [...prev, { id: `sub-${Date.now()}`, ...data }])
    }
    setShowForm(false)
    setEditingPkg(null)
  }

  function handleEdit(pkg: SubPackage) {
    setEditingPkg(pkg)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function confirmDelete() {
    if (!deletingId) return
    setPackages((prev) => prev.filter((p) => p.id !== deletingId))
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Abunəlik Paketləri</h1>
        {!showForm && (
          <button
            onClick={() => { setEditingPkg(null); setShowForm(true) }}
            className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            <Plus size={15} /> Yeni Paket
          </button>
        )}
      </div>

      {showForm && (
        <PackageForm
          initial={editingPkg ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPkg(null) }}
        />
      )}

      {packages.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Hələ paket əlavə edilməyib
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      <Pagination total={packages.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {deletingId && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />
      )}
    </div>
  )
}
