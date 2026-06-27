'use client'

import { useState, useEffect, useMemo } from 'react'
import { Upload, Pencil, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Zal } from '@/lib/zallar-data'
import { GymInfoAdminResponseV2, GymDescriptionResponse, CategoryDetail } from '@/lib/types/gym'
import { useUpdateGymDetails } from '@/lib/query/gym-query'
import { toast } from 'sonner'

interface ZalMelumatlarTabProps {
  gymId: string | number
  gymDetails?: GymInfoAdminResponseV2
  zal?: Zal
  isNew?: boolean
}

export function ZalMelumatlarTab({ gymId, gymDetails, zal, isNew = false }: ZalMelumatlarTabProps) {
  const [name, setName] = useState(gymDetails?.name || zal?.name || '')
  const [address, setAddress] = useState(gymDetails?.address || zal?.address || '')

  const updateDetailsMutation = useUpdateGymDetails()

  // All categories (main + sub)
  const allCategories = useMemo(() => {
    const main = gymDetails?.mainCategories || []
    const sub = gymDetails?.subCategories || []
    if (main.length === 0 && sub.length === 0) return gymDetails?.categories || []
    return [...main, ...sub]
  }, [gymDetails])

  // Per-category editable descriptions state
  const [catDescriptions, setCatDescriptions] = useState<Record<number, { description: string; phone: string; coverImageUrl: string }>>({})

  // Active category for expanded detail view
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  // Sync API descriptions into local state
  useEffect(() => {
    if (gymDetails) {
      setName(gymDetails.name)
      setAddress(gymDetails.address)

      const descs: Record<number, { description: string; phone: string; coverImageUrl: string }> = {}
      if (gymDetails.descriptions && gymDetails.descriptions.length > 0) {
        gymDetails.descriptions.forEach((d: GymDescriptionResponse) => {
          descs[d.categoryId] = {
            description: d.description || '',
            phone: d.phone || '',
            coverImageUrl: d.coverImageUrl || ''
          }
        })
      } else {
        // Fallback: populate from gym-level data for each category
        allCategories.forEach(c => {
          descs[c.id] = {
            description: gymDetails.description || '',
            phone: gymDetails.phone || '',
            coverImageUrl: gymDetails.coverImageUrl || ''
          }
        })
      }
      setCatDescriptions(descs)

      // Default active to first category
      if (allCategories.length > 0 && activeCategoryId === null) {
        setActiveCategoryId(allCategories[0].id)
      }
    }
  }, [gymDetails, allCategories])

  const updateCatField = (catId: number, field: 'description' | 'phone' | 'coverImageUrl', value: string) => {
    setCatDescriptions(prev => ({
      ...prev,
      [catId]: { ...(prev[catId] || { description: '', phone: '', coverImageUrl: '' }), [field]: value }
    }))
  }

  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/')) return url
    return `/api/v1/media/stream/${url}`
  }

  const handleSave = async () => {
    const mainCats = gymDetails?.mainCategories || gymDetails?.categories || []
    const subCats = gymDetails?.subCategories || []

    const buildDetails = (cats: typeof mainCats): CategoryDetail[] =>
      cats.map(c => ({
        categoryId: c.id,
        phone: catDescriptions[c.id]?.phone || gymDetails?.phone || '',
        description: catDescriptions[c.id]?.description || '',
        coverImageUrl: catDescriptions[c.id]?.coverImageUrl || ''
      }))

    try {
      const payload = {
        mainCategoryDetails: buildDetails(mainCats),
        subCategoryDetails: buildDetails(subCats),
        hasSubcategories: subCats.length > 0 ? true : undefined,
        name,
        description: gymDetails?.description || '',
        phone: gymDetails?.phone || '',
        email: gymDetails?.email || null,
        city: gymDetails?.city || 'Bakı',
        address,
        latitude: gymDetails?.latitude || 40.4093,
        longitude: gymDetails?.longitude || 49.8671,
        altitude: null
      }

      await updateDetailsMutation.mutateAsync({ id: Number(gymId), payload })
      toast.success("Zal məlumatları uğurla yeniləndi")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi")
    }
  }

  const activeDesc = activeCategoryId !== null ? catDescriptions[activeCategoryId] : null

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Row: Cover + Name/Address */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {/* Cover image */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Zal şəkli</span>
          <div className="flex flex-col items-center justify-center gap-2 h-32 w-32 rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-[#00B4CC] transition-colors group">
            {gymDetails?.coverImageUrl ? (
              <img src={getImageUrl(gymDetails.coverImageUrl)} alt="Cover" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <>
                <Upload size={20} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
                <span className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">Yüklə</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">JPG və PNG • max 5mb</span>
        </div>

        {/* Name & Address */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EditableField label="Zal adı" value={name} onChange={setName} />
            <EditableField label="Ünvan" value={address} onChange={setAddress} />
          </div>
        </div>
      </div>

      {/* Category Selection Pills */}
      {allCategories.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-[20px] leading-[30px] font-semibold text-black">Kateqoriya seçimi</h3>
            <div className="flex items-center gap-6 flex-wrap">
              {allCategories.map(cat => {
                const isActive = activeCategoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(isActive ? null : cat.id)}
                    className={cn(
                      "h-12 min-w-[140px] px-7 rounded-full flex items-center justify-center text-[16px] leading-[24px] font-medium transition-all duration-200 select-none",
                      isActive
                        ? "bg-[#00B4CC] text-white shadow-md shadow-[#00B4CC]/20"
                        : "border border-[#00B4CC] text-black hover:bg-[#00B4CC]/5"
                    )}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Expanded Category Detail */}
          {activeCategoryId !== null && activeDesc && (
            <div className="flex flex-col gap-5 p-6 rounded-2xl border border-[#ececed] bg-white animate-in fade-in slide-in-from-top-2 duration-300">
              <h4 className="text-[16px] font-semibold text-[#101828] border-b border-[#ececed] pb-3">
                {allCategories.find(c => c.id === activeCategoryId)?.name} — Kateqoriya detalları
              </h4>

              {/* Cover Image */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">Kateqoriya üzrə şəkil</span>
                <div className="h-40 w-full max-w-[320px] rounded-xl border-2 border-dashed border-border bg-secondary overflow-hidden cursor-pointer hover:border-[#00B4CC] transition-colors group">
                  {activeDesc.coverImageUrl ? (
                    <img src={getImageUrl(activeDesc.coverImageUrl)} alt="Category cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                      <Upload size={20} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
                      <span className="text-[10px] text-muted-foreground">Şəkil yüklə</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Təsvir</label>
                <textarea
                  value={activeDesc.description}
                  onChange={(e) => updateCatField(activeCategoryId, 'description', e.target.value)}
                  rows={4}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors resize-none"
                  placeholder="Bu kateqoriya üçün təsvir..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Room Images */}
      <ZalImages rooms={gymDetails?.rooms || []} />

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
  if (rooms.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Zal otaqları ({rooms.length})</h3>
      <div className="flex flex-wrap gap-3">
        {rooms.map((room: any) => (
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