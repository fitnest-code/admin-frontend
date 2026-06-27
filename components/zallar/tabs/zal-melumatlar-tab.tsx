'use client'

import { useState, useEffect } from 'react'
import { Upload, Pencil, Camera, X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Zal, WorkingHour } from '@/lib/zallar-data'
import { GymInfoAdminResponseV2 } from '@/lib/types/gym'
import { useUpdateGymDetails } from '@/lib/query/gym-query'
import { toast } from 'sonner'

interface ZalMelumatlarTabProps {
  gymId: string | number
  gymDetails?: GymInfoAdminResponseV2
  zal?: Zal
  isNew?: boolean
}

type WorkType = 'Bütün günlər' | 'Həftə içi' | 'İstirahət'

export function ZalMelumatlarTab({ gymId, gymDetails, zal, isNew = false }: ZalMelumatlarTabProps) {
  const [name, setName] = useState(gymDetails?.name || zal?.name || '')
  const [address, setAddress] = useState(gymDetails?.address || zal?.address || '')
  const [phone, setPhone] = useState(gymDetails?.phone || zal?.phone || '')
  const [email, setEmail] = useState(gymDetails?.email || zal?.email || '')
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(zal?.workingHours || [])

  const updateDetailsMutation = useUpdateGymDetails();

  useEffect(() => {
    if (gymDetails) {
      setName(gymDetails.name)
      setAddress(gymDetails.address)
      setPhone(gymDetails.phone)
      setEmail(gymDetails.email)
    }
  }, [gymDetails])

  function updateHour(idx: number, field: 'open' | 'close', val: string) {
    setWorkingHours((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: val } : h)),
    )
  }

  const handleSave = async () => {
    try {
      const payload = {
        name,
        description: gymDetails?.description || 'Zal təsviri',
        phone,
        email,
        address,
        city: gymDetails?.city || 'Bakı',
        latitude: gymDetails?.latitude || 40.4093,
        longitude: gymDetails?.longitude || 49.8671,
        altitude: null,
        mainCategoryIds: gymDetails?.mainCategories?.map(c => c.id) || (gymDetails?.categories?.map(c => c.id) || [1]),
        subCategoryIds: gymDetails?.subCategories?.map(c => c.id) || []
      }

      await updateDetailsMutation.mutateAsync({ id: Number(gymId), payload })
      toast.success("Zal məlumatları uğurla yeniləndi")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi")
    }
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Row: Logo + Fields */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {/* Logo upload */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Mağaza şəkli</span>
          <div className="flex flex-col items-center justify-center gap-2 h-32 w-32 rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-[#00B4CC] transition-colors group">
            {gymDetails?.coverImageUrl ? (
              <img src={gymDetails.coverImageUrl.startsWith('http') ? gymDetails.coverImageUrl : `/api/v1/media/stream/${gymDetails.coverImageUrl}`} alt="Cover" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
                <span className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">Yüklə</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">JPG ve PNG • max 5mb</span>
        </div>

        {/* Text fields */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Ad" value={name} onChange={setName} placeholder="Zal adını daxil et" />
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
      <ZalImages rooms={gymDetails?.rooms || []} />

      {/* İş saatları */}
      {workingHours.length > 0 && (
        <WorkingHoursSection hours={workingHours} onChange={updateHour} />
      )}

      {/* Bilgi section */}
      <ContactSection phone={phone} email={email} onPhoneChange={setPhone} onEmailChange={setEmail} />

      {/* Map */}
      <MapSection />

      {/* Created date */}
      {gymDetails?.createdAt && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Yaradılma tarixi</span>
          <span className="text-sm font-medium text-foreground">{gymDetails.createdAt}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
        <button
          onClick={handleSave}
          disabled={updateDetailsMutation.isPending}
          className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors flex items-center justify-center gap-2"
        >
          {updateDetailsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

function ZalImages({ rooms }: { rooms: any[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Zal otaqları ({rooms.length})</h3>
      <div className="flex flex-wrap gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="relative h-20 w-24 rounded-xl overflow-hidden bg-secondary border border-border">
            <img src={room.imageUrl?.startsWith('http') ? room.imageUrl : `/api/v1/media/stream/${room.imageUrl}`} alt={room.name} className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
              {room.name}
            </div>
          </div>
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

      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border">
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
    </div>
  )
}

function ContactSection({
  phone,
  email,
}: {
  phone: string
  email: string
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Əlaqə</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Telefon nömrəsi</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="flex-1 text-sm text-foreground">{phone}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">E-poçt</span>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span className="flex-1 text-sm text-foreground">{email}</span>
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
        <h3 className="text-sm font-semibold text-foreground">Xəritə</h3>
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