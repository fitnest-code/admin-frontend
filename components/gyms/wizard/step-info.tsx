"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useCategories, useCreateGymStep1 } from "@/lib/query/gym-query";
import { toast } from "sonner";
import Image from "next/image";

type Lang = "Az" | "Ru" | "En";

export function StepInfo({ onNext }: { onNext: () => void }) {
  const [lang, setLang] = useState<Lang>("Az");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { gymId, setGymId } = useGymStore();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const createStep1 = useCreateGymStep1();

  const buildPayload = () => ({
    categoryId: categoryId!,
    name,
    description: about,
    phone,
    email,
  });

  const validate = () => {
    if (!categoryId || !name || !phone) {
      toast.error("Zəhmət olmasa ulduzlu məlumatları doldurun");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (gymId) {
      onNext();
      return;
    }

    if (!validate()) return;

    try {
      const result = await createStep1.mutateAsync(buildPayload());
      if (result?.gymId) {
        setGymId(Number(result.gymId));
        onNext();
      }
    } catch (err: any) {
      toast.error("Zal yaradılarkən xəta baş verdi");
    }
  };

  const isSaving = createStep1.isPending;

  return (
    <div className="flex flex-col gap-14 font-sans text-black">
      {/* Zal Məlumatları Section */}
      <div className="flex flex-col gap-7">
        <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
          <h2 className="text-[20px] font-semibold leading-[30px]">Zal məlumatları</h2>
          <div className="flex items-center gap-[34px] text-[16px] text-center">
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

        <div className="flex flex-col gap-5">
          {/* Category Select */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] leading-[24px]">Kateqoriya</label>
            <div className="relative h-[60px] w-full bg-[#fafafa] border border-[#ececed] rounded-[12px] flex items-center px-4">
              <select 
                className="w-full h-full bg-transparent outline-none appearance-none text-[18px] cursor-pointer"
                value={categoryId || ""}
                onChange={(e) => setCategoryId(Number(e.target.value))}
              >
                <option value="" disabled>Kateqoriya</option>
                {categoriesData?.items?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none">
                 <ChevronDown size={24} className="text-black/60" />
              </div>
            </div>
          </div>

          {/* Gym Name */}
          <div className="flex flex-col gap-3">
             <label className="text-[16px] leading-[24px]">Zal adı</label>
             <input 
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Zal adı"
               className="h-[60px] w-full bg-[#fafafa] border border-[#ececed] rounded-[12px] px-4 text-[18px] outline-none placeholder:text-black/40"
             />
          </div>

          {/* About */}
          <div className="flex flex-col gap-3">
             <label className="text-[16px] leading-[24px]">Haqqında</label>
             <textarea 
               value={about}
               onChange={(e) => setAbout(e.target.value)}
               placeholder="Haqqında"
               className="h-[100px] w-full bg-[#fafafa] border border-[#ececed] rounded-[12px] p-4 text-[18px] outline-none resize-none placeholder:text-black/40"
             />
          </div>
        </div>
      </div>

      {/* Əlaqə Section */}
      <div className="flex flex-col gap-7">
        <div className="border-b border-[#ececed] pb-1">
          <h2 className="text-[20px] font-semibold leading-[30px]">Əlaqə</h2>
        </div>
        
        <div className="flex flex-col gap-5">
           <div className="flex flex-col gap-3">
              <label className="text-[16px] leading-[24px]">Telefon nömrəsi</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+994 00 000 00 00"
                className="h-[60px] w-full bg-[#fafafa] border border-[#ececed] rounded-[12px] px-4 text-[18px] font-semibold outline-none placeholder:text-black/40"
              />
           </div>
           
           <div className="flex flex-col gap-3">
              <label className="text-[16px] leading-[24px]">E-Poçt</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asss@gmail.com"
                className="h-[60px] w-full bg-[#fafafa] border border-[#ececed] rounded-[12px] px-4 text-[18px] font-semibold outline-none placeholder:text-black/40"
              />
           </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end mt-4">
        <button 
          onClick={handleNext}
          disabled={isSaving}
          className="h-[48px] w-[280px] rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>
    </div>
  );
}
