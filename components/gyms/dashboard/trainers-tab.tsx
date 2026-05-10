"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { TrainerDetailsModal } from "../modals/trainer-details-modal";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainers, useDeleteTrainer } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TrainersTab({ gym }: { gym?: any }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { gymId } = useGymStore();

  const initialTrainers = useMemo(() => {
    if (gym?.trainers) {
      return {
        items: gym.trainers,
        totalItems: gym.trainers.length,
        totalPages: 1,
        currentPage: 1
      };
    }
    return undefined;
  }, [gym]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: apiData, isLoading: apiLoading } = useGymTrainers(
    gymId || '',
    { page: 1, pageSize: 100, sort_dir: "DESC" },
    initialTrainers
  );
  
  const { mutate: deleteTrainerMutate } = useDeleteTrainer();

  const handleDelete = (trainerId: string | number) => {
    if (!gymId) return;
    if (!window.confirm("Bu məşqçini silmək istədiyinizə əminsiniz?")) return;
    deleteTrainerMutate({ gymId: Number(gymId), trainerId });
    setOpenMenuId(null);
  };

  const trainers = apiData?.items ?? [];

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
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] min-h-[175px] flex flex-col">
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
            <table className="w-full border-separate border-spacing-0">
              {/* Header */}
              <thead>
                <tr className="bg-[rgba(0,180,204,0.15)] h-[64px] text-[16px] font-bold text-black font-sans">
                  <th className="border-y border-l border-[#cecfd2] rounded-tl-[12px] pl-[108px] text-left whitespace-nowrap">Ad / Soyad</th>
                  <th className="border-y border-[#cecfd2] px-10 text-left whitespace-nowrap">Telefon</th>
                  <th className="border-y border-[#cecfd2] px-10 text-left whitespace-nowrap">Email</th>
                  <th className="border-y border-r border-[#cecfd2] rounded-tr-[12px] px-10 text-right whitespace-nowrap">Ətraflı</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white">
                {trainers.map((t: any, i: number) => (
                  <tr key={t.trainer_id || t.id || i} className="h-[100px] hover:bg-slate-50/80 transition-colors group font-sans border-b border-[#ececed]">
                    {/* Name Section */}
                    <td className="border-b border-l border-[#ececed] pl-10">
                      <div className="flex items-center gap-[14px]">
                        <div className="h-[54px] w-[54px] relative rounded-full overflow-hidden shrink-0">
                          {t.picture ? (
                            <img src={t.picture} className="object-cover w-full h-full" alt="Trainer" />
                          ) : (
                            <div className="w-full h-full bg-[#00B4CC10] text-[#00B4CC] flex items-center justify-center font-bold text-xl italic uppercase">
                              {t.name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <div className="font-bold text-black leading-[24px] group-hover:text-[#00B4CC] transition-colors whitespace-nowrap">
                            {t.name} {t.surname}
                          </div>
                          <div className="text-[14px] leading-[24px] text-[#94979c] whitespace-nowrap">
                            {t.profession?.name || "Məşqçi"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="border-b border-[#ececed] px-10">
                      <div className="font-medium text-black leading-[24px] whitespace-nowrap">
                        {t.phone || "+994 ** *** ** **"}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="border-b border-[#ececed] px-10">
                      <div className="font-medium text-black leading-[24px] whitespace-nowrap">
                        {t.email || "fitnest@gmail.com"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="border-b border-r border-[#ececed] px-10">
                      <div className="flex justify-end relative pr-4">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === t.trainer_id ? null : t.trainer_id)}
                          className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70"
                        >
                          <Image src="/more.png" width={24} height={24} alt="more" />
                        </button>

                        {openMenuId === t.trainer_id && (
                          <div ref={menuRef} className="absolute right-0 top-10 z-[100] w-[180px] bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200">
                            <button 
                              onClick={() => { setShowDetails(t); setOpenMenuId(null); }}
                              className="w-full h-11 flex items-center px-4 hover:bg-slate-50 transition-colors gap-3 font-medium text-slate-700 whitespace-nowrap"
                            >
                              <Image src="/Eye.png" width={18} height={18} alt="View" />
                              <span>Məlumatlara bax</span>
                            </button>
                            <div className="h-px bg-slate-100 mx-2" />
                            <button 
                              onClick={() => handleDelete(t.trainer_id)}
                              className="w-full h-11 flex items-center px-4 text-red-600 hover:bg-red-50 transition-colors gap-3 font-medium whitespace-nowrap"
                            >
                              <Image src="/trash.png" width={18} height={18} alt="Delete" />
                              <span>Məşqçini sil</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} isDashboard={true} />}
      {showDetails && <TrainerDetailsModal trainer={showDetails} onClose={() => setShowDetails(null)} />}
    </div>
  );
}
