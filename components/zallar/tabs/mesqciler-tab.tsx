"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { useGymTrainers, useDeleteTrainer } from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { AddTrainerModal } from "../../gyms/modals/add-trainer-modal";
import { EditTrainerModal } from "../../gyms/modals/edit-trainer-modal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

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

  const [colWidths, setColWidths] = useState<number[]>([220, 150, 280]);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const activeColIndexRef = useRef<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerWidthRef = useRef<number>(0);

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const mouseUpRef = useRef<() => void>(null);

  const minWidths = [150, 100, 180];

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return;
    const deltaX = e.clientX - startXRef.current;
    const minW = minWidths[activeColIndexRef.current] || 100;

    const sumOthers = colWidths.reduce((acc, w, idx) => {
      return idx !== activeColIndexRef.current ? acc + w : acc;
    }, 0);

    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 80);
    const newWidth = Math.min(maxW, Math.max(minW, startWidthRef.current + deltaX));
    setColWidths((prev) => {
      const copy = [...prev];
      copy[activeColIndexRef.current] = newWidth;
      return copy;
    });
  };

  mouseUpRef.current = () => {
    activeColIndexRef.current = -1;
    if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeColIndexRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[index];

    if (tableRef.current) {
      containerWidthRef.current = tableRef.current.getBoundingClientRect().width;
    } else {
      containerWidthRef.current = 750;
    }

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current);
  };

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
    };
  }, []);

  const handleDelete = async (trainerId: string) => {
    try {
      await deleteTrainerMutation.mutateAsync({ gymId: parsedGymId, trainerId });
      toast.success("Məşqçi uğurla silindi");
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
        <div className="overflow-x-auto border border-[#ececed] rounded-xl bg-white shadow-sm">
          <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
            <colgroup>
              <col style={{ width: `${colWidths[0]}px` }} />
              <col style={{ width: `${colWidths[1]}px` }} />
              <col style={{ width: `${colWidths[2]}px` }} />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-[#00B4CC]/10 border-b border-[#ececed] text-left">
                <th className="px-6 py-3 text-[13px] font-bold text-[#101828] relative">
                  Ad / Soyad
                  <div
                    onMouseDown={(e) => handleMouseDown(0, e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                  >
                    <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                  </div>
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#101828] relative">
                  Telefon
                  <div
                    onMouseDown={(e) => handleMouseDown(1, e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                  >
                    <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                  </div>
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#101828] relative">
                  E-poçt
                  <div
                    onMouseDown={(e) => handleMouseDown(2, e)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                  >
                    <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                  </div>
                </th>
                <th className="px-6 py-3 text-[13px] font-bold text-[#101828] text-center">Ətraflı</th>
              </tr>
            </thead>
            <tbody>
              {trainersList.map((t: any, idx: number) => {
                const profileImage = t.picture 
                  ? (t.picture.startsWith("http") || t.picture.startsWith("/") ? t.picture : `/api/v1/media/stream/${t.picture}`) 
                  : null;

                return (
                  <tr 
                    key={t.trainer_id || idx} 
                    className="border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* Name / Profile */}
                    <td className="px-6 py-3 overflow-hidden">
                      <div className="flex items-center gap-3 overflow-hidden">
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
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-3 text-[13px] font-medium text-black overflow-hidden">
                      <span className="truncate block" title={t.phone || ""}>{t.phone || "—"}</span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3 text-[13px] font-medium text-black overflow-hidden">
                      <span className="truncate block" title={t.email || ""}>{t.email || "—"}</span>
                    </td>

                    {/* Action Menu */}
                    <td className="px-6 py-3 text-center">
                      <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors group outline-none"
                            >
                              <Image 
                                src="/more.png" 
                                width={24} 
                                height={24} 
                                alt="More" 
                                className="opacity-60 group-hover:opacity-100 transition-opacity" 
                              />
                            </button>
                          </DropdownMenuTrigger>
                          
                          <DropdownMenuContent align="end" className="w-[160px] bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-1 flex flex-col gap-1 overflow-hidden">
                            <DropdownMenuItem
                              onClick={() => setEditingTrainer({ trainer: t, index: idx })}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-foreground hover:bg-slate-50 transition-colors cursor-pointer focus:bg-transparent px-0 py-0"
                            >
                              <Eye size={15} className="text-[#364153] shrink-0" />
                              <span className="text-[13px] text-[#364153] font-medium">Düzəliş et</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(t.trainer_id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer focus:bg-transparent px-0 py-0"
                            >
                              <Trash2 size={15} className="text-[#E7000B] shrink-0" />
                              <span className="text-[13px] text-[#E7000B] font-medium">Sil</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
