"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { useGymTrainers, useDeleteTrainer } from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { AddTrainerModal } from "../../gyms/modals/add-trainer-modal";
import { EditTrainerModal } from "../../gyms/modals/edit-trainer-modal";
import { toast } from "sonner";

interface MesqcilerTabProps {
  gymId: string | number;
  zalName: string;
}

export function MesqcilerTab({ gymId, zalName }: MesqcilerTabProps) {
  const parsedGymId = Number(gymId);
  const { data: trainersData, isLoading } = useGymTrainers(parsedGymId);
  const deleteTrainerMutation = useDeleteTrainer();

  const { setGymId } = useGymStore();

  // Set store gymId to make sure helper query hooks in modals work natively
  useEffect(() => {
    setGymId(parsedGymId);
  }, [parsedGymId, setGymId]);

  const [showAdd, setShowAdd] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<{ trainer: any; index: number } | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (trainerId: string) => {
    try {
      await deleteTrainerMutation.mutateAsync({ gymId: parsedGymId, trainerId });
      toast.success("Məşqçi uğurla silindi");
      setActiveMenu(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Məşqçini silmək mümkün olmadı");
    }
  };

  const trainersList = trainersData?.items || [];

  return (
    <div className="flex flex-col gap-6 py-4 font-sans text-black animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#ececed] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#101828]">Məşqçilər siyahısı ({trainersList.length})</h3>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="h-[40px] px-5 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2 text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm shadow-[#00B4CC]/10"
        >
          <span>Məşqçi əlavə et</span>
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Məşqçilər yüklənir...</span>
        </div>
      ) : trainersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#ececed] rounded-2xl bg-[#fafafa] text-black/40 gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Plus size={20} className="text-slate-400" />
          </div>
          <p className="text-[15px] font-medium">Hələ ki məşqçi əlavə edilməyib</p>
        </div>
      ) : (
        <div className="flex flex-col w-full border border-[#ececed] rounded-xl overflow-visible bg-white shadow-sm">
          {/* Table Head */}
          <div className="grid grid-cols-[220px_150px_1fr_80px] items-center bg-[#00B4CC]/10 border-b border-[#ececed] px-6 py-3">
            <div className="text-[13px] font-bold text-[#101828]">Ad / Soyad</div>
            <div className="text-[13px] font-bold text-[#101828]">Telefon</div>
            <div className="text-[13px] font-bold text-[#101828]">E-poçt</div>
            <div className="text-[13px] font-bold text-[#101828] text-center">Ətraflı</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {trainersList.map((t: any, idx: number) => {
              const profileImage = t.picture 
                ? (t.picture.startsWith("http") || t.picture.startsWith("/") ? t.picture : `/api/v1/media/stream/${t.picture}`) 
                : null;

              return (
                <div 
                  key={t.trainer_id || idx} 
                  className="grid grid-cols-[220px_150px_1fr_80px] items-center px-6 py-3 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors"
                >
                  {/* Name / Profile */}
                  <div className="flex items-center gap-3 overflow-hidden mr-4">
                    <div className="w-10 h-10 rounded-full bg-[#00B4CC]/10 text-[#00B4CC] flex-shrink-0 relative overflow-hidden flex items-center justify-center font-bold text-xs shadow-sm">
                      {profileImage ? (
                        <img src={profileImage} className="w-full h-full object-cover" alt={t.name} />
                      ) : (
                        <span>{t.name?.[0]}{t.surname?.[0]}</span>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[13px] font-semibold text-black truncate">{t.name} {t.surname}</span>
                      <span className="text-[11px] text-[#6a7282] truncate">{t.profession?.name || "Məşqçi"}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="text-[13px] font-medium text-black">
                    {t.phone || "—"}
                  </div>

                  {/* Email */}
                  <div className="text-[13px] font-medium text-black truncate pr-4">
                    {t.email || "—"}
                  </div>

                  {/* Action Menu */}
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

                    {activeMenu === idx && (
                      <div 
                        ref={menuRef}
                        className="absolute right-full top-0 mt-0 mr-2 w-[160px] bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                      >
                        {/* View/Edit */}
                        <button 
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                          onClick={() => {
                            setEditingTrainer({ trainer: t, index: idx });
                            setActiveMenu(null);
                          }}
                        >
                          <Eye size={15} className="text-[#364153]" />
                          <span className="text-[13px] text-[#364153] font-medium">Düzəliş et</span>
                        </button>

                        <div className="h-[1px] bg-[#F3F4F6] w-full" />

                        {/* Delete */}
                        <button 
                          className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                          onClick={() => handleDelete(t.trainer_id)}
                        >
                          <Trash2 size={15} className="text-[#E7000B]" />
                          <span className="text-[13px] text-[#E7000B] font-medium">Sil</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAdd && (
        <AddTrainerModal 
          onClose={() => setShowAdd(false)} 
          isDashboard={true} 
          gymId={parsedGymId} 
        />
      )}
      
      {editingTrainer && (
        <EditTrainerModal 
          trainer={editingTrainer.trainer} 
          index={editingTrainer.index} 
          isDashboard={true}
          onClose={() => setEditingTrainer(null)} 
        />
      )}
    </div>
  );
}
