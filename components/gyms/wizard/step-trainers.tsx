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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function StepTrainers({ onNext }: { onNext: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<{ trainer: any, index: number } | null>(null);
  
  const { step2Trainers, removeStep2Trainer } = useGymStore();
  const validateStep2 = useValidateGymStep2();

  const [colWidths, setColWidths] = useState<number[]>([200, 140, 280]);
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
      <div className="overflow-x-auto border border-[#ececed] rounded-[12px] shadow-sm bg-white">
        <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00B4CC26] border-b border-[#CECFD2] text-left">
              <th className="px-6 py-3 text-[14px] font-bold relative">
                Ad / Soyad
                <div
                  onMouseDown={(e) => handleMouseDown(0, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-6 py-3 text-[14px] font-bold relative">
                Telefon
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-6 py-3 text-[14px] font-bold relative">
                Email
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-6 py-3 text-[14px] font-bold text-center">Ətraflı</th>
            </tr>
          </thead>
          <tbody>
            {step2Trainers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-black/40 text-[16px]">
                  Hələ ki məşqçi əlavə edilməyib
                </td>
              </tr>
            ) : (
              step2Trainers.map((t, idx) => (
                <tr key={idx} className="border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors">
                  {/* Ad / Soyad */}
                  <td className="px-6 py-3 overflow-hidden">
                    <div className="flex items-center gap-3 overflow-hidden">
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
                  </td>

                  {/* Telefon */}
                  <td className="px-6 py-3 text-[13px] leading-[20px] font-medium text-black overflow-hidden">
                    <span className="truncate block" title={t.phone}>{t.phone}</span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-3 text-[13px] leading-[20px] font-medium text-black overflow-hidden">
                    <span className="truncate block" title={t.email}>{t.email}</span>
                  </td>

                  {/* Actions */}
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
                        
                        <DropdownMenuContent align="end" className="w-[160px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] p-1 flex flex-col gap-1 overflow-hidden">
                          <DropdownMenuItem
                            onClick={() => setEditingTrainer({ trainer: t, index: idx })}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-foreground hover:bg-[#F9FAFB] transition-colors cursor-pointer focus:bg-transparent px-0 py-0"
                          >
                            <Eye size={16} className="text-[#364153] shrink-0" />
                            <span className="text-[14px] font-sans text-[#364153]">Bax</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => removeStep2Trainer(idx)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[14px] text-red-500 hover:bg-[#F9FAFB] transition-colors cursor-pointer focus:bg-transparent px-0 py-0"
                          >
                            <Trash2 size={16} className="text-[#E7000B] shrink-0" />
                            <span className="text-[14px] font-sans text-[#E7000B]">Ləğv et</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
