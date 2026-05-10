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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
    { page: currentPage, pageSize: pageSize, sort_dir: "DESC" },
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
  const totalPages = apiData?.totalPages ?? 1;

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
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] min-h-[350px] flex flex-col shadow-sm">
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
          <div className="w-full">
            <table className="w-full border-separate border-spacing-0">
              {/* Header */}
              <thead>
                <tr className="bg-[rgba(0,180,204,0.15)] h-[64px] text-[16px] font-bold text-black font-sans">
                  <th className="border-y border-l border-[#cecfd2] rounded-tl-[12px] pl-[105px] text-left whitespace-nowrap">Ad / Soyad</th>
                  <th className="border-y border-[#cecfd2] px-10 text-left whitespace-nowrap">Telefon</th>
                  <th className="border-y border-[#cecfd2] px-10 text-left whitespace-nowrap">Email</th>
                  <th className="border-y border-r border-[#cecfd2] rounded-tr-[12px] px-10 text-center whitespace-nowrap">Ətraflı</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white">
                {trainers.length > 0 ? (
                  trainers.map((t: any, i: number) => {
                    const firstName = t.name || t.firstName || "Bilinmir";
                    const lastName = t.surname || t.lastName || "";
                    const pictureUrl = t.picture || t.photo;
                    const email = t.email || "";
                    const phone = t.phone || "";
                    const role = t.profession?.name || t.role || "Məşqçi";
                    const trainerUid = String(t.trainer_id || t.id || i);
                    
                    const fullPicUrl = pictureUrl 
                      ? (pictureUrl.startsWith('http') ? pictureUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${pictureUrl}`) 
                      : null;

                    return (
                      <tr key={trainerUid} className="h-[100px] hover:bg-slate-50/80 transition-colors group font-sans">
                        {/* Name Section */}
                        <td className={cn(
                          "border-b border-l border-[#ececed] pl-10",
                          i === trainers.length - 1 && "rounded-bl-[12px]"
                        )}>
                          <div className="flex items-center gap-[14px]">
                            <div className="h-[54px] w-[54px] relative rounded-full overflow-hidden shrink-0 bg-[#00B4CC10] flex items-center justify-center">
                              {fullPicUrl ? (
                                <img src={fullPicUrl} className="object-cover w-full h-full" alt="Trainer" />
                              ) : (
                                <div className="text-[#00B4CC] font-bold text-xl italic uppercase">
                                  {firstName[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden">
                              <div className="text-black leading-[24px] group-hover:text-[#00B4CC] transition-colors whitespace-nowrap">
                                {firstName} {lastName}
                              </div>
                              <div className="text-[14px] leading-[24px] text-[#94979c] whitespace-nowrap">
                                {role}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="border-b border-[#ececed] px-10">
                          <div className="text-black leading-[24px] whitespace-nowrap">
                            {phone || "—"}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="border-b border-[#ececed] px-10">
                          <div className="text-black leading-[24px] whitespace-nowrap">
                            {email || "—"}
                          </div>
                        </td>

                        {/* Actions */}
                      <td className={cn(
                        "border-b border-r border-[#ececed] px-10 text-center",
                        i === trainers.length - 1 && "rounded-br-[12px]"
                      )}>
                        <div className="flex justify-center relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === trainerUid ? null : trainerUid)}
                            className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70"
                          >
                            <Image src="/more.png" width={24} height={24} alt="more" />
                          </button>

                          {openMenuId === trainerUid && (
                            <div 
                              ref={menuRef} 
                              className={cn(
                                "absolute right-0 z-[100] w-[180px] bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200",
                                (i === trainers.length - 1 && trainers.length > 1) ? "bottom-full mb-2" : "top-10"
                              )}
                            >
                              <button
                                onClick={() => { setShowDetails(t); setOpenMenuId(null); }}
                                className="w-full h-11 flex items-center px-4 hover:bg-slate-50 transition-colors gap-3 font-medium text-slate-700 whitespace-nowrap"
                              >
                                <Image src="/Eye.png" width={18} height={18} alt="View" />
                                <span>Məlumatlara bax</span>
                              </button>
                              <div className="h-px bg-slate-100 mx-2" />
                              <button
                                onClick={() => handleDelete(t.trainer_id || t.id)}
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
                  );
                })
                ) : (
                  <tr>
                    <td colSpan={4} className="h-[200px] text-center border-b border-x border-[#ececed] rounded-b-[12px]">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                        <p className="text-[16px] font-medium">Məşqçi tapılmadı</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-[18px] mt-8 select-none">
          {/* Page 1 */}
          <button 
            onClick={() => setCurrentPage(1)}
            className={cn(
              "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
              currentPage === 1 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
            )}
          >
            1
          </button>
          
          {/* Page 2 */}
          {totalPages >= 2 && (
            <button 
              onClick={() => setCurrentPage(2)}
              className={cn(
                "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                currentPage === 2 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
              )}
            >
              2
            </button>
          )}

          {/* Page 3 */}
          {totalPages >= 3 && (
            <button 
              onClick={() => setCurrentPage(3)}
              className={cn(
                "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                currentPage === 3 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
              )}
            >
              3
            </button>
          )}

          {/* Page 4 */}
          {totalPages >= 4 && (
            <button 
              onClick={() => setCurrentPage(4)}
              className={cn(
                "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                currentPage === 4 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
              )}
            >
              4
            </button>
          )}

          {/* Ellipsis */}
          {totalPages > 5 && (
            <div className="h-8 w-8 rounded bg-white border border-[#ececed] flex items-center justify-center gap-[1px]">
              <div className="h-[3px] w-[3px] rounded-full bg-black" />
              <div className="h-[3px] w-[3px] rounded-full bg-black" />
              <div className="h-[3px] w-[3px] rounded-full bg-black" />
            </div>
          )}

          {/* Last Page */}
          {totalPages > 4 && (
            <button 
              onClick={() => setCurrentPage(totalPages)}
              className={cn(
                "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                currentPage === totalPages ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
              )}
            >
              {totalPages}
            </button>
          )}
        </div>
      )}

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} isDashboard={true} />}
      {showDetails && <TrainerDetailsModal trainer={showDetails} onClose={() => setShowDetails(null)} />}
    </div>
  );
}
