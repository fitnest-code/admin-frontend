"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Globe, Languages } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useLanguages, ILanguage } from "@/lib/query/language-query";
import LanguageModal, { getLanguageFlag } from "./modals/language-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";
import { ConfirmDeleteModal } from "../gyms/modals/confirm-delete-modal";

export default function LanguagesMain() {
  const t = useT();
  const {
    languages,
    isLoading,
    createLanguage,
    isCreating,
    deleteLanguage,
    isDeleting,
  } = useLanguages();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<ILanguage | null>(null);

  const [toastModal, setToastModal] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const filteredLanguages = languages?.filter((lang: ILanguage) =>
    lang.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (code: string) => {
    try {
      await createLanguage(code);
      setToastModal({
        open: true,
        message: t.languages.created,
        type: "success",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      setToastModal({
        open: true,
        message: error?.message || t.error.generic,
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!languageToDelete) return;
    try {
      await deleteLanguage(languageToDelete.code);
      setToastModal({
        open: true,
        message: t.languages.deleted,
        type: "success",
      });
      setLanguageToDelete(null);
    } catch (error: any) {
      setToastModal({
        open: true,
        message: error?.message || t.error.generic,
        type: "error",
      });
    }
  };

  return (
    <div className="w-full p-4 font-sans">
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        
        {/* Toolbar / Header */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-3 gap-5">
          <h2 className="text-[16px] font-semibold leading-[24px] text-black">
            {t.languages.title}
          </h2>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.common.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-[#ececed] rounded-lg focus:outline-none focus:border-[#00b4cc] transition-colors"
              />
            </div>

            {/* Create Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-[40px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-4 py-2 gap-2 text-[13px] font-medium text-white hover:opacity-90 transition-all shadow-md shadow-cyan-50 whitespace-nowrap"
            >
              <Plus size={16} /> {t.languages.add}
            </button>
          </div>
        </div>

        {/* Content Table / Empty state */}
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-[300px]">
            <div className="w-8 h-8 border-4 border-[#00b4cc] rounded-full border-t-transparent animate-spin" />
          </div>
        ) : filteredLanguages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-[300px] text-[#717182]">
            <Languages className="w-12 h-12 mb-4 opacity-20" />
            <p>{t.common.noData}</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ececed] text-[#717182] text-[12px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">{t.languages.code}</th>
                  <th className="py-3 px-4">{t.languages.flag}</th>
                  <th className="py-3 px-4 text-right w-24">{t.languages.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLanguages?.map((lang: ILanguage, index: number) => {
                  const flag = getLanguageFlag(lang.code);
                  return (
                    <tr
                      key={lang.code}
                      className="border-b border-[#f9fafb] hover:bg-gray-50/50 transition-colors text-[14px] text-black"
                    >
                      <td className="py-3 px-4 font-medium text-gray-400 w-16">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span className="bg-gray-100 text-[#00b4cc] px-2.5 py-1 rounded text-[12px] font-bold">
                          {lang.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-2xl font-inter select-none">
                        {flag}
                      </td>
                      <td className="py-3 px-4 text-right w-24">
                        <button
                          onClick={() => setLanguageToDelete(lang)}
                          className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors inline-flex items-center justify-center"
                          title={t.common.delete}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Language Form Modal */}
      <LanguageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        isLoading={isCreating}
      />

      {/* Confirm Delete Modal */}
      {languageToDelete && (
        <ConfirmDeleteModal
          name={languageToDelete.code}
          onConfirm={handleDelete}
          onCancel={() => setLanguageToDelete(null)}
          isLoading={isDeleting}
        />
      )}

      {/* Success Toast Animation Modal */}
      <SuccessAnimationModal
        isOpen={toastModal.open}
        onClose={() => setToastModal({ ...toastModal, open: false })}
        message={toastModal.message}
        type={toastModal.type}
      />
    </div>
  );
}
