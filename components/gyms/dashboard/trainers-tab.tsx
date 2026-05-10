"use client";

import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { TrainerDetailsModal } from "../modals/trainer-details-modal";
import { useState, useRef, useEffect } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainersQuery, useDeleteTrainer } from "@/lib/query/trainers";
import { toast } from "sonner";

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
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 h-12 bg-white rounded-xl border border-[#ececed] flex items-center px-4 gap-3">
          <Image src="/search.svg" width={24} height={24} alt="search" />
          <input 
            type="text" 
            placeholder="Ad/Soyad , Zal , Telefon üzrə axtarış....." 
            className="flex-1 bg-transparent text-[14px] text-[#94979c] outline-none placeholder:text-[#94979c]" 
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
        <div className="w-full h-[175px] rounded-xl bg-white flex flex-col items-center justify-center gap-2 text-center text-base text-[#6a7282]">
          <div className="w-12 h-12 relative">
            <Image src="/no-trainer.svg" alt="No Trainer" fill className="object-contain" />
          </div>
          <div className="self-stretch relative leading-[24px] font-medium text-[#6a7282]">
            Hələ ki, məşqçi yoxdur
          </div>
          <div className="self-stretch relative text-sm leading-[18px] text-[#99a1af]">
            Yeni məşqçi əlavə etmək üçün yuxarıdakı düyməni sıxın
          </div>
        </div>
      ) : (
        <div className="flex flex-col text-base text-black font-['SF_Pro'] rounded-xl shadow-sm">
          <div className="w-full rounded-t-xl bg-[#00B4CC26] border border-[#cecfd2] flex items-center justify-between px-6 py-5 gap-5">
            <div className="flex-1 leading-6">Ad / Soyad</div>
            <div className="w-32 leading-6">Telefon</div>
            <div className="w-48 leading-6 shrink-0">Email</div>
            <div className="w-32 leading-6">Zal</div>
            <div className="w-16 leading-6 text-right">Ətraflı</div>
          </div>
          <div className="flex flex-col w-full">
            {apiLoading ? (
              <div className="flex justify-center py-10 border-x border-b border-[#ececed] bg-white rounded-b-xl"><Loader2 className="animate-spin inline text-[#00B4CC]" /></div>
            ) : (
              trainers.map((t: any, index: number) => (
                <div key={t.trainer_id} className={`w-full h-[100px] bg-white border-x border-b border-[#ececed] flex items-center px-6 py-5 ${index === trainers.length - 1 ? 'rounded-b-xl' : ''}`}>
                  <div className="flex w-full items-center justify-between gap-5">
                    <div className="flex-1 flex items-center gap-[14px]">
                      <div className="h-[54px] w-[54px] relative rounded-full overflow-hidden shrink-0 border border-border">
                        {t.picture ? <img src={t.picture} className="object-cover w-full h-full" alt="Trainer" /> : <div className="w-full h-full bg-secondary/50 flex items-center justify-center font-bold text-muted-foreground">{t.name?.[0]}</div>}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="leading-6">{t.name} {t.surname}</div>
                        <div className="leading-6 text-[#94979c]">{t.profession?.name || "Məşqçi"}</div>
                      </div>
                    </div>
                    
                    <div className="w-32 leading-6">{t.phone || "Göstərilməyib"}</div>
                    
                    <div className="w-48 flex items-center shrink-0">
                      <div className="leading-6 truncate">{t.email || "Göstərilməyib"}</div>
                    </div>

                    <div className="w-32 flex items-center">
                      <div className="leading-6 truncate">Current Gym</div>
                    </div>

                    <div className="w-16 flex justify-end relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === t.trainer_id ? null : t.trainer_id)}
                        className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-slate-100 rounded"
                      >
                        <Image src="/more.png" width={24} height={24} alt="more" className="object-contain" />
                      </button>

                      {openMenuId === t.trainer_id && (
                        <div ref={menuRef} className="absolute right-8 top-0 z-10 w-[160px] bg-white rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] border border-[#e5e7eb] py-1 text-sm text-[#364153]">
                          <button 
                            onClick={() => { setShowDetails(t); setOpenMenuId(null); }}
                            className="w-full h-9 flex items-center px-4 hover:bg-gray-50 transition-colors gap-2"
                          >
                            <div className="w-4 h-4 flex items-center justify-center relative">
                              <Image src="/Eye.png" width={16} height={16} alt="View" className="object-contain" />
                            </div>
                            <span className="leading-[18px]">Bax</span>
                          </button>
                          <div className="w-full h-[0.6px] bg-[#f3f4f6]" />
                          <button 
                            onClick={() => handleDelete(t.trainer_id)}
                            className="w-full h-9 flex items-center px-4 text-[#e7000b] hover:bg-red-50 transition-colors gap-2"
                          >
                            <Image src="/trash.png" width={16} height={16} alt="Delete" />
                            <span className="leading-[20px] tracking-[-0.15px]">Ləğv et</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} isDashboard={true} />}
      {showDetails && <TrainerDetailsModal trainer={showDetails} onClose={() => setShowDetails(null)} />}
    </div>
  );
}
