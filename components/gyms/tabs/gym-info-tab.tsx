"use client";

import { useState, useEffect } from "react"; // useEffect əlavə etdik
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useCategories, useCreateGymStep1 } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { CategorySelect } from "../components/CategorySelect";
import { InputField } from "../components/InputField";

type Lang = "Az" | "Ru" | "En";

export function GymInfoTab({ onNext }: { onNext?: () => void }) {
  const [lang, setLang] = useState<Lang>("Az");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [contractPrice, setContractPrice] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { gymId, setGymId } = useGymStore();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const createStep1 = useCreateGymStep1();

  useEffect(() => {
    if (gymId) {
      console.log( gymId);
    }
  }, [gymId]);

  const buildPayload = () => ({
    categoryId: categoryId!,
    name,
    dailyPrice: Number(dailyPrice),
    contractPrice: Number(contractPrice),
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

  const handleSaveOnly = async () => {
    if (gymId) {
      console.log(gymId);
      toast.success("Məlumatlar artıq yadda saxlanılıb");
      return;
    }

    if (!validate()) return;

    try {
      const result = await createStep1.mutateAsync(buildPayload());
      
      if (result?.id) {
        console.log( result);
        console.log( result.id);
        
        setGymId(Number(result.id));
        toast.success("Zal uğurla yaradıldı");
      }
    } catch (err: any) {
      console.error("%cAPI XƏTASI:", "color: #ef4444; font-weight: bold;", err);
      toast.error(err?.message || "Xəta baş verdi");
    }
  };

  const handleNext = async () => {
    if (gymId) {
      console.log("%cKEÇİD EDİLİR (ID VAR):", "color: #00B4CC; font-weight: bold;", gymId);
      onNext?.();
      return;
    }

    if (!validate()) return;

    try {
      const result = await createStep1.mutateAsync(buildPayload());
      
      // 3. Növbətiyə basanda da konsolda görək
      if (result?.id) {
        console.log("%cYARADILDI VƏ KEÇİD EDİLİR. ID:", "color: #22c55e; font-weight: bold;", result.id);
        setGymId(Number(result.id));
        onNext?.();
      }
    } catch (err: any) {
      console.error("%cKEÇİD XƏTASI:", "color: #ef4444; font-weight: bold;", err);
      toast.error("Zal yaradılarkən xəta baş verdi");
    }
  };

  const isSaving = createStep1.isPending;
  const canSubmit = !!categoryId && !!name && !!phone && !isSaving;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 bg-slate-50/50">
          <h2 className="text-[18px] font-bold text-slate-800">
            Zal məlumatları {gymId && <span className="text-[#00B4CC] text-xs font-bold bg-[#00B4CC10] px-2 py-0.5 rounded-md ml-2">ID: {gymId}</span>}
          </h2>
          {/* Dillər hissəsi eynidir */}
          <div className="flex gap-3">
            {(["Az", "Ru", "En"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "text-sm font-semibold pb-0.5 transition-all outline-none",
                  lang === l ? "border-b-2 border-[#00B4CC] text-[#00B4CC]" : "text-slate-400"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 divide-y border-t border-slate-100">
          <CategorySelect value={categoryId} onChange={setCategoryId} data={categoriesData} loading={categoriesLoading} />
          <InputField label="Zal adı *" value={name} onChange={setName} placeholder="Məs: FitNest" />
          <InputField label="Günlük qiymət" type="number" value={dailyPrice} onChange={setDailyPrice} placeholder="20 AZN" />
          <InputField label="Müqavilə qiyməti" type="number" value={contractPrice} onChange={setContractPrice} placeholder="50 AZN" />
          
          <div className="flex flex-col gap-1.5 py-4">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Haqqında</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="Zal haqqında qısa məlumat..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#00B4CC] transition-all"
            />
          </div>

          <InputField label="Telefon *" type="tel" value={phone} onChange={setPhone} placeholder="+994 50 000 00 00" />
          <InputField label="E-poçt" type="email" value={email} onChange={setEmail} placeholder="gym@info.az" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleSaveOnly}
          disabled={!canSubmit || isSaving}
          className="px-10 py-3 rounded-xl border-2 border-[#00B4CC] font-bold text-[#00B4CC] hover:bg-[#00B4CC0A] transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Yadda saxla
        </button>
        
        <button
          onClick={handleNext}
          disabled={isSaving || (!gymId && !canSubmit)} 
          className={cn(
            "px-10 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#00B4CC20]",
            "bg-[#00B4CC] text-white hover:bg-[#009DB3]"
          )}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {gymId ? "Növbəti" : "Növbəti"}
        </button>
      </div>
    </div>
  );
}