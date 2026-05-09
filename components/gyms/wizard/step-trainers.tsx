"use client";

import { Plus, Search, Loader2 } from "lucide-react";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { useState } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useAddTrainer } from "@/lib/query/add-trainer-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function StepTrainers({ onNext }: { onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const { gymId, step2Trainers, removeStep2Trainer } = useGymStore();
  const { mutate, isPending: isSaving } = useAddTrainer();

  const handleNext = () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");

    mutate(
      {
        id: Number(gymId),
        names: step2Trainers.map((t) => t.name),
        surnames: step2Trainers.map((t) => t.surname),
        professionIds: step2Trainers.map((t) => Number(t.professionId)),
        emails: step2Trainers.map((t) => t.email),
        phones: step2Trainers.map((t) => t.phone),
        photos: step2Trainers.map((t) => t.photo),
      },
      {
        onSuccess: () => {
          toast.success("Məşqçilər uğurla yadda saxlanıldı");
          useGymStore.setState({ step2Trainers: [] });
          onNext();
        },
        onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
      }
    );
  };

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Məşqçi axtar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border outline-none focus:border-[#00B4CC] bg-card transition-colors"
          />
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#00B4CC] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#009DB3] transition-colors"
        >
          Məşqçi əlavə et
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-base font-bold leading-none">+</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#00B4CC14] border-b border-border">
            <tr>
              <th className="px-6 py-3.5 text-[11px] font-bold text-foreground uppercase tracking-wider">Ad / Soyad</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-foreground uppercase tracking-wider">Telefon</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-foreground uppercase tracking-wider">E-poçt</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-foreground uppercase tracking-wider text-right">Detallı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {step2Trainers.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">Hələ ki məşqçi əlavə edilməyib</td></tr>
            ) : (
              step2Trainers.map((t, idx) => (
                <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                      {t.preview ? <img src={t.preview} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-muted-foreground">{t.name[0]}</span>}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{t.name} {t.surname}</p>
                      <p className="text-[11px] text-[#00B4CC] font-semibold">{t.professionName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.phone}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => removeStep2Trainer(idx)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleNext}
          disabled={isSaving}
          className="w-[344px] py-4 rounded-xl font-bold bg-[#00B4CC] text-white hover:bg-[#009DB3] disabled:opacity-50 transition-all shadow-lg shadow-[#00B4CC20]"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}
          Növbəti
        </button>
      </div>

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
