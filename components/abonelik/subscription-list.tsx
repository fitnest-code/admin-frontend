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
  return (
    <div className="w-full relative rounded-[12px] bg-white border border-[#00b4cc] flex flex-col items-start p-5 gap-[34px] text-center font-sans text-black shadow-sm transition-all hover:shadow-md">
      {/* Header Wrapper */}
      <div className="w-full flex flex-col items-end">
        <div className="w-full flex items-center justify-between gap-5">
          <b className="text-[18px] font-bold text-black leading-[28px]">{pkg.name}</b>
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-[26px] rounded-[20px] flex items-center justify-center px-3 py-1 gap-1 text-[12px] font-medium text-white transition-colors",
              pkg.status === 'active' ? "bg-[#166728]" : "bg-gray-500"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <span className="leading-[18px] font-medium">{pkg.status === 'active' ? 'Aktiv' : 'Deaktiv'}</span>
            </div>
            
            {/* Visual native CSS switch matching the design asset knobs */}
            <div className={cn(
              "w-[51px] h-[31px] rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 flex items-center",
              pkg.status === 'active' ? "bg-[#00b4cc]" : "bg-gray-300"
            )}>
              <div className={cn(
                "w-[23px] h-[23px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                pkg.status === 'active' ? "translate-x-[20px]" : "translate-x-0"
              )} />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section / Pricing & Entry Limit */}
      <div className="w-full flex flex-col items-start gap-[22px] text-left text-[#4a5565]">
        <div className="w-full flex flex-col items-start gap-3">
          {pkg.priceTiers.map((tier, i) => (
            <div key={i} className="w-full flex flex-col gap-3">
              <div className="w-full flex items-center justify-between gap-5">
                <span className="text-[16px] leading-[24px] text-[#4a5565]">{tier.duration || 'Müddət'}</span>
                <div className="flex items-baseline gap-1.5">
                  {tier.discountPrice > 0 && tier.discountPrice !== tier.price ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[16px] leading-[24px] font-medium text-red-500 line-through decoration-red-500 decoration-2">
                        {tier.price} AZN
                      </span>
                      <span className="text-[16px] leading-[24px] font-bold text-[#101828]">
                        / {tier.discountPrice} AZN
                      </span>
                    </div>
                  ) : (
                    <span className="text-[16px] leading-[24px] font-medium text-[#101828]">
                      {tier.price} AZN
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full h-[1px] border-t border-[#ececed] transform rotate-[0.3deg]" />
            </div>
          ))}

          <div className="w-full flex items-center justify-between gap-5 pt-1">
            <span className="text-[16px] leading-[24px] text-[#4a5565]">Limit:</span>
            <span className="text-[16px] leading-[24px] font-medium text-[#101828]">{pkg.entryLimit} giriş</span>
          </div>
          <div className="w-full h-[1px] border-t border-[#ececed] transform rotate-[0.3deg]" />
        </div>

        {/* Services List Block */}
        <div className="w-full flex flex-col items-start gap-[11px] pt-1">
          <span className="text-[12px] font-bold tracking-wider text-[#4a5565] uppercase">XİDMƏTLƏR</span>
          <div className="w-full flex flex-wrap items-center gap-2">
            {pkg.services.length > 0 ? (
              pkg.services.map((s) => (
                <div key={s} className="rounded-[20px] bg-white border border-[#ececed] flex items-center justify-center px-3 py-1 gap-1.5 text-[14px] text-black font-medium shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00b4cc] shrink-0" />
                  <span className="leading-[20px] font-medium">{s}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">Xidmət təyin edilməyib</span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons Block */}
      <div className="w-full flex items-center gap-3 pt-1">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 h-[41px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 gap-2 hover:bg-[#00b4cc]/5 transition-colors"
        >
          <Pencil size={15} className="text-[#00b4cc] shrink-0" />
          <span className="text-[15px] font-medium text-black leading-[24px]">Dəyiş</span>
        </button>
        
        <button
          onClick={() => onDelete(pkg.id)}
          className="flex-1 h-[41px] rounded-[10px] bg-white border border-[#f10303] flex items-center justify-center px-4 gap-2 hover:bg-[#f10303]/5 transition-colors"
        >
          <Trash2 size={15} className="text-[#f10303] shrink-0" />
          <span className="text-[15px] font-medium text-black leading-[24px]">Sil</span>
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
