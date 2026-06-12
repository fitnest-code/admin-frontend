'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import Image from "next/image"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useProfessionsQuery } from "@/lib/query/add-trainer-query"
import { useUpdateTrainer } from "@/lib/query/trainers"
import { useCategories, useGymDetailsAdmin } from "@/lib/query/gym-query"
import { InputField } from "../components/InputField"
import { useGymStore } from "@/lib/store/gym-store"

interface TrainerDetailsModalProps {
  trainer: any
  onClose: () => void
}

export function TrainerDetailsModal({ trainer, onClose }: TrainerDetailsModalProps) {
  const { gymId } = useGymStore()
  
  const [data, setData] = useState({
    name: trainer.name || '',
    surname: trainer.surname || '',
    professionId: trainer.profession?.id?.toString() || String(trainer.professionId || ''),
    phone: trainer.phone || '',
    email: trainer.email || '',
  })
  
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(trainer.picture || null)
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(
    new Set(trainer.lessonTypeIds || [])
  )

  const queryClient = useQueryClient()
  const { data: professions } = useProfessionsQuery()
  const { mutate: updateTrainer, isPending } = useUpdateTrainer(gymId || 1) // Using 1 as fallback or get from store
  const { data: categoriesData } = useCategories()
  const { data: gymDetails } = useGymDetailsAdmin(gymId)

  const activeCategoryId = gymDetails?.categoryId
  const selectedCategory = categoriesData?.items?.find((c: any) => c.id === activeCategoryId)

  const toggleLessonType = (ltId: number) => {
    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev)
      if (next.has(ltId)) {
        next.delete(ltId)
      } else {
        next.add(ltId)
      }
      return next
    })
  }

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Yalnız JPG, PNG və WEBP formatında şəkil seçə bilərsiniz")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Şəkil ölçüsü maksimum 2MB olmalıdır")
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.name || !data.surname) {
      return toast.error("Zəhmət olmasa Ad və Soyad sahələrini doldurun.")
    }

    updateTrainer(
      {
        trainerId: trainer.trainer_id || trainer.id,
        data: {
          name: data.name,
          surname: data.surname,
          professionId: data.professionId ? Number(data.professionId) : undefined,
          phone: data.phone,
          email: data.email,
          ...(selectedFile && { photo: selectedFile }),
          lessonTypeIds: Array.from(selectedLessonTypeIds),
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["gym-trainers"] })
          onClose()
        },
        onError: () => {
          toast.error("Məşqçi məlumatlarını yeniləyərkən xəta baş verdi")
        }
      }
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[800px] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-hidden flex flex-col p-6 gap-[34px] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="w-full flex flex-col items-start">
          <div className="w-full h-12 flex items-center justify-between">
            <div className="flex-1 text-[24px] font-semibold text-[#101828] font-['SF_Pro']">Məşqçi detalları</div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-[#6a7282]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-[34px]">
          <div className="w-full flex flex-col md:flex-row gap-5 items-start">
            
            {/* Photo Section */}
            <div className="flex flex-col items-start gap-3 w-full md:w-[444px]">
              <div className="w-full text-[18px] leading-[28px] text-black">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-4">
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[308px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative cursor-pointer flex items-center justify-center overflow-hidden hover:border-[#00B4CC] transition-colors"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Trainer" />
                  ) : (
                    <div className="text-[#6a7282] font-medium flex flex-col items-center gap-2">
                      <Image src="/upload.svg" width={32} height={32} alt="Upload" />
                      <span>Şəkil yüklə</span>
                    </div>
                  )}
                </div>
                <div className="text-[14px] leading-5 tracking-[-0.15px] text-[#6a7282]">JPG or PNG • Max size 2MB</div>
              </div>
            </div>

            {/* Inputs Right Section */}
            <div className="flex flex-col w-full md:w-auto md:flex-1 gap-3">
              <div className="w-full flex flex-col items-start gap-3">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Ad</div>
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={e => setData({...data, name: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                  placeholder="Məs: Aysel"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-3 mt-1">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Soyad</div>
                <input 
                  type="text" 
                  value={data.surname} 
                  onChange={e => setData({...data, surname: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                  placeholder="Məs: Quliyeva"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-3 mt-1">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Növ</div>
                <select 
                  value={data.professionId} 
                  onChange={e => setData({...data, professionId: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC] appearance-none" 
                >
                  <option value="">İxtisas seçin</option>
                  {professions?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5 mt-2">
            <div className="flex flex-col items-start gap-3 w-full md:w-[48%]">
              <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Telefon nömrəsi</div>
              <input 
                type="text" 
                value={data.phone} 
                onChange={e => setData({...data, phone: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                placeholder="+994 50 578 56 56"
              />
            </div>
            <div className="flex flex-col items-start gap-3 w-full md:w-[48%]">
              <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">E-Poçt</div>
              <input 
                type="text" 
                value={data.email} 
                onChange={e => setData({...data, email: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                placeholder="aysel.quliyeva@gmail.com"
              />
            </div>
          </div>

          {/* Lesson Types Grid (Növlər) */}
          {selectedCategory?.lessonTypes && selectedCategory.lessonTypes.length > 0 && (
            <div className="flex flex-col items-start gap-3 w-full animate-in fade-in duration-300">
              <label className="text-[16px] leading-[24px] font-semibold text-black">Dərs növləri</label>
              <div className="w-full flex flex-wrap items-center justify-start gap-3">
                {selectedCategory.lessonTypes.map((lt: any) => {
                  const isSelected = selectedLessonTypeIds.has(lt.id);
                  return (
                    <div
                      key={lt.id}
                      onClick={() => toggleLessonType(lt.id)}
                      className={`w-fit h-[48px] rounded-[8px] inline-flex items-center justify-start px-4 cursor-pointer select-none transition-all duration-200 ${
                        isSelected 
                          ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc] text-[#00b4cc] font-medium shadow-sm" 
                          : "bg-[#fafafa] border border-[#ececed] text-[#101828] hover:border-gray-300"
                      }`}
                    >
                      <span className="text-[16px] leading-[24px]">{lt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="w-full flex justify-center mt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className={`w-[280px] h-12 rounded-[10px] flex items-center justify-center px-4 font-medium text-[16px] text-white transition-colors 
                ${isPending ? 'bg-[#c1c1cc]' : 'bg-[#00B4CC] hover:bg-[#009DB3]'}`}
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : "Yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
