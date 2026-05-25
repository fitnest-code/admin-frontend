"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search, Languages } from "lucide-react";
import { useTranslations, Translation } from "@/lib/query/translation-query";
import { useT } from "@/lib/i18n";
import { ConfirmDeleteModal } from "../gyms/modals/confirm-delete-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";
import { CustomerPagination as Pagination } from "../customers/list/customer-list-table";
import TranslationModal, { getFlagEmoji } from "./modals/translation-modal";

const ENTITY_TYPES = [
  "GYM",
  "CATEGORY",
  "STORE",
  "TRAINER",
  "PROFESSION",
  "ROOM",
  "SUPPORTEDSERVICE",
  "GymAdmin",
  "GymLessonType",
  "GymSubscription"
];

const LANGUAGES = ["AZ", "EN", "RU"];

export default function TranslationsPage() {
  const t = useT();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");
  const [filterLanguageCode, setFilterLanguageCode] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal open & target states
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success / Error toast modal state
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Query hook
  const {
    translations,
    isLoading,
    saveTranslation,
    deleteTranslation,
  } = useTranslations({
    entityType: filterEntityType || undefined,
    languageCode: filterLanguageCode || undefined,
  });

  // Filter locally by search query (entityId or value matching)
  const filteredTranslations = searchQuery
    ? translations.filter(
        (tr: Translation) =>
          tr.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tr.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tr.fieldValue.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : translations;

  // Local pagination
  const totalItems = filteredTranslations.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedTranslations = filteredTranslations.slice(startIndex, startIndex + pageSize);

  const handleSaveTranslation = async (data: {
    entityType: string;
    entityId: string;
    languageCode: string;
    fieldName: string;
    fieldValue: string;
  }) => {
    try {
      await saveTranslation(data);
      setModalConfig({ isOpen: true, message: t.translations.created, type: "success" });
      setModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      console.error(err);
      setModalConfig({ isOpen: true, message: err?.message || t.error.generic, type: "error" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTranslation(deleteTarget.id);
      setModalConfig({ isOpen: true, message: t.translations.deleted, type: "success" });
      setDeleteTarget(null);
    } catch (err: any) {
      console.error(err);
      setModalConfig({ isOpen: true, message: err?.message || t.error.generic, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 font-sans">
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        {/* Header */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-3 gap-5">
          <div className="flex items-center gap-2">
            <Languages className="text-[#00b4cc]" size={24} />
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-[28px] text-black">
              {t.translations.title}
            </h2>
          </div>
        </div>

        {/* Filters Row */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between mt-5 mb-5">
          <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t.common.search + "..."}
                className="w-full h-[40px] pl-9 pr-4 rounded-xl bg-[#fafafa] border border-[#ececed] text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors text-black"
              />
            </div>

            {/* Entity Type Filter */}
            <select
              value={filterEntityType}
              onChange={(e) => {
                setFilterEntityType(e.target.value);
                setPage(1);
              }}
              className="h-[40px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors text-black"
            >
              <option value="">{t.translations.entityType} (All)</option>
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Language Code Filter */}
            <select
              value={filterLanguageCode}
              onChange={(e) => {
                setFilterLanguageCode(e.target.value);
                setPage(1);
              }}
              className="h-[40px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors text-black"
            >
              <option value="">{t.translations.languageCode} (All)</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {getFlagEmoji(lang)} {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              setEditTarget(null);
              setModalOpen(true);
            }}
            className="w-full md:w-auto h-[40px] rounded-xl bg-[#00b4cc] flex items-center justify-center px-4 gap-2 text-[13px] font-medium text-white hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50 shrink-0"
          >
            <Plus size={16} /> {t.translations.add}
          </button>
        </div>

        {/* Grid Content / Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <Loader2 className="animate-spin text-[#00B5D1]" size={36} />
          </div>
        ) : paginatedTranslations.length === 0 ? (
          <div className="w-full text-center py-20 text-gray-500 border border-dashed border-[#ececed] rounded-xl">
            {t.common.noData}
          </div>
        ) : (
          <div className="w-full border border-[#ececed] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[80px_130px_100px_120px_100px_1fr_120px] items-center gap-3 bg-[#00b4cc]/10 px-4 py-3 border-b border-[#ececed]">
              <span className="text-[11px] font-bold uppercase text-black/80">{t.common.id}</span>
              <span className="text-[11px] font-bold uppercase text-black/80">{t.translations.entityType}</span>
              <span className="text-[11px] font-bold uppercase text-black/80">{t.translations.entityId}</span>
              <span className="text-[11px] font-bold uppercase text-black/80">{t.translations.fieldName}</span>
              <span className="text-[11px] font-bold uppercase text-black/80">{t.translations.languageCode}</span>
              <span className="text-[11px] font-bold uppercase text-black/80">{t.translations.fieldValue}</span>
              <span className="text-[11px] font-bold uppercase text-black/80 text-right">{t.common.actions}</span>
            </div>

            <div className="flex flex-col bg-white">
              {paginatedTranslations.map((tr: Translation) => (
                <div
                  key={tr.id}
                  className="grid grid-cols-[80px_130px_100px_120px_100px_1fr_120px] items-center gap-3 px-4 py-3 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors text-black"
                >
                  <span className="text-sm font-medium text-gray-600">#{tr.id}</span>
                  <span className="text-xs font-semibold text-[#00b4cc] bg-[#00b4cc]/10 border border-[#00b4cc]/20 rounded-full px-2 py-0.5 uppercase text-center w-fit">
                    {tr.entityType}
                  </span>
                  <span className="text-sm font-medium text-gray-700">ID {tr.entityId}</span>
                  <span className="text-sm font-semibold">{tr.fieldName}</span>
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-base">{getFlagEmoji(tr.languageCode)}</span>
                    <span className="uppercase">{tr.languageCode}</span>
                  </span>
                  <span className="text-sm font-medium text-gray-800 line-clamp-1 break-all" title={tr.fieldValue}>
                    {tr.fieldValue}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditTarget(tr);
                        setModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-gray-600 hover:text-[#00b4cc] hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          id: tr.id,
                          name: `"${tr.fieldName}" (${tr.languageCode})`,
                        })
                      }
                      className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="w-full border-t border-[#ececed] pt-4 mt-2">
            <Pagination
              total={totalItems}
              page={page}
              perPage={pageSize}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modal windows */}
      <TranslationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveTranslation}
        initialData={editTarget || undefined}
        mode={editTarget ? "edit" : "create"}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          isLoading={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
