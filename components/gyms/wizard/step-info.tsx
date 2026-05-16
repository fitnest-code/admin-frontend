"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useCategories, useValidateGymStep1 } from "@/lib/query/gym-query";
import { GymStep1Payload } from "@/lib/types/gym";
import { toast } from "sonner";
import Image from "next/image";

type Lang = "Az" | "Ru" | "En";

export function StepInfo({ onNext }: { onNext: () => void }) {
  const { step1Data, setStep1Data } = useGymStore();
  
  const [lang, setLang] = useState<Lang>("Az");
  const [categoryId, setCategoryId] = useState<number | null>(step1Data?.categoryId || null);
  const [name, setName] = useState(step1Data?.name || "");
  const [about, setAbout] = useState(step1Data?.description || "");
  const [phone, setPhone] = useState(step1Data?.phone || "");
  const [email, setEmail] = useState(step1Data?.email || "");

  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(new Set(step1Data?.lessonTypeIds || []));

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const validateStep1 = useValidateGymStep1();

  const selectedCategory = categoriesData?.items?.find((c) => c.id === categoryId);

  const toggleLessonType = (id: number) => {
    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildPayload = (): GymStep1Payload => ({
    categoryId: categoryId!,
    name,
    description: about,
    phone,
    email: email.trim() === "" ? null : email.trim(),
    lessonTypeIds: Array.from(selectedLessonTypeIds),
  });

  const validateLocal = () => {
    if (!categoryId || !name || !phone) {
      toast.error("Zəhmət olmasa ulduzlu məlumatları doldurun");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateLocal()) return;

    try {
      const payload = buildPayload();
      await validateStep1.mutateAsync(payload);
      setStep1Data(payload);
      onNext();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Məlumatlar yanlışdır");
    }
  };

  const isSaving = validateStep1.isPending;

  return (
    <div className="flex flex-col gap-8 font-sans text-black animate-in fade-in duration-500">
      {/* Zal Məlumatları Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px]">Zal məlumatları</h2>
          <div className="flex items-center gap-6 text-[14px] text-center">
            {(["Az", "Ru", "En"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "px-1 pb-1 transition-all duration-300",
                  lang === l ? "border-b border-[#00B4CC] text-black" : "text-black/40"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Category Select */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">Kateqoriya</label>
            <div className="relative h-[44px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg flex items-center px-4">
              <select 
                className="w-full h-full bg-transparent outline-none appearance-none text-[15px] cursor-pointer font-medium"
                value={categoryId || ""}
                onChange={(e) => {
                  setCategoryId(Number(e.target.value));
                  setSelectedLessonTypeIds(new Set());
                }}
              >
                <option value="" disabled>Kateqoriya</option>
                {categoriesData?.items?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none">
                 <ChevronDown size={18} className="text-black/60" />
              </div>
            </div>
          </div>

          {/* Lesson Types Grid (Növlər) */}
          {selectedCategory?.lessonTypes && selectedCategory.lessonTypes.length > 0 && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">Dərs növləri</label>
              <div className="w-full flex flex-wrap items-center gap-3">
                {selectedCategory.lessonTypes.map((lt) => {
                  const isSelected = selectedLessonTypeIds.has(lt.id);
                  return (
                    <div
                      key={lt.id}
                      onClick={() => toggleLessonType(lt.id)}
                      className={`flex-[1_1_calc(50%-8px)] sm:flex-none min-w-[120px] h-[48px] rounded-[8px] flex items-center justify-center px-4 cursor-pointer select-none transition-all duration-200 ${
                        isSelected 
                          ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc] text-[#00b4cc] font-medium" 
                          : "bg-[#fafafa] border border-[#ececed] text-[#101828] hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <span className="text-[14px] leading-[20px] truncate">{lt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gym Name */}
          <div className="flex flex-col gap-2">
             <label className="text-[14px] leading-[20px] text-black/60 font-medium">Zal adı</label>
             <input 
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Zal adı"
               className="h-[44px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg px-4 text-[15px] outline-none placeholder:text-black/40 font-medium"
             />
          </div>

          {/* About */}
          <div className="flex flex-col gap-2">
             <label className="text-[14px] leading-[20px] text-black/60 font-medium">Haqqında</label>
             <textarea 
               value={about}
               onChange={(e) => setAbout(e.target.value)}
               placeholder="Haqqında"
               className="h-[80px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg p-4 text-[15px] outline-none resize-none placeholder:text-black/40 font-medium"
             />
          </div>
        </div>
      </div>

      {/* Əlaqə Section */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-[#ececed] pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px]">Əlaqə</h2>
        </div>
        
        <div className="flex flex-col gap-4">
           <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">Telefon nömrəsi</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+994 00 000 00 00"
                className="h-[44px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg px-4 text-[15px] font-semibold outline-none placeholder:text-black/40"
              />
           </div>
           
           <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">E-Poçt</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asss@gmail.com"
                className="h-[44px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg px-4 text-[15px] font-semibold outline-none placeholder:text-black/40"
              />
           </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button 
          onClick={() => {
            const { resetStep1Data } = useGymStore.getState();
            resetStep1Data();
            setCategoryId(null);
            setName("");
            setAbout("");
            setPhone("");
            setEmail("");
            setSelectedLessonTypeIds(new Set());
          }}
          className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
        >
          Sıfırla
        </button>
        <button 
          onClick={handleNext}
          disabled={isSaving}
          className="h-[40px] w-[240px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>
    </div>
  );
}
