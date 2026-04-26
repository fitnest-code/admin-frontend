'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Store, type StorePackage } from '@/lib/stores-data'

const LANGS = ['Az', 'Ru', 'En'] as const
type Lang = typeof LANGS[number]

interface Props {
  store?: Store
  isNew?: boolean
}

type PkgModal =
  | { mode: 'add' }
  | { mode: 'edit'; pkg: StorePackage }
  | null

export function StoreDetail({ store, isNew }: Props) {
  const router  = useRouter()
  const [lang, setLang]         = useState<Lang>('Az')
  const [name, setName]         = useState(store?.name ?? '')
  const [about, setAbout]       = useState(store?.about ?? '')
  const [address, setAddress]   = useState(store?.address ?? '')
  const [phone, setPhone]       = useState(store?.phone ?? '')
  const [email, setEmail]       = useState(store?.email ?? '')
  const [hours, setHours]       = useState(store?.workingHours ?? '')
  const [packages, setPackages] = useState<StorePackage[]>(store?.packages ?? [])
  const [photo, setPhoto]       = useState<string | null>(store?.photo ?? null)
  const [pkgModal, setPkgModal] = useState<PkgModal>(null)

  function handleSavePkg(data: { name: string; discount: number }) {
    if (!pkgModal) return
    if (pkgModal.mode === 'add') {
      setPackages((p) => [...p, { id: `pkg-${Date.now()}`, ...data }])
    } else {
      setPackages((p) => p.map((pkg) => pkg.id === pkgModal.pkg.id ? { ...pkg, ...data } : pkg))
    }
    setPkgModal(null)
  }

  function removePackage(id: string) {
    setPackages((p) => p.filter((pkg) => pkg.id !== id))
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Back */}
      <button
        onClick={() => router.push('/stores')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Geri qayıt
      </button>

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground">
        {isNew ? 'Yeni Mağaza' : (name || 'Mağaza')}
      </h1>

      {/* Mağaza məlumatları */}
      <section className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Mağaza məlumatları</h2>
          <div className="flex overflow-hidden rounded-lg border border-border">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  'px-3 py-1 text-xs font-medium transition-colors',
                  lang === l ? 'bg-[#00B4CC] text-white' : 'text-muted-foreground hover:bg-secondary',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Mağaza adı</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vitamin club"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Haqqında</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Haqqında"
            rows={4}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Mağaza şəkilləri</label>
          <div className="flex gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
              {photo
                ? <img src={photo} alt="Mağaza şəkli" className="h-full w-full object-cover" />
                : <ImageIcon size={28} className="text-muted-foreground" />}
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground hover:text-[#00B4CC] transition-colors">
                <ImageIcon size={15} /> Şəkil yüklə
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground hover:text-[#00B4CC] transition-colors">
                <ImageIcon size={15} /> Şəkli dəyiş
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
              </label>
              {photo && (
                <button
                  onClick={() => setPhoto(null)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  <ImageIcon size={15} /> Şəkli sil
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Əlaqə */}
      <section className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Əlaqə</h2>
        <Field label="Ünvan"           value={address} onChange={setAddress} placeholder="Bakı, Nərimanov rayonu" />
        <Field label="Telefon nömrəsi" value={phone}   onChange={setPhone}   placeholder="+994 00 000 00 00" />
        <Field label="E-Poçt"          value={email}   onChange={setEmail}   placeholder="example@gmail.com" />
        <Field label="İş saatları"     value={hours}   onChange={setHours}   placeholder="B.e-C :  07:00-22:00" />
      </section>

      {/* Paketlər və endirim */}
      <section className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Paketlər və endirim</h2>
          <button
            onClick={() => setPkgModal({ mode: 'add' })}
            className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            <Plus size={13} /> Əlavə et
          </button>
        </div>

        {packages.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_1fr_2.5rem] gap-3 border-b border-border bg-[#00B4CC14] px-4 py-2.5">
              <span className="text-xs font-semibold text-foreground">Paket adı</span>
              <span className="text-xs font-semibold text-foreground">Endirim (%)</span>
              <span />
            </div>
            {packages.map((pkg) => (
              <div key={pkg.id} className="grid grid-cols-[1fr_1fr_2.5rem] items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-foreground">{pkg.name || 'Paket adı'}</span>
                  <button
                    onClick={() => setPkgModal({ mode: 'edit', pkg })}
                    className="text-[#00B4CC] hover:opacity-70 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-foreground">{pkg.discount} %</span>
                  <button
                    onClick={() => setPkgModal({ mode: 'edit', pkg })}
                    className="text-[#00B4CC] hover:opacity-70 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removePackage(pkg.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/stores')}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          Ləğv et
        </button>
        <button
          onClick={() => router.push('/stores')}
          className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          Yadda saxla
        </button>
      </div>

      {/* Package modal */}
      {pkgModal && (
        <PackageModal
          initial={pkgModal.mode === 'edit' ? pkgModal.pkg : undefined}
          onSave={handleSavePkg}
          onClose={() => setPkgModal(null)}
        />
      )}
    </div>
  )
}

// ── Package add/edit modal ────────────────────────────────────────────────────
function PackageModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: StorePackage
  onSave: (data: { name: string; discount: number }) => void
  onClose: () => void
}) {
  const [pkgName,   setPkgName]   = useState(initial?.name     ?? '')
  const [discount,  setDiscount]  = useState(String(initial?.discount ?? ''))

  function handleSave() {
    if (!pkgName.trim()) return
    onSave({ name: pkgName.trim(), discount: Number(discount) || 0 })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {initial ? 'Paketi redaktə et' : 'Yeni paket əlavə et'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Paket adı */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Paket adı</label>
          <input
            autoFocus
            value={pkgName}
            onChange={(e) => setPkgName(e.target.value)}
            placeholder="Paket adı"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        {/* Endirim */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Endirim (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="10"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            disabled={!pkgName.trim()}
            className="flex-1 rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-40 transition-colors"
          >
            Saxla
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
      />
    </div>
  )
}
