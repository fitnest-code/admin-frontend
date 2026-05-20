"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react";
import { useFAQs, FAQ, FAQCategory } from "@/lib/query/faq-query";
import { useT, useI18nStore } from "@/lib/i18n";
import { ConfirmDeleteModal } from "../gyms/modals/confirm-delete-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";
import { CustomerPagination as Pagination } from "../customers/list/customer-list-table";
import FAQModal from "./modals/faq-modal";
import FAQCategoryModal from "./modals/category-modal";

export default function FaqPage() {
  const t = useT();
  const selectedLang = useI18nStore((s) => s.locale);

  // Tabs state
  const [activeTab, setActiveTab] = useState<"faqs" | "categories">("faqs");

  // FAQ filters & page state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [faqPage, setFaqPage] = useState(1);
  const pageSize = 10;

  // Expanded FAQ card ID tracking
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Modal open & target states
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editFaqTarget, setEditFaqTarget] = useState<any | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategoryTarget, setEditCategoryTarget] = useState<any | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "faq" | "category"; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success / Error toast modal state
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Query hook
  const {
    faqsData,
    categories,
    isLoadingFaqs,
    isLoadingCategories,
    createFaq,
    updateFaq,
    deleteFaq,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useFAQs(selectedLang, faqPage, pageSize, selectedCategoryId);

  const faqItems = faqsData?.items || [];
  const totalFaqs = faqsData?.total || 0;

  // Filter items locally by search query since backend doesn't support search param
  const filteredFaqs = searchQuery
    ? faqItems.filter(
        (faq: FAQ) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  const handleSaveFAQ = async (data: { question: string; answer: string; categoryId: number }) => {
    try {
      if (editFaqTarget) {
        await updateFaq({ id: editFaqTarget.id, ...data });
        setModalConfig({ isOpen: true, message: t.faq.updated, type: "success" });
      } else {
        await createFaq(data);
        setModalConfig({ isOpen: true, message: t.faq.created, type: "success" });
      }
      setFaqModalOpen(false);
      setEditFaqTarget(null);
    } catch (err: any) {
      console.error(err);
      setModalConfig({ isOpen: true, message: err?.message || t.error.generic, type: "error" });
    }
  };

  const handleSaveCategory = async (data: { name: string }) => {
    try {
      if (editCategoryTarget) {
        await updateCategory({ id: editCategoryTarget.id, name: data.name });
        setModalConfig({ isOpen: true, message: t.faq.categoryUpdated, type: "success" });
      } else {
        await createCategory(data);
        setModalConfig({ isOpen: true, message: t.faq.categoryCreated, type: "success" });
      }
      setCategoryModalOpen(false);
      setEditCategoryTarget(null);
    } catch (err: any) {
      console.error(err);
      setModalConfig({ isOpen: true, message: err?.message || t.error.generic, type: "error" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "faq") {
        await deleteFaq(deleteTarget.id);
        setModalConfig({ isOpen: true, message: t.faq.deleted, type: "success" });
      } else {
        await deleteCategory(deleteTarget.id);
        setModalConfig({ isOpen: true, message: t.faq.categoryDeleted, type: "success" });
      }
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
            <HelpCircle className="text-[#00b4cc]" size={24} />
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-[28px] text-black">
              {t.faq.title}
            </h2>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#ececed] w-full mt-4 mb-5">
          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "faqs"
                ? "border-[#00b4cc] text-[#00b4cc] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.faq.faqTab}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "categories"
                ? "border-[#00b4cc] text-[#00b4cc] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.faq.categoriesTab}
          </button>
        </div>

        {/* FAQs TAB */}
        {activeTab === "faqs" && (
          <div className="w-full flex flex-col gap-5">
            {/* Filters Row */}
            <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 md:w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.common.search + "..."}
                    className="w-full h-[40px] pl-9 pr-4 rounded-xl bg-[#fafafa] border border-[#ececed] text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors text-black"
                  />
                </div>

                {/* Category Dropdown Filter */}
                <select
                  value={selectedCategoryId || ""}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                    setFaqPage(1);
                  }}
                  className="h-[40px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors text-black"
                >
                  <option value="">{t.faq.selectCategory}</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  setEditFaqTarget(null);
                  setFaqModalOpen(true);
                }}
                className="w-full md:w-auto h-[40px] rounded-xl bg-[#00b4cc] flex items-center justify-center px-4 gap-2 text-[13px] font-medium text-white hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50 shrink-0"
              >
                <Plus size={16} /> {t.faq.addFaq}
              </button>
            </div>

            {/* List Content */}
            {isLoadingFaqs ? (
              <div className="flex justify-center items-center py-20 w-full">
                <Loader2 className="animate-spin text-[#00B5D1]" size={36} />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="w-full text-center py-20 text-gray-500 border border-dashed border-[#ececed] rounded-xl">
                {t.common.noData}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                {filteredFaqs.map((faq: FAQ) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="w-full border border-[#ececed] rounded-xl p-4 transition-all hover:shadow-sm bg-[#fafafa]/50 flex flex-col"
                    >
                      <div className="w-full flex items-start justify-between gap-4">
                        <div
                          className="flex-1 flex flex-col items-start gap-1 cursor-pointer select-none"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold text-[#00b4cc] bg-[#00b4cc]/10 border border-[#00b4cc]/20 rounded-full px-2.5 py-0.5 uppercase tracking-wide">
                              {faq.category?.name || "General"}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-semibold text-black leading-snug mt-1">
                            {faq.question}
                          </h3>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditFaqTarget({
                                id: faq.id,
                                question: faq.question,
                                answer: faq.answer,
                                categoryId: faq.category?.id || 0,
                              });
                              setFaqModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-gray-600 hover:text-[#00b4cc] hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: "faq",
                                id: faq.id,
                                name: faq.question,
                              })
                            }
                            className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                            className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Collapsible Answer */}
                      {isExpanded && (
                        <div className="w-full border-t border-[#ececed] mt-3 pt-3 text-[14px] leading-[22px] text-gray-700 whitespace-pre-line animate-in fade-in duration-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalFaqs > pageSize && (
              <div className="w-full border-t border-[#ececed] pt-4 mt-2">
                <Pagination
                  total={totalFaqs}
                  page={faqPage}
                  perPage={pageSize}
                  onChange={setFaqPage}
                />
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="w-full flex flex-col gap-4">
            {/* Top Row */}
            <div className="w-full flex items-center justify-end">
              <button
                onClick={() => {
                  setEditCategoryTarget(null);
                  setCategoryModalOpen(true);
                }}
                className="w-full md:w-auto h-[40px] rounded-xl bg-[#00b4cc] flex items-center justify-center px-4 gap-2 text-[13px] font-medium text-white hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50 shrink-0"
              >
                <Plus size={16} /> {t.faq.addCategory}
              </button>
            </div>

            {/* List Grid */}
            {isLoadingCategories ? (
              <div className="flex justify-center items-center py-20 w-full">
                <Loader2 className="animate-spin text-[#00B5D1]" size={36} />
              </div>
            ) : !categories || categories.length === 0 ? (
              <div className="w-full text-center py-20 text-gray-500 border border-dashed border-[#ececed] rounded-xl">
                {t.common.noData}
              </div>
            ) : (
              <div className="w-full border border-[#ececed] rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-[80px_1fr_120px] items-center gap-3 bg-[#00b4cc]/10 px-4 py-3 border-b border-[#ececed]">
                  <span className="text-[11px] font-bold uppercase text-black/80">{t.common.id}</span>
                  <span className="text-[11px] font-bold uppercase text-black/80">{t.faq.categoryName}</span>
                  <span className="text-[11px] font-bold uppercase text-black/80 text-right">{t.common.actions}</span>
                </div>

                <div className="flex flex-col bg-white">
                  {categories.map((cat: FAQCategory) => (
                    <div
                      key={cat.id}
                      className="grid grid-cols-[80px_1fr_120px] items-center gap-3 px-4 py-3 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors text-black"
                    >
                      <span className="text-sm font-medium text-gray-600">#{cat.id}</span>
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditCategoryTarget(cat);
                            setCategoryModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-gray-600 hover:text-[#00b4cc] hover:bg-gray-50 transition-colors shadow-sm animate-in"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "category",
                              id: cat.id,
                              name: cat.name,
                            })
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-[#ececed] flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shadow-sm animate-in"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <FAQModal
        open={faqModalOpen}
        onOpenChange={setFaqModalOpen}
        onSave={handleSaveFAQ}
        categories={categories || []}
        initialData={editFaqTarget || undefined}
        mode={editFaqTarget ? "edit" : "create"}
      />

      <FAQCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onSave={handleSaveCategory}
        initialData={editCategoryTarget || undefined}
        mode={editCategoryTarget ? "edit" : "create"}
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
