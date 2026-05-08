"use client";

import { useState } from "react";
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

  const buildPayload = () => ({
    categoryId: categoryId!,
    name,
    // dailyPrice: Number(dailyPrice),
    // contractPrice: Number(contractPrice),
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
    // Əgər artıq ID varsa, təkrar yaratmağa ehtiyac yoxdur (və ya Update API olmalıdır)
    if (gymId) {
      toast.success("Zal artıq yaradılıb (ID: " + gymId + ")");
      return;
    }

    if (!validate()) return;

    try {
      const result = await createStep1.mutateAsync(buildPayload());
      if (result?.gymId) {
        setGymId(Number(result.gymId));
        toast.success("Zal uğurla yaradıldı");
      }
    } catch (err: any) {
      toast.error(err?.message || "Xəta baş verdi");
    }
  };

  const handleNext = async () => {
    console.log("next")
    if (gymId) {
      onNext?.();
      return;
    }

    // Yaradılmayıbsa, əvvəl yarat, sonra keç
    if (!validate()) return;

    try {
      const result = await createStep1.mutateAsync(buildPayload());
      if (result?.gymId) {
        setGymId(Number(result.gymId));
        onNext?.();
      }
    } catch (err: any) {
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
          <div className="flex gap-3">
            {(["Az", "Ru", "En"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={cn("text-sm font-semibold pb-0.5 transition-all outline-none", lang === l ? "border-b-2 border-[#00B4CC] text-[#00B4CC]" : "text-slate-400")}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 divide-y border-t border-slate-100">
          <CategorySelect value={categoryId} onChange={setCategoryId} data={categoriesData} loading={categoriesLoading} />
          <InputField label="Zal adı *" value={name} onChange={setName} placeholder="Məs: FitNest" />
          <div className="flex flex-col gap-1.5 py-4">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Haqqında</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#00B4CC] transition-all"
            />
          </div>
          <InputField label="Telefon *" type="tel" value={phone} onChange={setPhone} placeholder="+994 50 000 00 00" />
          <InputField label="E-poçt" type="email" value={email} onChange={setEmail} placeholder="gym@info.az" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={handleSaveOnly} disabled={!canSubmit} className="px-10 py-3 rounded-xl border-2 border-[#00B4CC] font-bold text-[#00B4CC] hover:bg-[#00B4CC0A] disabled:opacity-50 flex items-center gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Yadda saxla
        </button>
        <button onClick={handleNext} className="px-10 py-3 rounded-xl font-bold bg-[#00B4CC] text-white hover:bg-[#009DB3] flex items-center gap-2">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>
    </div>
  );
}