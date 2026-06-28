"use client";

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Pencil, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymDetailsAdmin, useUpdateGymDetails } from '@/lib/query/gym-query'
import { GymDescriptionResponse, CategoryDetail } from '@/lib/types/gym'
import { toast } from 'sonner'
import { useGymStore } from '@/lib/store/gym-store'
import styles from './info-tab.module.css'

export function ContactTab() {
  const gymId = useGymStore((s) => s.gymId)
  const { data: gymInfo } = useGymDetailsAdmin(gymId ? Number(gymId) : null)
  const updateDetailsMutation = useUpdateGymDetails()

  // All categories (main + sub)
  const allCategories = useMemo(() => {
    if (!gymInfo) return []
    const main = gymInfo.mainCategories || []
    const sub = gymInfo.subCategories || []
    if (main.length === 0 && sub.length === 0) return gymInfo.categories || []
    return [...main, ...sub]
  }, [gymInfo])

  // Active category for phone switching
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

  // Per-category phone numbers
  const [catPhones, setCatPhones] = useState<Record<number, string>>({})

  // Common email & address
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  // Sync from API
  useEffect(() => {
    if (gymInfo) {
      setEmail(gymInfo.email || '')
      setAddress(gymInfo.address || '')

      const phones: Record<number, string> = {}
      if (gymInfo.descriptions && gymInfo.descriptions.length > 0) {
        gymInfo.descriptions.forEach((d: GymDescriptionResponse) => {
          phones[d.categoryId] = d.phone || ''
        })
      } else {
        allCategories.forEach(c => {
          phones[c.id] = gymInfo.phone || ''
        })
      }
      setCatPhones(phones)

      if (allCategories.length > 0 && activeCategoryId === null) {
        setActiveCategoryId(allCategories[0].id)
      }
    }
  }, [gymInfo, allCategories])

  const handleSave = async () => {
    if (!gymInfo || !gymId) return
    const mainCats = gymInfo.mainCategories || gymInfo.categories || []
    const subCats = gymInfo.subCategories || []

    const buildDetails = (cats: typeof mainCats): CategoryDetail[] =>
      cats.map(c => {
        const existingDesc = gymInfo.descriptions?.find((d: GymDescriptionResponse) => d.categoryId === c.id)
        return {
          categoryId: c.id,
          phone: catPhones[c.id] || '',
          description: existingDesc?.description || gymInfo.description || '',
          coverImageUrl: existingDesc?.coverImageUrl || ''
        }
      })

    try {
      const payload = {
        mainCategoryDetails: buildDetails(mainCats),
        subCategoryDetails: buildDetails(subCats),
        hasSubcategories: subCats.length > 0 ? true : undefined,
        name: gymInfo.name || '',
        description: gymInfo.description || '',
        phone: gymInfo.phone || '',
        email,
        city: gymInfo.city || 'Bakı',
        address,
        latitude: gymInfo.latitude || 40.4093,
        longitude: gymInfo.longitude || 49.8671,
        altitude: null
      }

      await updateDetailsMutation.mutateAsync({ id: Number(gymId), payload })
      toast.success("Əlaqə məlumatları uğurla yeniləndi")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi")
    }
  }

  if (!gymInfo) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Yüklənir...
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-start gap-[40px] text-base text-[#000] font-sans">

      {/* Category Selection Pills */}
      {allCategories.length > 0 && (
        <div className={styles.kateqoriyaSeimiParent}>
          <div className={styles.kateqoriyaSeimi}>Kateqoriya seçimi</div>
          <div className={styles.component42Parent}>
            {allCategories.map(cat => {
              const isActive = activeCategoryId === cat.id
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={isActive ? styles.component42 : styles.component422}
                >
                  {cat.name}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Per-category Phone */}
      {activeCategoryId !== null && (
        <div className="self-stretch flex flex-col items-start gap-[28px] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
            <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">
              {allCategories.find(c => c.id === activeCategoryId)?.name} — Telefon nömrəsi
            </div>
          </div>

          <div className="self-stretch flex flex-col items-start gap-5">
            <div className="flex-1 w-full max-w-md flex flex-col items-start gap-3">
              <div className="self-stretch relative leading-[24px]">Telefon nömrəsi</div>
              <div className="self-stretch h-[44px] rounded-lg bg-white border border-[#ececed] flex items-center p-[0px_12px] text-sm focus-within:border-[#00B4CC] transition-colors relative">
                <input
                  type="text"
                  value={catPhones[activeCategoryId] || ''}
                  onChange={(e) => setCatPhones(prev => ({ ...prev, [activeCategoryId!]: e.target.value }))}
                  placeholder="+994 XX XXX XX XX"
                  className="bg-transparent text-foreground outline-none w-full h-full"
                />
                <Copy size={18} className="absolute right-4 text-[#94979c] cursor-pointer hover:text-[#00B4CC]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Ümumi əlaqə məlumatları</div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-5">
          <div className="self-stretch flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* E-poçt */}
            <div className="flex-1 w-full flex flex-col items-start gap-3">
              <div className="self-stretch relative leading-[24px]">E-Poçt</div>
              <div className="self-stretch h-[44px] rounded-lg bg-white border border-[#ececed] flex items-center p-[0px_12px] text-sm focus-within:border-[#00B4CC] transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@example.com"
                  className="bg-transparent font-semibold text-foreground outline-none w-full h-full"
                />
              </div>
            </div>
            {/* Ünvan */}
            <div className="flex-1 w-full flex flex-col items-start gap-3">
              <div className="self-stretch relative leading-[24px]">Ünvan</div>
              <div className="self-stretch h-[44px] rounded-lg bg-white border border-[#ececed] flex items-center p-[0px_12px] text-sm focus-within:border-[#00B4CC] transition-colors">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ünvan daxil edin"
                  className="bg-transparent text-foreground outline-none w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="self-stretch flex flex-col items-start gap-3">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-1">
          <div className="relative leading-[30px] font-semibold text-lg sm:text-xl">Xəritə</div>
        </div>
        <div className="h-48 w-full overflow-hidden rounded-xl border border-[#ececed] bg-[#fafafa]">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=49.7%2C40.35%2C50.0%2C40.45&layer=mapnik"
            className="h-full w-full"
            title="Bakı xəritəsi"
            loading="lazy"
          />
        </div>
      </div>

      {/* Save */}
      <div className="self-stretch flex items-center justify-end gap-3 border-t border-[#ececed] pt-5">
        <button
          onClick={handleSave}
          disabled={updateDetailsMutation.isPending}
          className="h-[52px] rounded-xl bg-[#00B4CC] px-8 text-base font-semibold text-white hover:bg-[#008799] transition-colors flex items-center justify-center gap-2"
        >
          {updateDetailsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Yadda saxla
        </button>
      </div>
    </div>
  )
}
