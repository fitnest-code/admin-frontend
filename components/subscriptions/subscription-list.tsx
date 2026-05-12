'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, Check, LayoutGrid, List, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SubPackage, type PriceTier, type SubStatus,
  MOCK_SUB_PACKAGES, ENTRY_LIMIT_OPTIONS,
} from '@/lib/subscription-data'
import { useSubscriptions } from '@/lib/query/use-subscriptions'

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
function EntryLimitSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs text-muted-foreground">{label}</label>}
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

function PackageNameDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const STATIC_PACKAGES = ['Bronze', 'Silver', 'Gold', 'Platinum']

  return (
    <div className="w-full flex flex-col gap-1.5 text-left font-sans" ref={ref}>
      <label className="text-[16px] leading-[24px] font-medium text-black">Adı</label>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full h-[60px] rounded-[12px] bg-[#fafafa] border border-[#ececed] px-4 flex items-center justify-between text-[18px] text-black outline-none transition-colors hover:border-[#00b4cc]"
        >
          <span className="leading-[28px] font-medium">{value || 'Seçilməyib'}</span>
          <ChevronDown size={20} className={cn('transition-transform text-gray-500 shrink-0', open && 'rotate-180')} />
        </button>
        
        {open && (
          <ul className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-[12px] border border-[#ececed] bg-white shadow-xl max-h-52 divide-y divide-gray-100">
            {STATIC_PACKAGES.map((pkgName) => (
              <li key={pkgName}>
                <button
                  type="button"
                  onClick={() => { onChange(pkgName); setOpen(false) }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-[16px] font-medium transition-colors hover:bg-gray-50 text-left",
                    value === pkgName ? "text-[#00b4cc] bg-[#00b4cc]/5 font-bold" : "text-black"
                  )}
                >
                  <span>{pkgName}</span>
                  {value === pkgName && <Check size={16} className="text-[#00b4cc]" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Package Form Modal ────────────────────────────────────────────────────────
function PackageFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: SubPackage
  onSave: (pkg: Omit<SubPackage, 'id'>) => void
  onClose: () => void
}) {
  const { addBenefit, deleteBenefit } = useSubscriptions()
  const [name, setName] = useState(initial?.name || 'Bronze')
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(
    initial?.priceTiers?.length ? initial.priceTiers : [{ duration: '1 ay', price: 50, discountPrice: 45 }],
  )
  const [entryLimit, setEntryLimit] = useState(
    initial?.entryLimit ? `${initial.entryLimit} giriş` : '12 giriş',
  )
  const [services, setServices] = useState<string[]>(initial?.services ?? [])
  const [serviceInput, setServiceInput] = useState('')
  const [status, setStatus] = useState<SubStatus>(initial?.status ?? 'active')

  function addTier() {
    setPriceTiers((prev) => [...prev, { duration: `${prev.length + 1} ay`, price: 0, discountPrice: 0 }])
  }

  function removeTier(i: number) {
    setPriceTiers((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateTier<K extends keyof PriceTier>(i: number, key: K, value: PriceTier[K]) {
    setPriceTiers((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: value } : t))
  }

  async function handleAddService() {
    const s = serviceInput.trim()
    if (!s || services.length >= 20) return
    
    // Optimistic UI updates along with actual API requests if modifying an existing package
    setServices((prev) => [...prev, s])
    setServiceInput('')
    
    if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
      try {
        await addBenefit({ packageId: initial.id, description: s })
      } catch (err) {
        console.warn('Live service integration sync error', err)
      }
    }
  }

  async function handleRemoveService(i: number) {
    const targetService = services[i]
    setServices((prev) => prev.filter((_, idx) => idx !== i))
    
    if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
      try {
        await deleteBenefit({ packageId: initial.id, description: targetService })
      } catch (err) {
        console.warn('Live service deletion sync error', err)
      }
    }
  }

  function handleSave() {
    const entryLimitNum = parseInt(entryLimit) || 12
    onSave({ name, priceTiers, entryLimit: entryLimitNum, services, status })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 font-sans"
      onClick={onClose}
    >
      {/* Root Layout matching Frame2237 (.frameParent) */}
      <div
        className="w-full max-w-5xl relative rounded-[20px] bg-white border border-[#00b4cc] flex flex-col items-start p-8 gap-8 text-left text-[20px] text-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Title Bar Wrapper (.yeniAbunlikFormuParent) */}
        <div className="w-full flex items-center justify-between">
          <div className="relative leading-[30px] font-semibold text-[20px]">
            {initial ? 'Paketi redaktə et' : 'Yeni abunəlik formu'}
          </div>
          <button
            onClick={onClose}
            className="h-[28px] w-[28px] rounded-[4px] bg-[#ececed] flex items-center justify-center p-1 transition-colors hover:bg-gray-300"
            aria-label="Bağla"
          >
            <X size={15} className="text-black" />
          </button>
        </div>

        {/* Dividing Line (.frameChild) */}
        <div className="w-full h-[1px] border-t border-[#cecfd2]" />

        {/* Content Body Grid (.frameGroup) */}
        <div className="w-full flex flex-col md:flex-row items-start gap-6 text-[16px]">
          
          {/* Left Column (.frameContainer) */}
          <div className="flex-1 flex flex-col items-start gap-4 w-full">
            
            {/* Package Selector Dropdown Container */}
            <div className="w-full">
              <PackageNameDropdown value={name} onChange={setName} />
            </div>

            {/* Pricing / Tiers Wrapper */}
            <div className="w-full flex flex-col gap-3 pt-2">
              <div className="w-full rounded-[12px] bg-[#fafafa] border border-[#ececed] flex items-center justify-between p-2 px-3">
                <span className="text-[18px] leading-[28px] font-medium text-black">
                  Müddət və qiymətlər
                </span>
                <button
                  type="button"
                  onClick={addTier}
                  className="h-[40px] w-[40px] rounded-[8px] bg-white border border-[#ececed] flex items-center justify-center transition-colors hover:bg-gray-100 shadow-2xs"
                >
                  <Plus size={18} className="text-[#00b4cc]" />
                </button>
              </div>

              {priceTiers.length > 0 && (
                <div className="w-full flex flex-col gap-2">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_2.5rem] gap-2 px-1">
                    <span className="text-[13px] text-gray-500 font-medium">Müddət</span>
                    <span className="text-[13px] text-gray-500 font-medium">Qiymət</span>
                    <span className="text-[13px] text-gray-500 font-medium">Endirimli</span>
                    <span />
                  </div>
                  {priceTiers.map((tier, i) => (
                    <div key={i} className="grid grid-cols-[1.2fr_1fr_1fr_2.5rem] gap-2 items-center">
                      <input
                        value={tier.duration}
                        onChange={(e) => updateTier(i, 'duration', e.target.value)}
                        placeholder="1 ay"
                        className="h-[44px] rounded-[10px] border border-gray-300 bg-white px-3 text-[15px] outline-none focus:border-[#00b4cc]"
                      />
                      <input
                        type="number"
                        value={tier.price || ''}
                        onChange={(e) => updateTier(i, 'price', Number(e.target.value))}
                        placeholder="0"
                        className="h-[44px] rounded-[10px] border border-gray-300 bg-white px-3 text-[15px] outline-none focus:border-[#00b4cc]"
                      />
                      <input
                        type="number"
                        value={tier.discountPrice || ''}
                        onChange={(e) => updateTier(i, 'discountPrice', Number(e.target.value))}
                        placeholder="0"
                        className="h-[44px] rounded-[10px] border border-gray-300 bg-white px-3 text-[15px] outline-none focus:border-[#00b4cc]"
                      />
                      <button
                        type="button"
                        onClick={() => removeTier(i)}
                        disabled={priceTiers.length === 1}
                        className="h-[36px] w-[36px] rounded-[8px] flex items-center justify-center transition-colors hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-20"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Entry Limit Select block */}
            <div className="w-full pt-1">
              <EntryLimitSelect label="Giriş sayı (Limit)" value={entryLimit} onChange={setEntryLimit} />
            </div>
          </div>

          {/* Right Column (.frameParent2) */}
          <div className="flex-1 flex flex-col items-stretch justify-between gap-6 w-full h-full">
            
            {/* Services Wrapper (.frameParent3) */}
            <div className="w-full flex flex-col items-stretch gap-3">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[16px] leading-[24px] font-medium text-black">Xidmətlər (1-20)</label>
                <div className="w-full flex items-center gap-2">
                  <input
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder="Xidmət adı"
                    className="flex-1 h-[50px] rounded-[12px] bg-[#fafafa] border border-[#ececed] px-3 text-[16px] outline-none focus:border-[#00b4cc]"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    disabled={!serviceInput.trim() || services.length >= 20}
                    className="h-[50px] w-[50px] rounded-[8px] bg-[#fafafa] border border-[#ececed] flex items-center justify-center transition-colors hover:bg-gray-200 disabled:opacity-40 shrink-0"
                  >
                    <Plus size={18} className="text-[#00b4cc]" />
                  </button>
                </div>
              </div>

              {/* Added Services Box (.frameParent6) */}
              <div className="w-full h-[238px] rounded-[16px] bg-[#fafafa] p-3 flex flex-col gap-2.5 overflow-y-auto border border-gray-100">
                {services.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-[15px] text-gray-400 italic">
                    Heç bir xidmət əlavə edilməyib
                  </div>
                ) : (
                  services.map((srv, idx) => (
                    <div key={idx} className="w-full min-h-[50px] rounded-[12px] bg-white border border-[#ececed] px-3 flex items-center justify-between shadow-2xs shrink-0">
                      <span className="text-[16px] font-medium text-black">{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="h-[28px] w-[28px] rounded-[4px] bg-[#e7272c] flex items-center justify-center transition-colors hover:bg-red-700"
                        aria-label="Sil"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="w-full text-right text-[16px] text-gray-500 font-medium">
                {services.length}/20 xidmət
              </div>
            </div>

            {/* Status Segment Controls (.statusParent) */}
            <div className="w-full flex flex-col items-start gap-2 pt-1">
              <label className="text-[16px] leading-[24px] font-medium text-black">Status</label>
              <div className="w-full flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('active')}
                  className={cn(
                    "h-[48px] flex-1 rounded-[10px] flex items-center justify-center text-[16px] font-medium transition-all",
                    status === 'active'
                      ? "bg-[#00b4cc] text-white shadow-sm"
                      : "bg-white border border-[#00b4cc] text-black hover:bg-gray-50"
                  )}
                >
                  Aktiv et
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('inactive')}
                  className={cn(
                    "h-[48px] flex-1 rounded-[10px] flex items-center justify-center text-[16px] font-medium transition-all",
                    status === 'inactive'
                      ? "bg-black text-white shadow-sm"
                      : "bg-white border border-gray-300 text-black hover:bg-gray-50"
                  )}
                >
                  Deaktiv et
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar / Footer */}
        <div className="w-full flex justify-end gap-3 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="h-[46px] rounded-[10px] border border-gray-300 px-6 text-[16px] font-medium text-black hover:bg-gray-50 transition-colors"
          >
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            className="h-[46px] rounded-[10px] bg-[#00b4cc] px-8 text-[16px] font-semibold text-white hover:bg-[#009bb0] transition-colors shadow-sm"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Package Row (list view) ───────────────────────────────────────────────────
function PackageRow({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: SubPackage
  onEdit: (p: SubPackage) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const firstTier = pkg.priceTiers[0]

  return (
    <tr className="border-b border-border hover:bg-secondary/40 transition-colors">
      <td className="px-4 py-3 text-sm font-semibold text-foreground">{pkg.name}</td>
      <td className="px-4 py-3">
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
          pkg.status === 'active' ? 'bg-green-600 text-white' : 'bg-[#6B7280] text-white',
        )}>
          <span className="h-1.5 w-1.5 rounded-full bg-white/80 shrink-0" />
          {pkg.status === 'active' ? 'Aktiv' : 'Deaktiv'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">
        {pkg.priceTiers.map((t, i) => (
          <div key={i} className="flex items-baseline gap-1">
            <span className="font-semibold">{t.discountPrice || t.price}</span>
            <span className="text-muted-foreground text-xs">AZN</span>
            <span className="text-muted-foreground text-xs">/ {t.duration}</span>
          </div>
        ))}
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{pkg.entryLimit} giriş</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {pkg.services.slice(0, 2).map((s) => (
            <span key={s} className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground">{s}</span>
          ))}
          {pkg.services.length > 2 && (
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
              +{pkg.services.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="relative flex justify-end" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <button
                onClick={() => { onEdit(pkg); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Pencil size={13} className="text-[#00B4CC]" /> Dəyiş
              </button>
              <button
                onClick={() => { onDelete(pkg.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Sil
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
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
  const { packages: backendPackages, isLoading, createPackage, updatePackage, deletePackage } = useSubscriptions()
  const [localPackages, setLocalPackages] = useState<SubPackage[]>(MOCK_SUB_PACKAGES)
  const [modalPkg, setModalPkg] = useState<SubPackage | 'new' | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const currentPackages = backendPackages?.length > 0 ? backendPackages : localPackages
  const paginated = currentPackages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleSave(data: Omit<SubPackage, 'id'>) {
    if (modalPkg && modalPkg !== 'new') {
      const targetId = (modalPkg as SubPackage).id
      setLocalPackages((prev) => prev.map((p) => p.id === targetId ? { ...(modalPkg as SubPackage), ...data } : p))
      setModalPkg(null)
      
      if (!targetId.startsWith('temp') && !targetId.startsWith('sub-')) {
        try {
          await updatePackage({
            id: targetId,
            name: data.name,
            status: data.status,
            entryLimit: data.entryLimit,
            services: data.services,
            priceTiers: data.priceTiers,
          })
        } catch (err) {
          console.warn('Backend subscription update sync error', err)
        }
      }
    } else {
      const tempId = `sub-${Date.now()}`
      setLocalPackages((prev) => [...prev, { id: tempId, ...data }])
      setModalPkg(null)
      
      try {
        await createPackage({
          name: data.name,
          status: data.status,
          entryLimit: data.entryLimit,
          services: data.services,
          priceTiers: data.priceTiers,
        })
      } catch (err) {
        console.warn('Backend subscription creation sync error', err)
      }
    }
  }

  async function confirmDelete() {
    if (!deletingId) return
    const targetId = deletingId
    setLocalPackages((prev) => prev.filter((p) => p.id !== targetId))
    setDeletingId(null)

    if (!targetId.startsWith('temp') && !targetId.startsWith('sub-')) {
      try {
        await deletePackage(targetId)
      } catch (err) {
        console.warn('Backend subscription deletion sync error', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">Abunəlik Paketləri</h1>
          {isLoading && (
            <span className="text-xs text-[#00b4cc] font-medium animate-pulse">Yüklənir...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-colors',
                view === 'grid' ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
              aria-label="Grid görünüşü"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex h-9 w-9 items-center justify-center transition-colors',
                view === 'list' ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
              aria-label="Siyahı görünüşü"
            >
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => setModalPkg('new')}
            className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors shadow-2xs"
          >
            <Plus size={15} /> Yeni Paket
          </button>
        </div>
      </div>

      {currentPackages.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground italic">
          Hələ paket əlavə edilməyib
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={(p) => setModalPkg(p)}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-[#00B4CC]/10 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-foreground">Paket adı</th>
                <th className="px-4 py-3 text-xs font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-foreground">Qiymət / Müddət</th>
                <th className="px-4 py-3 text-xs font-semibold text-foreground">Limit</th>
                <th className="px-4 py-3 text-xs font-semibold text-foreground">Xidmətlər</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((pkg) => (
                <PackageRow
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={(p) => setModalPkg(p)}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination total={currentPackages.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {modalPkg !== null && (
        <PackageFormModal
          initial={modalPkg !== 'new' ? modalPkg as SubPackage : undefined}
          onSave={handleSave}
          onClose={() => setModalPkg(null)}
        />
      )}

      {deletingId && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />
      )}
    </div>
  )
}
