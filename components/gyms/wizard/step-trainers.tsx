"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, MoreVertical, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useAddTrainer } from "@/lib/query/add-trainer-query";
import { toast } from "sonner";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { EditTrainerModal } from "../modals/edit-trainer-modal";

export function StepTrainers({ onNext }: { onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<{ trainer: any, index: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { gymId, step2Trainers, removeStep2Trainer } = useGymStore();
  const { mutate, isPending: isSaving } = useAddTrainer();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");
    
    if (step2Trainers.length === 0) {
      onNext();
      return;
    }

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
    <div className="flex flex-col gap-9 font-sans text-black min-h-[500px]">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
        <h2 className="text-[20px] font-semibold leading-[30px]">Məşqçilər</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="h-12 px-6 bg-[#00B4CC] rounded-[12px] flex items-center justify-center gap-3 text-white text-[16px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <span>Məşqçi əlavə et</span>
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* Trainers Table */}
      <div className="flex flex-col w-full overflow-visible border border-[#ececed] rounded-[12px] shadow-sm bg-white">
        {/* Table Head */}
        <div className="grid grid-cols-[200px_140px_1fr_80px] items-center bg-[#00B4CC26] border-b border-[#CECFD2] px-6 py-5">
          <div className="text-[16px] leading-[24px]">Ad / Soyad</div>
          <div className="text-[16px] leading-[24px]">Telefon</div>
          <div className="text-[16px] leading-[24px]">Email</div>
          <div className="text-[16px] leading-[24px] text-center">Ətraflı</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {step2Trainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/40">
               <p className="text-[16px]">Hələ ki məşqçi əlavə edilməyib</p>
            </div>
          ) : (
            step2Trainers.map((t, idx) => (
              <div key={idx} className="grid grid-cols-[200px_140px_1fr_80px] items-center px-6 py-4 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors">
                {/* Ad / Soyad */}
                <div className="flex items-center gap-3 overflow-hidden mr-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 relative overflow-hidden shadow-sm">
                    {t.preview ? (
                      <Image src={t.preview} fill alt={t.name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                        {t.name[0]}{t.surname[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[14px] leading-[18px] font-semibold text-black truncate">{t.name} {t.surname}</span>
                    <span className="text-[12px] leading-[16px] text-[#94979C] truncate">{t.professionName}</span>
                  </div>
                </div>

                {/* Telefon */}
                <div className="text-[14px] leading-[20px] font-medium text-black">
                  {t.phone}
                </div>

                {/* Email */}
                <div className="text-[14px] leading-[20px] font-medium text-black truncate pr-4">
                  {t.email}
                </div>

                {/* Actions */}
                <div className="relative flex items-center justify-center">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveMenu(activeMenu === idx ? null : idx);
                     }}
                     className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors group"
                   >
                      <Image 
                        src="/more.png" 
                        width={24} 
                        height={24} 
                        alt="More" 
                        className="opacity-60 group-hover:opacity-100 transition-opacity" 
                      />
                   </button>

                   {/* Dropdown Menu */}
                   {activeMenu === idx && (
                     <div 
                       ref={menuRef}
                       className="absolute right-full top-0 mt-0 mr-2 w-[160px] h-[91px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-in fade-in zoom-in duration-150 overflow-hidden"
                     >
                       {/* Bax Button */}
                       <button 
                         className="flex-1 flex items-center gap-2 px-4 hover:bg-[#F9FAFB] transition-colors group"
                         onClick={() => {
                            setEditingTrainer({ trainer: t, index: idx });
                            setActiveMenu(null);
                         }}
                       >
                         <div className="w-4 h-4 flex items-center justify-center">
                           <Eye size={16} className="text-[#364153]" />
                         </div>
                         <span className="text-[14px] font-sans text-[#364153]">Bax</span>
                       </button>

                       {/* Divider */}
                       <div className="h-[1px] bg-[#F3F4F6] w-full" />

                       {/* Ləğv et Button */}
                       <button 
                         className="flex-1 flex items-center gap-2 px-4 hover:bg-[#F9FAFB] transition-colors group"
                         onClick={() => {
                           removeStep2Trainer(idx);
                           setActiveMenu(null);
                         }}
                       >
                         <div className="w-4 h-4 flex items-center justify-center">
                           <Trash2 size={16} className="text-[#E7000B]" />
                         </div>
                         <span className="text-[14px] font-sans text-[#E7000B]">Ləğv et</span>
                       </button>
                     </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={handleNext}
          disabled={isSaving}
          className="h-[48px] w-[280px] rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} />}
      {editingTrainer && (
        <EditTrainerModal 
          trainer={editingTrainer.trainer} 
          index={editingTrainer.index} 
          onClose={() => setEditingTrainer(null)} 
        />
      )}
    </div>
  );
}
