"use client";

import Image from "next/image";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { EditTrainerModal } from "../modals/edit-trainer-modal";
import { useState, useMemo } from "react";
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
import { AdminDataTable, type AdminDataTableColumn } from "@/components/ui/admin-data-table";

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

  const locale = useI18nStore((s) => s.locale);
  const lt = LOCAL_TRANSLATIONS[locale] || LOCAL_TRANSLATIONS.AZ;

  const { gymId } = useGymStore();

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

  const columns: AdminDataTableColumn<any>[] = useMemo(
  () => [
    {
      id: "name",
      label: lt.nameSurname,
      defaultWidth: 280,
      minWidth: 150,
      maxWidth: 420,
      flex: true,
      render: (t) => {
        const firstName = t.name || t.firstName || lt.unknown;
        const lastName = t.surname || t.lastName || "";
        const pictureUrl = t.picture || t.photo;
        const role = t.profession?.name || t.role || lt.trainer;
        const fullPicUrl = pictureUrl
          ? pictureUrl.startsWith("http")
            ? pictureUrl
            : `${process.env.NEXT_PUBLIC_API_URL || ""}${pictureUrl}`
          : null;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#00B4CC10]">
              {fullPicUrl ? (
                <img src={fullPicUrl} className="h-full w-full object-cover" alt="" />
              ) : (
                <span className="text-base font-bold uppercase italic text-[#00B4CC]">{firstName[0]}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-black">
                {firstName} {lastName}
              </div>
              <div className="truncate text-xs text-[#94979c]">{role}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "phone",
      label: lt.phone,
      defaultWidth: 180,
      minWidth: 120,
      maxWidth: 240,
      render: (t) => <span className="block truncate">{t.phone || "—"}</span>,
    },
    {
      id: "email",
      label: lt.email,
      defaultWidth: 220,
      minWidth: 120,
      maxWidth: 360,
      flex: true,
      render: (t) => <span className="block truncate">{t.email || "—"}</span>,
    },
    {
      id: "actions",
      label: lt.details,
      defaultWidth: 80,
      minWidth: 72,
      maxWidth: 100,
      reorderable: false,
      hideable: false,
      render: (t) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-70">
                <Image src="/more.png" width={24} height={24} alt="more" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg">
              <DropdownMenuItem
                onClick={() => setDeleteTrainerId(t.trainer_id || t.id)}
                className="flex w-full cursor-pointer items-center gap-2 text-base font-normal text-[#F10303] focus:bg-red-50 focus:text-[#F10303]"
              >
                <Image src="/trash.png" width={16} height={16} alt="Delete" />
                <span className="leading-none">{lt.deleteTrainer}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ],
  [lt],
  );

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

      {!apiLoading && trainers.length === 0 ? (
        <div className="flex min-h-[350px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-10 text-center shadow-sm">
          <div className="relative mb-2 h-12 w-12">
            <Image src="/no-trainer.svg" fill className="object-contain opacity-20" alt="No Trainer" />
          </div>
          <div className="text-[16px] font-medium leading-[24px] text-[#6a7282]">{lt.noTrainers}</div>
          <div className="text-[14px] leading-[18px] text-[#99a1af]">{lt.noTrainersHint}</div>
        </div>
      ) : (
        <AdminDataTable
          storageKey="gym-trainers"
          columns={columns}
          rows={trainers}
          getRowId={(t) => String(t.trainer_id || t.id)}
          isLoading={apiLoading}
          emptyTitle={lt.noTrainers}
          emptyDescription={lt.noTrainersHint}
          onRowClick={(t) => setShowDetails(t)}
        />
      )}

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
