'use client'

import { useState } from 'react'
import { Upload, Pencil, Camera, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Zal, WorkingHour } from '@/lib/zallar-data'

interface ZalMelumatlarTabProps {
  zal: Zal
  isNew?: boolean
}

type WorkType = 'Bütün günlər' | 'Həftə içi' | 'İstirahət'

export function ZalMelumatlarTab({ zal, isNew = false }: ZalMelumatlarTabProps) {
  const [name, setName] = useState(zal.name)
  const [address, setAddress] = useState(zal.address)
  const [phone, setPhone] = useState(zal.phone)
  const [email, setEmail] = useState(zal.email)
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(zal.workingHours)

  function updateHour(idx: number, field: 'open' | 'close', val: string) {
    setWorkingHours((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: val } : h)),
    )
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Row: Logo + Fields */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {/* Logo upload */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Mağazı şəkli</span>
          <div className="flex flex-col items-center justify-center gap-2 h-32 w-32 rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-[#00B4CC] transition-colors group">
            <Upload size={20} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
            <span className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">Yüklə</span>
          </div>
          <span className="text-[10px] text-muted-foreground">JPG ve PNG • max 5mb</span>
        </div>

        {/* Text fields */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Ad" value={name} onChange={setName} placeholder="Mağazı adını daxil et" />
            <FormField label="Soyad" value={""} onChange={() => {}} placeholder="Mağazını soyadı" />
            <FormField label="Qulluqçu" value={""} onChange={() => {}} placeholder="Mağazının qulluqçusu" />
            <FormField label="İxtisas" value={""} onChange={() => {}} placeholder="Mağazının ixtisası" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Zal" value={zal.name} onChange={() => {}} placeholder="Fəaliyyatdəki olduğu zal" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Telefon nömrəsi" value={phone} onChange={setPhone} placeholder="Əlaqə nömrəsi" />
            <FormField label="E-poçt" value={email} onChange={setEmail} placeholder="Mail" />
          </div>
        </div>
      </div>

      {/* Zal məlumatları section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Zal məlumatları</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EditableField label="Zal adı" value={name} onChange={setName} />
          <EditableField label="Ünvan" value={address} onChange={setAddress} />
        </div>
      </div>

      {/* Zal şəkilləri */}
      <ZalImages />

      {/* İş saatları */}
      <WorkingHoursSection hours={workingHours} onChange={updateHour} />

      {/* Bilgi section */}
      <ContactSection phone={phone} email={email} onPhoneChange={setPhone} onEmailChange={setEmail} />

      {/* Map */}
      <MapSection />

      {/* Created date */}
      {!isNew && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Yaradılma tarixi</span>
          <span className="text-sm font-medium text-foreground">{zal.createdAt}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Yadda saxla
        </button>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors"
      />
    </div>
  )
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground outline-none"
        />
        <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
      </div>
    </div>
  )
}

function ZalImages() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Zal şəkilləri (100)</h3>
      <div className="flex flex-wrap gap-3">
        {/* Existing image placeholder */}
        <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-secondary border border-border">
          <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Camera size={16} className="text-muted-foreground" />
          </div>
          <button className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
            <X size={10} />
          </button>
          {/* Stats row under image */}
        </div>
        {/* Upload more */}
        <div className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-secondary hover:border-[#00B4CC] transition-colors">
          <Plus size={16} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Əlavə et</span>
        </div>
      </div>
      {/* Thumbnail stat row */}
      <div className="flex flex-wrap gap-2 mt-1">
        {['Ümumilik 100', 'Kardiyo 50%', 'Ücüncü 30%', 'Dörd 20%', 'Beş 15%'].map((s) => (
          <span key={s} className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground border border-border">{s}</span>
        ))}
      </div>
    </div>
  )
}

function WorkingHoursSection({
  hours,
  onChange,
}: {
  hours: WorkingHour[]
  onChange: (idx: number, field: 'open' | 'close', val: string) => void
}) {
  const [workType, setWorkType] = useState<WorkType>('Bütün günlər')
  const types: WorkType[] = ['Bütün günlər', 'Həftə içi', 'İstirahət']

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">İş saatları</h3>
      {/* Type buttons */}
      <div className="flex gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setWorkType(t)}
            className={cn(
              'rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors',
              workType === t
                ? 'bg-[#00B4CC] border-[#00B4CC] text-white'
                : 'border-border text-muted-foreground hover:border-[#00B4CC] hover:text-[#00B4CC]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* İş saatları table */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-secondary px-4 py-2">
          <span className="text-xs font-semibold text-muted-foreground">Gün</span>
          <span className="text-xs font-semibold text-muted-foreground">Açılış</span>
          <span className="text-xs font-semibold text-muted-foreground">Bağlanış</span>
        </div>
        {hours.map((h, i) => (
          <div key={h.day} className="grid grid-cols-[1fr_1fr_1fr] items-center border-b border-border px-4 py-2.5 last:border-0">
            <span className="text-sm text-foreground">{h.shortDay} - {h.day.slice(0, 8)}</span>
            <input
              type="time"
              value={h.open}
              onChange={(e) => onChange(i, 'open', e.target.value)}
              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-[#00B4CC]"
            />
            <input
              type="time"
              value={h.close}
              onChange={(e) => onChange(i, 'close', e.target.value)}
              className={cn(
                'w-24 rounded-md border px-2 py-1 text-xs outline-none focus:border-[#00B4CC]',
                h.type === 'istirahет'
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-border bg-background text-foreground',
              )}
            />
          </div>
        ))}
      </div>

      {/* Qeyd */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">İş saatı - İş saatları</label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <input
            type="text"
            defaultValue="B.e: 07:00-23:00"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Bazar ertəsi - İş saatları</label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <input
            type="text"
            defaultValue="B.e: 07:00-23:00"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
        </div>
      </div>
    </div>
  )
}

function ContactSection({
  phone,
  email,
  onPhoneChange,
  onEmailChange,
}: {
  phone: string
  email: string
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Bilgi</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Telefon nömrəsi</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="flex-1 text-sm text-foreground">{phone}</span>
            <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">E-poçt</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="flex-1 text-sm text-foreground">{email}</span>
            <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MapSection() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">Bakı, Yer Xəritəsi rayonu</h3>
        <Pencil size={14} className="text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
      </div>
      <div className="h-48 w-full overflow-hidden rounded-xl border border-border bg-secondary">
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=49.7%2C40.35%2C50.0%2C40.45&layer=mapnik"
          className="h-full w-full"
          title="Bakı xəritəsi"
          loading="lazy"
        />
      </div>
    </div>
  )
}