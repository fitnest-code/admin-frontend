"use client";

import { Search, Loader2, Eye, Trash2 } from "lucide-react";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { useState } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainersQuery } from "@/lib/query/trainers";

export function TrainersTab() {
  const [showAdd, setShowAdd] = useState(false);
  const { gymId } = useGymStore();

  const { data: apiData, isLoading: apiLoading } = useGymTrainersQuery(
    Number(gymId) || 0,
    1,
    100,
    "DESC",
    { enabled: !!gymId }
  );

  const trainers = (apiData as { items?: any[] })?.items ?? [];

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

      {trainers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 14.5C9 14.5 3 14.5 3 17.5V20H21V17.5C21 14.5 15 14.5 12 14.5Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-6">Hələ ki məşqçi yoxdur</p>
          <button 
            onClick={() => setShowAdd(true)} 
            className="flex items-center gap-2 bg-[#00B4CC] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#009DB3] transition-colors shadow-lg shadow-[#00B4CC20]"
          >
            Məşqçi əlavə et
          </button>
        </div>
      ) : (
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
              {apiLoading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline text-[#00B4CC]" /></td></tr>
              ) : (
                trainers.map((t: any) => (
                  <tr key={t.trainer_id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary/50 flex items-center justify-center overflow-hidden">
                        {t.picture ? <img src={t.picture} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-muted-foreground">{t.name[0]}</span>}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{t.name} {t.surname}</p>
                        <p className="text-[11px] text-[#00B4CC] font-semibold">{t.profession?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.phone}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{t.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 text-muted-foreground hover:text-[#00B4CC] transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
