'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SubPackage, type PriceTier, type SubStatus,
  ENTRY_LIMIT_OPTIONS,
} from '@/lib/subscription-data'
import { useSubscriptions } from '@/lib/query/use-subscriptions'
import { ErrorToastModal } from '../categories/modals/error-toast-modal'
import { ConfirmDeleteModal } from '../gyms/modals/confirm-delete-modal'
import { useT } from '@/lib/i18n'
import { apiGet } from '@/lib/api/client'

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
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground">{t.subscriptions.entryLimitField}</label>
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
  const t = useT()
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
      <label className="text-[16px] leading-[24px] font-medium text-black">{t.subscriptions.packageNameHeader}</label>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full h-[60px] rounded-[12px] bg-[#fafafa] border border-[#ececed] px-4 flex items-center justify-between text-[18px] text-black outline-none transition-colors hover:border-[#00b4cc]"
        >
          <span className="leading-[28px] font-medium">{value || t.subscriptions.notSelected}</span>
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

// ── Package Form ──────────────────────────────────────────────────────────────
function PackageForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: SubPackage
  onSave: (pkg: Omit<SubPackage, 'id'>, translations: Record<string, Record<string, string>>) => void
  onCancel: () => void
}) {
  const t = useT()
  const { addBenefit, deleteBenefit, updateTranslations } = useSubscriptions()
  const [activeTab, setActiveTab] = useState<string>("AZ")
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({ EN: {}, RU: {} })
  const [editingServiceIdx, setEditingServiceIdx] = useState<number | null>(null)
  const [editingServiceValue, setEditingServiceValue] = useState<string>("")

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

  useEffect(() => {
    if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
      apiGet<any[]>("/admin/subscription-packages", { headers: { "Accept-Language": "EN" } })
        .then(res => {
          const pkg = res.find(p => String(p.package_id) === initial.id);
          if (pkg && pkg.benefits) {
            const enBenefits = pkg.benefits;
            const azBenefits = initial.services || [];
            setTranslations(prev => {
              const newEn = { ...prev.EN };
              azBenefits.forEach((azSrv, idx) => {
                if (enBenefits[idx]) {
                  newEn[azSrv] = enBenefits[idx];
                } 
              });
              return { ...prev, EN: newEn };
            });
          }
        })
        .catch(err => console.warn("Failed to fetch EN translations", err));

      apiGet<any[]>("/admin/subscription-packages", { headers: { "Accept-Language": "RU" } })
        .then(res => {
          const pkg = res.find(p => String(p.package_id) === initial.id);
          if (pkg && pkg.benefits) {
            const ruBenefits = pkg.benefits;
            const azBenefits = initial.services || [];
            setTranslations(prev => {
              const newRu = { ...prev.RU };
              azBenefits.forEach((azSrv, idx) => {
                if (ruBenefits[idx]) {
                  newRu[azSrv] = ruBenefits[idx];
                } 
              });
              return { ...prev, RU: newRu };
            });
          }
        })
        .catch(err => console.warn("Failed to fetch RU translations", err));
    }
  }, [initial]);

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

  async function handleRemoveService(idx: number) {
    const targetService = services[idx]
    setServices((prev) => prev.filter((_, i) => i !== idx))
    setTranslations((prev) => {
      const next = { ...prev }
      delete next.EN[targetService]
      delete next.RU[targetService]
      return next
    })

    if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
      try {
        await deleteBenefit({ packageId: initial.id, description: targetService })
      } catch (err) {
        console.warn('Live service deletion sync error', err)
      }
    }
  }

  function handleStartEditService(idx: number) {
    setEditingServiceIdx(idx)
    const baseSrv = services[idx]
    if (activeTab === "AZ") {
      setEditingServiceValue(baseSrv)
    } else {
      setEditingServiceValue(translations[activeTab]?.[baseSrv] || "")
    }
  }

  async function handleConfirmEditService(idx: number) {
    const trimmed = editingServiceValue.trim()
    if (!trimmed) return

    const baseSrv = services[idx]
    if (activeTab === "AZ") {
      const oldVal = services[idx]
      setServices(prev => {
        const copy = [...prev]
        copy[idx] = trimmed
        return copy
      })
      setTranslations(prev => {
        const next = { ...prev }
        if (next.EN[oldVal]) {
          next.EN[trimmed] = next.EN[oldVal]
          delete next.EN[oldVal]
        }
        if (next.RU[oldVal]) {
          next.RU[trimmed] = next.RU[oldVal]
          delete next.RU[oldVal]
        }
        return next
      })

      if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
        try {
          await deleteBenefit({ packageId: initial.id, description: oldVal })
          await addBenefit({ packageId: initial.id, description: trimmed })
        } catch (err) {
          console.warn('Sync benefit edit error', err)
        }
      }
    } else {
      setTranslations(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          [baseSrv]: trimmed
        }
      }))

      if (initial?.id && !initial.id.startsWith('temp') && !initial.id.startsWith('sub-')) {
        try {
          await updateTranslations([{
            entityType: "PLANBENEFIT",
            entityId: `${initial.id}_${baseSrv}`,
            fieldName: "description",
            languageCode: activeTab,
            fieldValue: trimmed
          }])
        } catch (err) {
          console.warn('Sync benefit translation edit error', err)
        }
      }
    }

    setEditingServiceIdx(null)
    setEditingServiceValue("")
  }

  function handleSave() {
    const entryLimitNum = parseInt(entryLimit) || 12
    onSave({ name, priceTiers, entryLimit: entryLimitNum, services, status }, translations)
  }

  return (
    <div className="w-full max-w-[1095px] relative rounded-[20px] bg-white border border-[#00b4cc] flex flex-col items-stretch p-8 gap-6 text-left text-[20px] font-sans text-black shadow-2xl">
      {/* Top Title Bar Wrapper (.yeniAbunlikFormuParent) */}
      <div className="w-full flex items-center justify-between">
        <div className="relative leading-[30px] font-semibold text-[20px]">
          {initial ? t.subscriptions.editPackage : t.subscriptions.newPackageForm}
        </div>
        <button
          onClick={onCancel}
          className="h-[28px] w-[28px] rounded-[4px] bg-[#ececed] flex items-center justify-center p-1 transition-colors hover:bg-gray-300"
          aria-label={t.subscriptions.close}
        >
          <X size={15} className="text-black" />
        </button>
      </div>

      {/* Dividing Line (.frameChild) */}
      <div className="w-full h-[1px] border-t border-[#cecfd2]" />

      {/* Language Tabs */}
      <div className="flex border-b border-[#ececed] gap-2">
        {["AZ", "RU", "EN"].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => {
              setActiveTab(lang);
              setEditingServiceIdx(null);
              setEditingServiceValue("");
            }}
            className={cn(
              "h-[40px] px-6 text-[14px] font-semibold transition-all border-b-2 outline-none",
              activeTab === lang
                ? "border-[#00b4cc] text-[#00b4cc]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Content Body Grid (.frameGroup) */}
      <div className="w-full flex flex-col md:flex-row items-stretch justify-between gap-6 text-[16px]">

        {/* Left Column (.frameContainer) */}
        <div className="w-full md:w-[503px] flex flex-col items-start gap-4 shrink-0">

          {/* Package Selector Dropdown Container */}
          <div className="w-full">
            <PackageNameDropdown value={name} onChange={setName} />
          </div>

          {/* Pricing / Tiers Wrapper */}
          <div className="w-full flex flex-col gap-3 pt-2">
            <div className="w-full rounded-[12px] bg-[#fafafa] border border-[#ececed] flex items-center justify-between p-2 px-3">
              <span className="text-[18px] leading-[28px] font-medium text-black">
                {t.subscriptions.durationAndPrices}
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
              <div className="w-full flex flex-col gap-1.5 pt-1">
                <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_2rem] gap-1 px-1">
                  <span className="text-[12px] text-gray-500 font-medium truncate">{t.subscriptions.duration}</span>
                  <span className="text-[12px] text-gray-500 font-medium truncate">{t.subscriptions.price}</span>
                  <span className="text-[12px] text-gray-500 font-medium truncate">{t.subscriptions.discountPrice}</span>
                  <span className="text-[12px] text-gray-500 font-medium truncate">{t.subscriptions.entryLimitField}</span>
                  <span />
                </div>
                {priceTiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1.1fr_1fr_1fr_1fr_2rem] gap-1 items-center">
                    <input
                      value={tier.duration}
                      onChange={(e) => updateTier(i, 'duration', e.target.value)}
                      placeholder={t.subscriptions.durationPlaceholder}
                      className="h-[38px] rounded-[8px] border border-gray-300 bg-white px-2 text-[13px] outline-none focus:border-[#00b4cc] w-full"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tier.price ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d*\.?\d*$/.test(v)) updateTier(i, 'price', v);
                      }}
                      placeholder="0"
                      className="h-[38px] rounded-[8px] border border-gray-300 bg-white px-2 text-[13px] outline-none focus:border-[#00b4cc] w-full"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={tier.discountPrice ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d*\.?\d*$/.test(v)) updateTier(i, 'discountPrice', v);
                      }}
                      placeholder="0"
                      className="h-[38px] rounded-[8px] border border-gray-300 bg-white px-2 text-[13px] outline-none focus:border-[#00b4cc] w-full"
                    />
                    <input
                      type="number"
                      value={tier.entryLimit ?? 12}
                      onChange={(e) => updateTier(i, 'entryLimit', Number(e.target.value))}
                      placeholder="12"
                      className="h-[38px] rounded-[8px] border border-gray-300 bg-white px-2 text-[13px] outline-none focus:border-[#00b4cc] w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeTier(i)}
                      disabled={priceTiers.length === 1}
                      className="h-[32px] w-[32px] rounded-[6px] flex items-center justify-center transition-colors hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-20 mx-auto"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (.frameParent2) */}
        <div className="w-full md:w-[503px] flex flex-col items-stretch justify-between gap-6 shrink-0 h-full">

          {/* Services Wrapper (.frameParent3) */}
          <div className="w-full flex flex-col items-stretch gap-3">
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[16px] leading-[24px] font-medium text-black">{t.subscriptions.servicesLimit}</label>
              {activeTab === "AZ" && (
                <div className="w-full flex items-center gap-2">
                  <input
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    placeholder={t.subscriptions.serviceName}
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
              )}
            </div>

            {/* Added Services Box (.frameParent6) */}
            <div className="w-full h-[238px] rounded-[16px] bg-[#fafafa] p-3 flex flex-col gap-2.5 overflow-y-auto border border-gray-100">
              {services.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[15px] text-gray-400 italic">
                  {t.subscriptions.noServiceAdded}
                </div>
              ) : (
                services.map((srv, idx) => {
                  const displayName = activeTab === "AZ" ? srv : (translations[activeTab]?.[srv] || srv);
                  if (editingServiceIdx === idx) {
                    return (
                      <div key={idx} className="w-full min-h-[50px] rounded-[12px] bg-white border border-[#00b4cc] px-3 flex items-center justify-between shadow-2xs shrink-0 gap-2">
                        <input
                          type="text"
                          value={editingServiceValue}
                          onChange={(e) => setEditingServiceValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleConfirmEditService(idx))}
                          className="flex-1 outline-none text-[16px] font-medium text-black bg-transparent"
                          style={{ width: `${Math.max(6, editingServiceValue.length + 1)}ch` }}
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConfirmEditService(idx)}
                            disabled={!editingServiceValue.trim()}
                            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                          >
                            <Check size={16} className="stroke-[3]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingServiceIdx(null); setEditingServiceValue(""); }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="w-full min-h-[50px] rounded-[12px] bg-white border border-[#ececed] px-3 flex items-center justify-between shadow-2xs shrink-0">
                      <span className="text-[16px] font-medium text-black">{displayName}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditService(idx)}
                          className="h-[28px] w-[28px] rounded-[4px] bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          aria-label={t.subscriptions.change}
                        >
                          <Pencil size={13} className="text-gray-600" />
                        </button>
                        {activeTab === "AZ" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className="h-[28px] w-[28px] rounded-[4px] bg-[#e7272c] flex items-center justify-center transition-colors hover:bg-red-700"
                            aria-label={t.subscriptions.delete}
                          >
                            <X size={14} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="w-full text-right text-[16px] text-gray-500 font-medium">
              {services.length}/20 {t.subscriptions.serviceCount}
            </div>
          </div>

        </div>
      </div>

      {/* Action Controls Toolbar / Footer */}
      <div className="w-full flex justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-[46px] rounded-[10px] border border-gray-300 px-6 text-[16px] font-medium text-black hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t.subscriptions.cancel}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="h-[46px] rounded-[10px] bg-[#00b4cc] px-8 text-[16px] font-semibold text-white hover:bg-[#009bb0] transition-colors shadow-sm cursor-pointer"
        >
          {t.subscriptions.save}
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
  onToggleStatus,
}: {
  pkg: SubPackage
  onEdit: (p: SubPackage) => void
  onDelete: (id: string) => void
  onToggleStatus: (p: SubPackage) => void
}) {
  const t = useT()
  return (
    <div className="w-full h-full relative rounded-[12px] bg-white border border-[#00b4cc] flex flex-col justify-between p-5 text-center font-sans text-black shadow-sm transition-all hover:shadow-md">
      {/* Growable Content Area */}
      <div className="w-full flex flex-col gap-[34px] flex-1 mb-4">
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
                <span className="leading-[18px] font-medium">{pkg.status === 'active' ? t.subscriptions.active : t.subscriptions.deactive}</span>
              </div>

              {/* Visual native CSS switch matching the design asset knobs */}
              <button
                type="button"
                onClick={() => onToggleStatus(pkg)}
                className={cn(
                  "w-[51px] h-[31px] rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 flex items-center cursor-pointer outline-none border-none",
                  pkg.status === 'active' ? "bg-[#00b4cc]" : "bg-gray-300"
                )}
                aria-label={t.subscriptions.statusChangeTitle}
              >
                <div className={cn(
                  "w-[23px] h-[23px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out",
                  pkg.status === 'active' ? "translate-x-[20px]" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section / Pricing & Entry Limit */}
        <div className="w-full flex flex-col items-start gap-[22px] text-left text-[#4a5565]">
          <div className="w-full flex flex-col items-stretch gap-2.5">
            {pkg.priceTiers.map((tier, i) => (
              <div key={i} className="w-full flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 px-1 w-full">
                  <span className="text-[16px] leading-[24px] font-medium text-[#4a5565] text-left shrink-0">
                    {tier.duration || t.subscriptions.duration}
                  </span>
                  <div className="flex items-baseline justify-center gap-1 text-center whitespace-nowrap shrink-0">
                    {Number(tier.discountPrice) > 0 && Number(tier.discountPrice) !== Number(tier.price) ? (
                      <div className="flex items-baseline gap-1 whitespace-nowrap">
                        <span className="text-[16px] leading-[24px] font-medium text-red-500 line-through whitespace-nowrap">
                          {tier.price} AZN
                        </span>
                        <span className="text-[16px] leading-[24px] font-bold text-[#101828] whitespace-nowrap">
                          / {tier.discountPrice} AZN
                        </span>
                      </div>
                    ) : (
                      <span className="text-[16px] leading-[24px] font-bold text-[#101828] whitespace-nowrap">
                        {tier.price} AZN
                      </span>
                    )}
                  </div>
                  <span className="text-[16px] leading-[24px] font-semibold text-[#101828] text-right shrink-0">
                    {tier.entryLimit ?? pkg.entryLimit} {t.subscriptions.entryLimit}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-gray-100" />
              </div>
            ))}
          </div>

          {/* Services List Block */}
          <div className="w-full flex flex-col items-start gap-[11px] pt-1">
            <span className="text-[12px] font-bold tracking-wider text-[#4a5565] uppercase">{t.subscriptions.servicesHeader.toUpperCase()}</span>
            <div className="w-full flex flex-wrap items-center gap-2">
              {pkg.services.length > 0 ? (
                pkg.services.map((s, idx) => (
                  <div key={`${s}-${idx}`} className="rounded-[20px] bg-white border border-[#ececed] flex items-center justify-center px-3 py-1 gap-1.5 text-[14px] text-black font-medium shadow-2xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00b4cc] shrink-0" />
                    <span className="leading-[20px] font-medium">{s}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">{t.subscriptions.noServiceDefined}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Block pinned to bottom */}
      <div className="w-full flex items-center gap-3 pt-2 mt-auto border-t border-gray-50/80">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 h-[41px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 gap-2 hover:bg-[#00b4cc]/5 transition-colors cursor-pointer"
        >
          <Pencil size={15} className="text-[#00b4cc] shrink-0" />
          <span className="text-[15px] font-medium text-black leading-[24px]">{t.subscriptions.change}</span>
        </button>

        <button
          onClick={() => onDelete(pkg.id)}
          className="flex-1 h-[41px] rounded-[10px] bg-white border border-[#f10303] flex items-center justify-center px-4 gap-2 hover:bg-[#f10303]/5 transition-colors cursor-pointer"
        >
          <Trash2 size={15} className="text-[#f10303] shrink-0" />
          <span className="text-[15px] font-medium text-black leading-[24px]">{t.subscriptions.delete}</span>
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SubscriptionList() {
  const t = useT()
  const { 
    packages: backendPackages, 
    isLoading, 
    createPackage, 
    updatePackage, 
    deletePackage, 
    updatePackageStatus,
    updateTranslations,
    refetch
  } = useSubscriptions()
  const [localPackages, setLocalPackages] = useState<SubPackage[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPkg, setEditingPkg] = useState<SubPackage | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  async function handleToggleStatus(pkg: SubPackage) {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active'
    setLocalPackages((prev) => prev.map((p) => p.id === pkg.id ? { ...p, status: newStatus } : p))
    
    if (!pkg.id.startsWith('temp') && !pkg.id.startsWith('sub-')) {
      try {
        await updatePackageStatus({ id: pkg.id, isActive: newStatus === 'active' })
      } catch (err) {
        console.warn('Backend status toggle sync error', err)
      }
    }
  }

  const currentPackages = backendPackages || []
  const paginated = currentPackages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleSave(data: Omit<SubPackage, 'id'>, translations?: Record<string, Record<string, string>>) {
    if (editingPkg) {
      const targetId = editingPkg.id
      setLocalPackages((prev) => prev.map((p) => p.id === targetId ? { ...editingPkg, ...data } : p))
      setShowForm(false)
      setEditingPkg(null)

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

          if (translations) {
            const translationPayload: any[] = [];
            data.services.forEach((azSrv) => {
              if (translations.EN?.[azSrv]) {
                translationPayload.push({
                  entityType: "PLANBENEFIT",
                  entityId: `${targetId}_${azSrv}`,
                  fieldName: "description",
                  languageCode: "EN",
                  fieldValue: translations.EN[azSrv],
                });
              }
              if (translations.RU?.[azSrv]) {
                translationPayload.push({
                  entityType: "PLANBENEFIT",
                  entityId: `${targetId}_${azSrv}`,
                  fieldName: "description",
                  languageCode: "RU",
                  fieldValue: translations.RU[azSrv],
                });
              }
            });
            if (translationPayload.length > 0) {
              await updateTranslations(translationPayload);
            }
          }
        } catch (err) {
          console.warn('Backend subscription update sync error', err)
        }
      }
    } else {
      setShowForm(false)
      setEditingPkg(null)

      try {
        await createPackage({
          name: data.name,
          status: data.status,
          entryLimit: data.entryLimit,
          services: data.services,
          priceTiers: data.priceTiers,
        })

        if (translations) {
          const updated = await refetch();
          const createdPkg = updated.data?.find(p => p.name === data.name);
          if (createdPkg && !createdPkg.id.startsWith('temp') && !createdPkg.id.startsWith('sub-')) {
            const packageId = createdPkg.id;
            const translationPayload: any[] = [];
            data.services.forEach((azSrv) => {
              if (translations.EN?.[azSrv]) {
                translationPayload.push({
                  entityType: "PLANBENEFIT",
                  entityId: `${packageId}_${azSrv}`,
                  fieldName: "description",
                  languageCode: "EN",
                  fieldValue: translations.EN[azSrv],
                });
              }
              if (translations.RU?.[azSrv]) {
                translationPayload.push({
                  entityType: "PLANBENEFIT",
                  entityId: `${packageId}_${azSrv}`,
                  fieldName: "description",
                  languageCode: "RU",
                  fieldValue: translations.RU[azSrv],
                });
              }
            });
            if (translationPayload.length > 0) {
              await updateTranslations(translationPayload);
            }
          }
        }
      } catch (err) {
        console.warn('Backend subscription creation sync error', err)
      }
    }
  }

  function handleEdit(pkg: SubPackage) {
    setEditingPkg(pkg)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{t.subscriptions.title}</h1>
          {isLoading && (
            <span className="text-xs text-[#00b4cc] font-medium animate-pulse">{t.subscriptions.loading}</span>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => {
              if (currentPackages.length >= 4) {
                setErrorMsg(t.subscriptions.allPackagesCreated)
                return
              }
              setEditingPkg(null)
              setShowForm(true)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors shadow-2xs"
          >
            <Plus size={15} /> {t.subscriptions.addPackage}
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

      {currentPackages.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground italic">
          {t.subscriptions.noPackages}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={handleEdit}
              onDelete={(id) => setDeletingId(id)}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <Pagination total={currentPackages.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />

      {deletingId && (
        <ConfirmDeleteModal
          name={currentPackages.find((p) => p.id === deletingId)?.name ?? 'Paket'}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {errorMsg && (
        <ErrorToastModal message={errorMsg} onClose={() => setErrorMsg(null)} />
      )}
    </div>
  )
}
