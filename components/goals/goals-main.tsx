"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Search, Dumbbell } from "lucide-react";

import { useGoals, IGoal } from "@/lib/query/goal-query";
import GoalModal, { GoalFormData } from "./modals/goal-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";
import az from "@/lib/i18n/locales/az";

export default function GoalsMain() {
  const { goals, isLoading, createGoal, updateGoal, deleteGoal } = useGoals("AZ");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedGoal, setSelectedGoal] = useState<IGoal | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<IGoal | null>(null);

  const [toastModal, setToastModal] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  const t = az;

  const filteredGoals = goals?.filter(
    (g: IGoal) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: GoalFormData) => {
    try {
      if (modalMode === "create") {
        await createGoal.mutateAsync({
          code: data.code,
          title: data.title,
          subtitle: data.subtitle,
          image: data.image,
        });
        setToastModal({ open: true, message: t.goals.added, type: "success" });
      } else {
        await updateGoal.mutateAsync({
          code: data.code,
          title: data.title,
          subtitle: data.subtitle,
          image: data.image,
        });
        setToastModal({ open: true, message: t.goals.updated, type: "success" });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      setToastModal({ open: true, message: error?.message || t.error.generic, type: "error" });
    }
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal.mutateAsync(goalToDelete.code);
      setToastModal({ open: true, message: t.goals.deleted, type: "success" });
      setDeleteModalOpen(false);
    } catch (error: any) {
      setToastModal({ open: true, message: error?.message || t.error.generic, type: "error" });
    }
  };

  return (
    <div className="w-full p-4 font-sans">
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-3 gap-5">
          <h2 className="text-[16px] font-semibold leading-[24px] text-black">{t.goals.title}</h2>
          
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => {
                setModalMode("create");
                setSelectedGoal(null);
                setIsModalOpen(true);
              }}
              className="h-[40px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-4 py-2 gap-2 text-[13px] font-medium text-white hover:opacity-90 transition-all shadow-md shadow-cyan-50 whitespace-nowrap"
            >
              <Plus size={16} /> {t.goals.addGoal}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-[400px]">
            <div className="w-8 h-8 border-4 border-[#00b4cc] rounded-full border-t-transparent animate-spin" />
          </div>
        ) : filteredGoals?.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-[400px] text-[#717182]">
            <Dumbbell className="w-12 h-12 mb-4 opacity-20" />
            <p>{t.goals.noGoals}</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-start gap-6 mt-4">
            <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {filteredGoals?.map((goal: IGoal) => (
                <div key={goal.code} className="h-[170px] flex flex-col items-start gap-2 group">
                  <div
                    className="w-full h-[130px] rounded-lg flex items-start justify-end p-2 bg-cover bg-center bg-no-repeat bg-gray-100 border border-[#ececed]"
                    style={{ backgroundImage: goal.imageUrl ? `url(${goal.imageUrl})` : undefined }}
                  >
                    {!goal.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Dumbbell className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="flex items-center gap-[6px] relative z-10">
                      <button
                        onClick={() => {
                          setModalMode("edit");
                          setSelectedGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 size={14} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => {
                          setGoalToDelete(goal);
                          setDeleteModalOpen(true);
                        }}
                        className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-7 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-between px-2 py-1">
                    <span className="text-[12px] text-[#717182] font-medium truncate tracking-[-0.15px]" title={goal.title}>
                      {goal.title}
                    </span>
                    <span className="text-[10px] text-[#00b4cc] font-bold shrink-0 bg-[#00b4cc]/10 px-1.5 py-0.5 rounded">
                      {goal.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <GoalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        mode={modalMode}
        initialData={selectedGoal || undefined}
        t={t}
        isLoading={createGoal.isPending || updateGoal.isPending}
      />

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl flex flex-col items-center justify-center p-6 gap-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-1">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-[18px] font-semibold text-[#101828] mb-2">{t.common.delete}</h2>
              <p className="text-[14px] text-[#475467]">{t.goals.deleteConfirm}</p>
            </div>
            <div className="w-full flex items-center gap-3 mt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 h-[44px] rounded-lg border border-[#d0d5dd] bg-white text-[14px] font-medium text-[#344054] hover:bg-gray-50 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteGoal.isPending}
                className="flex-1 h-[44px] rounded-lg bg-red-600 text-[14px] font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteGoal.isPending ? t.common.loading : t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessAnimationModal
        isOpen={toastModal.open}
        onClose={() => setToastModal({ ...toastModal, open: false })}
        message={toastModal.message}
        type={toastModal.type}
      />
    </div>
  );
}
