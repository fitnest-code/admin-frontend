"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { EditTrainerModal } from "../modals/edit-trainer-modal";
import { useState, useRef, useEffect } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainers, useDeleteTrainer } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { useI18nStore } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  AZ: {
    errorOccurred: "Xəta baş verdi",
    searchPlaceholder: "Ad/Soyad , Zal , Telefon üzrə axtarış.....",
    addTrainer: "Məşqçi əlavə et",
    loading: "Məşqçilər yüklənir...",
    noTrainers: "Hələ ki, məşqçi yoxdur",
    noTrainersHint: "Yeni məşqçi əlavə etmək üçün yuxarıdakı düyməni sıxın",
    nameSurname: "Ad / Soyad",
    phone: "Telefon",
    email: "Email",
    details: "Ətraflı",
    unknown: "Bilinmir",
    trainer: "Məşqçi",
    viewDetails: "Məlumatlara bax",
    deleteTrainer: "Məşqçini sil",
    noTrainerFound: "Məşqçi tapılmadı",
  },
  EN: {
    errorOccurred: "An error occurred",
    searchPlaceholder: "Search by Name/Surname, Gym, Phone.....",
    addTrainer: "Add Trainer",
    loading: "Loading trainers...",
    noTrainers: "No trainers yet",
    noTrainersHint: "Click the button above to add a new trainer",
    nameSurname: "Name / Surname",
    phone: "Phone",
    email: "Email",
    details: "Details",
    unknown: "Unknown",
    trainer: "Trainer",
    viewDetails: "View details",
    deleteTrainer: "Delete trainer",
    noTrainerFound: "No trainer found",
  },
  RU: {
    errorOccurred: "Произошла ошибка",
    searchPlaceholder: "Поиск по имени/фамилии, залу, телефону.....",
    addTrainer: "Добавить тренера",
    loading: "Загрузка тренеров...",
    noTrainers: "Тренеров пока нет",
    noTrainersHint: "Нажмите кнопку выше, чтобы добавить нового тренера",
    nameSurname: "Имя / Фамилия",
    phone: "Телефон",
    email: "Email",
    details: "Подробнее",
    unknown: "Неизвестно",
    trainer: "Тренер",
    viewDetails: "Посмотреть данные",
    deleteTrainer: "Удалить тренера",
    noTrainerFound: "Тренер не найден",
  },
};

export function TrainersTab() {
  const [showAdd, setShowAdd] = useState(false);
  const [showDetails, setShowDetails] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | number | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const pageSize = 10;
  
  const [colWidths, setColWidths] = useState<number[]>([280, 180, 220]);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const activeColIndexRef = useRef<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerWidthRef = useRef<number>(0);

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const mouseUpRef = useRef<() => void>(null);

  const minWidths = [150, 120, 120];

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return;
    const deltaX = e.clientX - startXRef.current;
    const minW = minWidths[activeColIndexRef.current] || 100;

    const sumOthers = colWidths.reduce((acc, w, idx) => {
      return idx !== activeColIndexRef.current ? acc + w : acc;
    }, 0);

    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 100);
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
      containerWidthRef.current = tableRef.current.parentElement?.getBoundingClientRect().width 
        || tableRef.current.getBoundingClientRect().width;
    } else {
      containerWidthRef.current = 750;
    }

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current);
  };

  const locale = useI18nStore((s) => s.locale);
  const lt = LOCAL_TRANSLATIONS[locale] || LOCAL_TRANSLATIONS.AZ;

  const { gymId } = useGymStore();

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
    };
  }, []);

  const { data: apiData, isLoading: apiLoading } = useGymTrainers(
    gymId || '',
    { page: currentPage, pageSize: pageSize, sort_dir: "DESC" }
  );

  const { mutate: deleteTrainerMutate, isPending: isDeletingTrainer } = useDeleteTrainer();

  const handleDelete = () => {
    if (!gymId || !deleteTrainerId) return;
    deleteTrainerMutate({ gymId: Number(gymId), trainerId: deleteTrainerId }, {
      onSuccess: () => {
        setDeleteTrainerId(null);
        setModalConfig({ isOpen: true, message: "Məşqçi uğurla silindi!", type: "success" });
      },
      onError: (err: any) => {
        setModalConfig({ isOpen: true, message: err?.response?.data?.message || err?.message || lt.errorOccurred, type: "error" });
      }
    });
  };

  const trainers = apiData?.items ?? [];
  const totalPages = apiData ? Math.ceil(apiData.total / pageSize) : 1;

  return (
    <div className="flex flex-col gap-6 py-4 w-full font-sans">
      {/* Search & Add Button Header */}
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="flex-1 w-full lg:w-[846px] h-10 bg-white rounded-lg border border-[#ececed] flex items-center px-4 py-1.5 gap-3 shadow-sm focus-within:border-[#00B4CC] transition-colors">
          <Image src="/search.svg" width={20} height={20} alt="search" className="shrink-0 opacity-50" />
          <input
            type="text"
            placeholder={lt.searchPlaceholder}
            className="flex-1 bg-transparent text-[13px] text-black outline-none placeholder:text-[#94979c]"
          />
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="h-10 w-full lg:w-[190px] flex items-center justify-center gap-3 bg-[#00B4CC] text-white px-5 rounded-lg text-sm font-medium hover:bg-[#009DB3] transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="leading-[24px]">{lt.addTrainer}</span>
          <div className="h-5 w-5 relative">
            <Image src="/trainer-add.svg" width={20} height={20} alt="plus" />
          </div>
        </button>
      </div>

      {/* Table / Empty State */}
      <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm min-h-[350px] flex flex-col">
        {apiLoading ? (
          <div className="flex-1 py-20 flex justify-center items-center text-slate-400">
            <Loader2 className="animate-spin mr-2" /> {lt.loading}
          </div>
        ) : trainers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-2 text-center font-sans">
            <div className="h-12 w-12 relative mb-2">
              <Image src="/no-trainer.svg" fill className="opacity-20 object-contain" alt="No Trainer" />
            </div>
            <div className="self-stretch text-[16px] leading-[24px] font-medium text-[#6a7282]">
              {lt.noTrainers}
            </div>
            <div className="self-stretch text-[14px] leading-[18px] text-[#99a1af]">
              {lt.noTrainersHint}
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
              <colgroup>
                <col style={{ width: `${colWidths[0]}px` }} />
                <col style={{ width: `${colWidths[1]}px` }} />
                <col style={{ width: `${colWidths[2]}px` }} />
                <col />
              </colgroup>
              {/* Header */}
              <thead>
                <tr className="bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 h-[40px] text-[11px] font-bold uppercase text-foreground/80 font-sans">
                  <th className="border-b border-[#cecfd2]/60 dark:border-border pl-[84px] text-left whitespace-nowrap py-3 relative">
                    {lt.nameSurname}
                    <div
                      onMouseDown={(e) => handleMouseDown(0, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                    >
                      <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                    </div>
                  </th>
                  <th className="border-b border-[#cecfd2]/60 dark:border-border px-10 text-left whitespace-nowrap py-3 relative">
                    {lt.phone}
                    <div
                      onMouseDown={(e) => handleMouseDown(1, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                    >
                      <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                    </div>
                  </th>
                  <th className="border-b border-[#cecfd2]/60 dark:border-border px-10 text-left whitespace-nowrap py-3 relative">
                    {lt.email}
                    <div
                      onMouseDown={(e) => handleMouseDown(2, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                    >
                      <div className="w-[2px] h-4 bg-[#cecfd2] dark:bg-border group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                    </div>
                  </th>
                  <th className="border-b border-[#cecfd2]/60 dark:border-border px-10 text-center whitespace-nowrap py-3 relative">
                    {lt.details}
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="bg-white">
                {trainers.length > 0 ? (
                  trainers.map((t: any, i: number) => {
                    const firstName = t.name || t.firstName || lt.unknown;
                    const lastName = t.surname || t.lastName || "";
                    const pictureUrl = t.picture || t.photo;
                    const email = t.email || "";
                    const phone = t.phone || "";
                    const role = t.profession?.name || t.role || lt.trainer;
                    const trainerUid = String(t.trainer_id || t.id || i);
                    
                    const fullPicUrl = pictureUrl 
                      ? (pictureUrl.startsWith('http') ? pictureUrl : `${process.env.NEXT_PUBLIC_API_URL || ''}${pictureUrl}`) 
                      : null;

                    return (
                      <tr 
                        key={trainerUid} 
                        onClick={() => setShowDetails(t)}
                        className="hover:bg-secondary/40 transition-all duration-200 cursor-pointer group font-sans text-sm"
                      >
                        {/* Name Section */}
                        <td className="border-b border-border pl-6 py-3">
                          <div className="flex items-center gap-[12px]">
                            <div className="h-[40px] w-[40px] relative rounded-full overflow-hidden shrink-0 bg-[#00B4CC10] flex items-center justify-center">
                              {fullPicUrl ? (
                                <img src={fullPicUrl} className="object-cover w-full h-full" alt="Trainer" />
                              ) : (
                                <div className="text-[#00B4CC] font-bold text-base italic uppercase">
                                  {firstName[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center overflow-hidden">
                              <div className="text-black leading-[20px] group-hover:text-[#00B4CC] transition-colors whitespace-nowrap font-medium text-sm truncate">
                                {firstName} {lastName}
                              </div>
                              <div className="text-[12px] leading-[18px] text-[#94979c] whitespace-nowrap truncate">
                                {role}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="border-b border-border px-10 py-3 overflow-hidden">
                          <span className="text-sm font-normal text-black whitespace-nowrap truncate block">
                            {phone || "—"}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="border-b border-border px-10 py-3 overflow-hidden">
                          <span className="text-sm font-normal text-black whitespace-nowrap truncate block">
                            {email || "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="border-b border-border px-10 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70 outline-hidden">
                                  <Image src="/more.png" width={24} height={24} alt="more" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] bg-white rounded-[12px] border border-[#ECECED] p-3 shadow-lg">
                                <DropdownMenuItem
                                  onClick={() => setDeleteTrainerId(t.trainer_id || t.id)}
                                  className="flex w-full items-center gap-2 text-base font-normal text-[#F10303] hover:opacity-70 transition-opacity cursor-pointer focus:bg-red-50 focus:text-[#F10303]"
                                >
                                  <Image src="/trash.png" width={16} height={16} alt="Delete" />
                                  <span className="leading-none">{lt.deleteTrainer}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="h-[200px] text-center border-b border-border rounded-b-lg">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                        <p className="text-[16px] font-medium">{lt.noTrainerFound}</p>
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
      {showDetails && (
        <EditTrainerModal 
          trainer={showDetails} 
          index={0} 
          isDashboard={true} 
          onClose={() => setShowDetails(null)} 
        />
      )}
      {deleteTrainerId !== null && (
        <ConfirmDeleteModal
          name={trainers.find((t: any) => (t.trainer_id || t.id) === deleteTrainerId)?.name || lt.trainer}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTrainerId(null)}
          isLoading={isDeletingTrainer}
        />
      )}
      <SuccessAnimationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
