'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymStore } from '@/lib/store/gym-store'
import { useCategories, useCreateGymStep1 } from '@/lib/query/gym-query'
import { toast } from 'sonner'
import { CategorySelect } from '../components/CategorySelect'
import { InputField } from '../components/InputField'


type Lang = 'Az' | 'Ru' | 'En'

interface GymInfoTabProps {
  isNew?: boolean
  onNext?: () => void
}

export function GymInfoTab({ isNew = false, onNext }: GymInfoTabProps) {
  const [lang, setLang] = useState<Lang>('Az')

  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [dailyPrice, setDailyPrice] = useState('')
  const [contractPrice, setContractPrice] = useState('')
  const [about, setAbout] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const setGymId = useGymStore((s) => s.setGymId)

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories()

  const createStep1 = useCreateGymStep1()

  async function handleSave() {
    if (!categoryId || !name) return

    try {
      const result = await createStep1.mutateAsync({
        categoryId,
        name,
        dailyPrice: Number(dailyPrice),
        contractPrice: Number(contractPrice),
        description: about,
        phone,
        email,
      })

      setGymId(result.id)
    } catch {
      toast.error('Zal məlumatları yadda saxlanarkən xəta baş verdi.')
    }
  }

  async function handleNext() {
    await handleSave()
    onNext?.()
  }

  const isSaving = createStep1.isPending
  const canSubmit = !!categoryId && !!name && !isSaving

  return (
    <div className="flex flex-col gap-4">

      <div className="rounded-xl border bg-white overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-[20px] font-semibold">Zal məlumatları</h2>

          <div className="flex gap-3">
            {(['Az', 'Ru', 'En'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  'text-sm font-medium pb-0.5',
                  lang === l
                    ? 'border-b-2 border-black'
                    : 'text-muted-foreground',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 divide-y">

          <CategorySelect
            value={categoryId}
            onChange={setCategoryId}
            data={categoriesData}
            loading={categoriesLoading}
          />

          <InputField
            label="Zal adı"
            value={name}
            onChange={setName}
            placeholder="Zal adı"
          />

          <InputField
            label="Zalın günlük qiyməti"
            type="number"
            value={dailyPrice}
            onChange={setDailyPrice}
            placeholder="20 AZN"
          />

          <InputField
            label="Müqavilə"
            type="number"
            value={contractPrice}
            onChange={setContractPrice}
            placeholder="Müqavilə qiyməti"
          />

          <div className="flex flex-col gap-1.5 py-3">
            <label className="text-xs text-muted-foreground">Haqqında</label>

            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC]"
            />
          </div>
        </div>
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-sm font-semibold">Əlaqə</h2>
        </div>

        <div className="px-4 pb-4 divide-y">

          <InputField
            label="Telefon"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+994 00 000 00 00"
          />

          <InputField
            label="E-poçt"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="example@gmail.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={!canSubmit}
          className="px-6 py-2 rounded-lg border"
        >
          {isSaving && <Loader2 className="inline mr-1 animate-spin" />}
          Yadda saxla
        </button>

        <button
          onClick={handleNext}
          disabled={!canSubmit}
          className="px-6 py-2 rounded-lg bg-[#00B4CC] text-white"
        >
          Növbəti
        </button>
      </div>
    </div>
  )
}