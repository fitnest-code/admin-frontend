"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, MoreVertical, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep2 } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { EditTrainerModal } from "../modals/edit-trainer-modal";

export function StepTrainers({ onNext }: { onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<{ trainer: any, index: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { step2Trainers, removeStep2Trainer } = useGymStore();
  const validateStep2 = useValidateGymStep2();

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

  const handleNext = async () => {
    if (step2Trainers.length === 0) {
      onNext();
      return;
    }

    try {
      const formData = new FormData();
      step2Trainers.forEach((t) => {
        formData.append("names", t.name);
        formData.append("surnames", t.surname);
        formData.append("professionIds", t.professionId);
        formData.append("emails", t.email);
        formData.append("phones", t.phone);
        formData.append("lessonTypesPerTrainer", t.lessonTypeIds?.join(",") || "");
        if (t.photo) {
          formData.append("photos", t.photo);
        }
      });

      await validateStep2.mutateAsync(formData);
      onNext();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Məşqçi məlumatları yanlışdır");
    }
  };

  const isSaving = validateStep2.isPending;

  return (
    <div className="flex flex-col gap-9 font-sans text-black min-h-[500px]">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
        <h2 className="text-[18px] font-semibold leading-[28px]">Məşqçilər</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="h-[40px] px-5 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2 text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
        >
          <span>Məşqçi əlavə et</span>
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Trainers Table */}
      <div className="flex flex-col w-full overflow-visible border border-[#ececed] rounded-[12px] shadow-sm bg-white">
        {/* Table Head */}
        <div className="grid grid-cols-[200px_140px_1fr_80px] items-center bg-[#00B4CC26] border-b border-[#CECFD2] px-6 py-3">
          <div className="text-[14px] leading-[20px] font-bold">Ad / Soyad</div>
          <div className="text-[14px] leading-[20px] font-bold">Telefon</div>
          <div className="text-[14px] leading-[20px] font-bold">Email</div>
          <div className="text-[14px] leading-[20px] font-bold text-center">Ətraflı</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {step2Trainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/40">
               <p className="text-[16px]">Hələ ki məşqçi əlavə edilməyib</p>
            </div>
          ) : (
            step2Trainers.map((t, idx) => (
              <div key={idx} className="grid grid-cols-[200px_140px_1fr_80px] items-center px-6 py-3 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors">
                {/* Ad / Soyad */}
                <div className="flex items-center gap-3 overflow-hidden mr-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 relative overflow-hidden shadow-sm">
                    {t.preview ? (
                      <Image src={t.preview} fill alt={t.name} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                        {t.name[0]}{t.surname[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] leading-[18px] font-semibold text-black truncate">{t.name} {t.surname}</span>
                    <span className="text-[11px] leading-[14px] text-[#94979C] truncate">{t.professionName}</span>
                  </div>
                </div>

                {/* Telefon */}
                <div className="text-[13px] leading-[20px] font-medium text-black">
                  {t.phone}
                </div>

                {/* Email */}
                <div className="text-[13px] leading-[20px] font-medium text-black truncate pr-4">
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
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            const { resetStep2Trainers } = useGymStore.getState();
            resetStep2Trainers();
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
