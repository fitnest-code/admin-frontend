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
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#1a1b1e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {t.goals.addGoal}
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        </div>
      ) : filteredGoals?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Dumbbell className="w-12 h-12 mb-4 opacity-20" />
          <p>{t.goals.noGoals}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGoals?.map((goal: IGoal) => (
            <div
              key={goal.code}
              className="flex flex-col overflow-hidden transition-all border group bg-[#1a1b1e] border-white/5 rounded-2xl hover:border-white/10"
            >
              <div className="relative w-full h-40 bg-white/5">
                {goal.imageUrl ? (
                  <Image
                    src={goal.imageUrl}
                    alt={goal.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-500">
                    <Dumbbell className="w-10 h-10 opacity-20" />
                  </div>
                )}
                {/* Overlay actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity opacity-0 bg-black/60 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setModalMode("edit");
                      setSelectedGoal(goal);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-white transition-colors bg-white/10 rounded-xl hover:bg-blue-500"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setGoalToDelete(goal);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 text-white transition-colors bg-white/10 rounded-xl hover:bg-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white line-clamp-1">{goal.title}</h3>
                  <span className="px-2 py-1 text-xs font-medium text-blue-400 rounded-md bg-blue-500/10 shrink-0">
                    {goal.code}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {goal.subtitle || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#1a1b1e] rounded-[24px] border border-white/5 shadow-2xl p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">{t.common.delete}</h3>
            <p className="mb-6 text-gray-400">{t.goals.deleteConfirm}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 text-sm font-medium text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteGoal.isPending}
                className="flex-1 py-3 text-sm font-medium text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500 disabled:opacity-50"
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
