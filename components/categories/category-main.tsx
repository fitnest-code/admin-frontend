"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import CategoryModal, { CategoryFormData } from "./modals/category-add-modal";
import { useCategories } from "@/lib/query/add-category";

export default function CategoriesPage() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

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
      } else {
        await createCategory({ 
          name: formData.name, 
          photo: formData.photo,
          lessonTypeIds: formData.lessonTypeIds 
        });
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (error) {
      console.error("Save error:", error);
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
    <div className="w-full p-8 font-sans">
      <h1 className="text-2xl font-bold text-[#111827] mb-8">Kateqoriyalar</h1>

      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-7 py-5">
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-1 gap-5">
          <h2 className="text-[20px] font-semibold leading-[30px] text-black">Zal kateqoriyaları</h2>
          <div className="flex items-center gap-[34px] text-center text-[16px] font-medium text-[#717182]">
            <div className="w-[26px] border-b-2 border-[#00b4cc] flex flex-col items-center justify-center pb-1 text-[#00b4cc] cursor-pointer">Az</div>
            <div className="w-[26px] flex flex-col items-center justify-center pb-1 cursor-pointer hover:text-gray-600">Ru</div>
            <div className="w-[26px] flex flex-col items-center justify-center pb-1 cursor-pointer hover:text-gray-600">En</div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start gap-8 mt-6">
          <div className="w-full flex items-center justify-between gap-5">
            <h3 className="w-[313px] text-[20px] font-semibold leading-[30px] text-black">Mövcud kateqoriyalar</h3>
            <button
              onClick={() => {
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="h-12 w-[193px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 py-2 gap-2 text-[16px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={24} /> Yeni kateqoriya
            </button>
          </div>

          <div className="w-full flex items-start flex-wrap content-start gap-4">
            {categoryItems?.map((cat: any) => (
              <div key={cat.id} className="w-[180px] h-[224px] flex flex-col items-start gap-3">
                <div 
                  className="w-full h-[180px] rounded-[16px] flex items-start justify-end p-3 bg-cover bg-center bg-no-repeat bg-gray-100"
                  style={{ backgroundImage: `url(${cat.photoUrl})` }}
                >
                  <div className="flex items-center gap-[9px]">
                    <button 
                      onClick={() => { setEditTarget(cat); setModalOpen(true); }}
                      className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={16} className="text-gray-700" />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(cat)}
                      className="rounded-[50px] bg-white flex items-center justify-center p-1.5 shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full h-8 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] flex items-center px-3 py-1">
                  <span className="text-[14px] text-[#717182] font-medium truncate tracking-[-0.15px]">{cat.name}</span>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white p-6 rounded-xl w-full max-w-[340px] shadow-2xl text-center">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Silmək istəyirsiniz?</h3>
            <p className="text-sm text-gray-500 mb-6 font-normal italic">
              "{deleteTarget.name}" kateqoriyası silinəcək.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Ləğv et</button>
              <button 
                onClick={async () => { 
                  await deleteCategory(deleteTarget.id); 
                  setDeleteTarget(null); 
                }} 
                className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}