"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { TrainerDetailsModal } from "../modals/trainer-details-modal";
import { useState, useRef, useEffect } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainersQuery, useDeleteTrainer } from "@/lib/query/trainers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TrainersTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { gymId } = useGymStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: apiData, isLoading: apiLoading, refetch } = useGymTrainersQuery(
    Number(gymId) || 0,
    1,
    100,
    "DESC",
    { enabled: !!gymId }
  );

  const { mutate: deleteTrainer } = useDeleteTrainer(Number(gymId) || 1);

  const handleDelete = (trainerId: string) => {
    if (!window.confirm("Bu məşqçini silmək istədiyinizə əminsiniz?")) return;
    deleteTrainer(Number(trainerId), {
      onSuccess: () => {
        toast.success("Məşqçi silindi");
        refetch();
      },
      onError: () => toast.error("Xəta baş verdi"),
    });
    setOpenMenuId(null);
  };

  const trainers = (apiData as { items?: any[] })?.items ?? [];

  return (
    <div className="flex flex-col gap-6 py-4 w-full font-sans">
      {/* Search & Add Button Header */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="flex-1 w-full lg:w-[846px] h-12 bg-white rounded-xl border border-[#ececed] flex items-center px-6 py-1.5 gap-3 shadow-sm focus-within:border-[#00B4CC] transition-colors">
          <Image src="/search.svg" width={24} height={24} alt="search" className="shrink-0 opacity-50" />
          <input 
            type="text" 
            placeholder="Ad/Soyad , Zal , Telefon üzrə axtarış....." 
            className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#94979c]" 
          />
        </div>

        <button 
          onClick={() => setShowAdd(true)} 
          className="h-12 w-full lg:w-[193px] flex items-center justify-center gap-3 bg-[#00B4CC] text-white px-6 rounded-xl text-base font-medium hover:bg-[#009DB3] transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="leading-[24px]">Məşqçi əlavə et</span>
          <div className="h-6 w-6 relative">
            <Image src="/trainer-add.svg" width={24} height={24} alt="plus" />
          </div>
        </button>
      </div>

      {/* Table / Empty State */}
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] overflow-hidden min-h-[175px] flex flex-col">
        {apiLoading ? (
          <div className="flex-1 py-20 flex justify-center items-center text-slate-400">
            <Loader2 className="animate-spin mr-2" /> Məşqçilər yüklənir...
          </div>
        ) : trainers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-2 text-center font-sans">
            <div className="h-12 w-12 relative mb-2">
              <Image src="/no-trainer.svg" fill className="opacity-20 object-contain" alt="No Trainer" />
            </div>
            <div className="self-stretch text-[16px] leading-[24px] font-medium text-[#6a7282]">
              Hələ ki, məşqçi yoxdur
            </div>
            <div className="self-stretch text-[14px] leading-[18px] text-[#99a1af]">
              Yeni məşqçi əlavə etmək üçün yuxarıdakı düyməni sıxın
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1000px] flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-[1fr_140px_220px_160px_80px] items-center px-8 py-5 bg-[rgba(0,180,204,0.15)] border-b border-[#ececed] text-sm font-bold text-[#101828]">
                <span className="opacity-60 uppercase">Ad / Soyad</span>
                <span className="opacity-60 uppercase">Telefon</span>
                <span className="opacity-60 uppercase">Email</span>
                <span className="opacity-60 uppercase text-center">Zal</span>
                <span className="opacity-60 uppercase text-right">Ətraflı</span>
              </div>

              <div className="flex flex-col bg-white divide-y divide-[#f2f4f7]">
                {trainers.map((t: any) => (
                  <div key={t.trainer_id} className="grid grid-cols-[1fr_140px_220px_160px_80px] items-center px-8 py-6 text-base hover:bg-slate-50/80 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 relative rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {t.picture ? (
                          <img src={t.picture} className="object-cover w-full h-full" alt="Trainer" />
                        ) : (
                          <div className="w-full h-full bg-[#00B4CC10] text-[#00B4CC] flex items-center justify-center font-bold text-xl uppercase italic">
                            {t.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="font-bold text-[#101828] group-hover:text-[#00B4CC] transition-colors">{t.name} {t.surname}</div>
                        <div className="text-sm font-medium text-slate-400">{t.profession?.name || "Məşqçi"}</div>
                      </div>
                    </div>
                    
                    <div className="font-medium text-slate-600">{t.phone || "—"}</div>
                    <div className="font-medium text-slate-500 truncate pr-4">{t.email || "—"}</div>
                    <div className="text-center font-bold text-slate-700">Test Gym</div>

                    <div className="flex justify-end relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === t.trainer_id ? null : t.trainer_id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Image src="/more.png" width={24} height={24} alt="more" className="object-contain" />
                      </button>

                      {openMenuId === t.trainer_id && (
                        <div ref={menuRef} className="absolute right-0 top-12 z-[100] w-[180px] bg-white rounded-xl shadow-2xl border border-slate-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => { setShowDetails(t); setOpenMenuId(null); }}
                            className="w-full h-11 flex items-center px-4 hover:bg-slate-50 transition-colors gap-3 font-medium text-slate-700"
                          >
                            <Image src="/Eye.png" width={18} height={18} alt="View" />
                            <span>Məlumatlara bax</span>
                          </button>
                          <div className="h-px bg-slate-100 mx-2" />
                          <button 
                            onClick={() => handleDelete(t.trainer_id)}
                            className="w-full h-11 flex items-center px-4 text-red-600 hover:bg-red-50 transition-colors gap-3 font-medium"
                          >
                            <Image src="/trash.png" width={18} height={18} alt="Delete" />
                            <span>Məşqçini sil</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} isDashboard={true} />}
      {showDetails && <TrainerDetailsModal trainer={showDetails} onClose={() => setShowDetails(null)} />}
    </div>
  );
}
