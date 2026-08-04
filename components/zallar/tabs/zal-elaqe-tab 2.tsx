'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GymInfoAdminResponseV2, GymDescriptionResponse, CategoryDetail } from '@/lib/types/gym'
import { useUpdateGymDetails } from '@/lib/query/gym-query'
import { toast } from 'sonner'

interface ZalElaqeTabProps {
  gymId: string | number
  gymDetails?: GymInfoAdminResponseV2
}

export function ZalElaqeTab({ gymId, gymDetails }: ZalElaqeTabProps) {
  const updateDetailsMutation = useUpdateGymDetails()

  // All categories (main + sub)
  const allCategories = useMemo(() => {
    const main = gymDetails?.mainCategories || []
    const sub = gymDetails?.subCategories || []
    if (main.length === 0 && sub.length === 0) return gymDetails?.categories || []
    return [...main, ...sub]
  }, [gymDetails])

  // Active category for phone switching
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  // Per-category phone numbers
  const [catPhones, setCatPhones] = useState<Record<number, string>>({})

  // Common email & address
  const [email, setEmail] = useState(gymDetails?.email || '')
  const [address, setAddress] = useState(gymDetails?.address || '')

  // Sync from API
  useEffect(() => {
    if (gymDetails) {
      setEmail(gymDetails.email || '')
      setAddress(gymDetails.address || '')

      const phones: Record<number, string> = {}
      if (gymDetails.descriptions && gymDetails.descriptions.length > 0) {
        gymDetails.descriptions.forEach((d: GymDescriptionResponse) => {
          phones[d.categoryId] = d.phone || ''
        })
      } else {
        // Fallback: use gym-level phone for all categories
        allCategories.forEach(c => {
          phones[c.id] = gymDetails.phone || ''
        })
      }
      setCatPhones(phones)

      if (allCategories.length > 0 && activeCategoryId === null) {
        setActiveCategoryId(allCategories[0].id)
      }
    }
  }, [gymDetails, allCategories])

  const handleSave = async () => {
    const mainCats = gymDetails?.mainCategories || gymDetails?.categories || []
    const subCats = gymDetails?.subCategories || []

    const buildDetails = (cats: typeof mainCats): CategoryDetail[] =>
      cats.map(c => {
        const existingDesc = gymDetails?.descriptions?.find(d => d.categoryId === c.id)
        return {
          categoryId: c.id,
          phone: catPhones[c.id] || '',
          description: existingDesc?.description || gymDetails?.description || '',
          coverImageUrl: existingDesc?.coverImageUrl || ''
        }
      })

    try {
      const payload = {
        mainCategoryDetails: buildDetails(mainCats),
        subCategoryDetails: buildDetails(subCats),
        hasSubcategories: subCats.length > 0 ? true : undefined,
        name: gymDetails?.name || '',
        description: gymDetails?.description || '',
        phone: gymDetails?.phone || '',
        email,
        city: gymDetails?.city || 'Bakı',
        address,
        latitude: gymDetails?.latitude || 40.4093,
        longitude: gymDetails?.longitude || 49.8671,
        altitude: null
      }

      await updateDetailsMutation.mutateAsync({ id: Number(gymId), payload })
      toast.success("Əlaqə məlumatları uğurla yeniləndi")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi")
    }
  }

  return (
    <div className="flex flex-col gap-8 py-6">
      {/* Category Selection Pills */}
      {allCategories.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-[20px] leading-[30px] font-semibold text-black">Kateqoriya seçimi</h3>
          <div className="flex items-center gap-6 flex-wrap">
            {allCategories.map(cat => {
              const isActive = activeCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
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
      )}

      {/* Per-category Phone */}
      {activeCategoryId !== null && (
        <div className="flex flex-col gap-5 p-6 rounded-2xl border border-[#ececed] bg-white animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-[16px] font-semibold text-[#101828] border-b border-[#ececed] pb-3">
            {allCategories.find(c => c.id === activeCategoryId)?.name} — Telefon nömrəsi
          </h4>
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-xs font-medium text-muted-foreground">Telefon nömrəsi</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <input
                type="text"
                value={catPhones[activeCategoryId] || ''}
                onChange={(e) => setCatPhones(prev => ({ ...prev, [activeCategoryId!]: e.target.value }))}
                placeholder="+994 XX XXX XX XX"
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="flex flex-col gap-5">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">Ümumi əlaqə məlumatları</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">E-poçt</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@example.com"
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Ünvan</label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ünvan daxil edin"
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <Pencil size={13} className="shrink-0 text-muted-foreground hover:text-[#00B4CC] cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
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

      {/* Save */}
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
