"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import CategoryModal, { CategoryFormData } from "./modals/category-add-modal";
import { ConfirmDeleteModal } from "../gyms/modals/confirm-delete-modal";
import { ErrorToastModal } from "./modals/error-toast-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";
import { useCategories } from "@/lib/query/add-category";

export default function CategoriesPage() {
  const { categories, isLoading, refetch, createCategory, updateCategory, deleteCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const categoryItems = Array.isArray(categories) 
    ? categories 
    : ((categories as any)?.content || (categories as any)?.data || (categories as any)?.items || []);

  const handleSave = async (formData: CategoryFormData) => {
    try {
      if (editTarget) {
        await updateCategory({ 
          id: editTarget.id, 
          name: formData.name, 
          photo: formData.photo,
          lessonTypeIds: formData.lessonTypeIds 
        });
        setModalConfig({ isOpen: true, message: "Kateqoriya uğurla yeniləndi!", type: "success" });
      } else {
        await createCategory({ 
          name: formData.name, 
          photo: formData.photo,
          lessonTypeIds: formData.lessonTypeIds 
        });
        setModalConfig({ isOpen: true, message: "Kateqoriya uğurla yaradıldı!", type: "success" });
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (err: any) {
      console.error("Save error:", err);
      const msg = err?.response?.data?.error?.message || err?.message || "Yadda saxlamaq mümkün olmadı";
      setModalConfig({ isOpen: true, message: msg, type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="animate-spin text-[#00B5D1]" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full p-4 font-sans">

      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-1 gap-5">
          <h2 className="text-[16px] font-semibold leading-[24px] text-black">Zal kateqoriyaları</h2>
          <div className="flex items-center gap-6 text-center text-[13px] font-medium text-[#717182]">
            <div className="w-[26px] border-b-2 border-[#00b4cc] flex flex-col items-center justify-center pb-1 text-[#00b4cc] cursor-pointer">Az</div>
            <div className="w-[26px] flex flex-col items-center justify-center pb-1 cursor-pointer hover:text-gray-600 font-medium">Ru</div>
            <div className="w-[26px] flex flex-col items-center justify-center pb-1 cursor-pointer hover:text-gray-600 font-medium">En</div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start gap-6 mt-4">
          <div className="w-full flex items-center justify-between gap-5">
            <h3 className="text-[15px] font-semibold leading-tight text-black">Mövcud kateqoriyalar</h3>
            <button
              onClick={() => {
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="h-[40px] w-[130px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-3 py-2 gap-2 text-[13px] font-medium text-white hover:opacity-90 transition-all shadow-md shadow-cyan-50"
            >
              <Plus size={16} /> Kateqoriya
            </button>
          </div>

          <div className="w-full flex items-start flex-wrap content-start gap-3">
            {categoryItems?.map((cat: any) => (
              <div key={cat.id} className="w-[140px] h-[170px] flex flex-col items-start gap-2 group">
                <div 
                  className="w-full h-[130px] rounded-lg flex items-start justify-end p-2 bg-cover bg-center bg-no-repeat bg-gray-100 border border-[#ececed]"
                  style={{ backgroundImage: `url(${cat.photoUrl})` }}
                >
                  <div className="flex items-center gap-[6px]">
                    <button 
                      onClick={() => { setEditTarget(cat); setModalOpen(true); }}
                      className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={14} className="text-gray-700" />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(cat)}
                      className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full h-7 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center px-2 py-1">
                  <span className="text-[12px] text-[#717182] font-medium truncate tracking-[-0.15px]">{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditTarget(null);
        }}
        onSave={handleSave}
        initialData={editTarget ? { name: editTarget.name, image: editTarget.photoUrl, lessonTypes: editTarget.lessonTypes } : undefined}
        mode={editTarget ? "edit" : "create"}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          isLoading={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            try {
              setIsDeleting(true);
              await deleteCategory(deleteTarget.id);
              await refetch();
              setDeleteTarget(null);
              setModalConfig({ isOpen: true, message: "Kateqoriya uğurla silindi!", type: "success" });
            } catch (err: any) {
              console.error("Delete error:", err);
              const msg = err?.response?.data?.error?.message || err?.error?.message || err?.message || "Kateqoriya istifadə olunur və silinə bilməz";
              setDeleteTarget(null);
              setModalConfig({ isOpen: true, message: msg, type: "error" });
            } finally {
              setIsDeleting(false);
            }
          }}
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