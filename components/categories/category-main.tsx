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
          photo: formData.photo 
        });
      } else {
        await createCategory({ 
          name: formData.name, 
          photo: formData.photo 
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
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold text-[#111827] mb-8">Kateqoriyalar</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-[#111827]">Zal kateqoriyaları</h2>
          <div className="flex gap-4 text-sm font-medium text-gray-400">
            <span className="text-[#00B5D1] border-b-2 border-[#00B5D1] pb-1 cursor-pointer">Az</span>
            <span className="hover:text-gray-600 cursor-pointer">Ru</span>
            <span className="hover:text-gray-600 cursor-pointer">En</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-md font-semibold text-[#111827]">Mövcud kateqoriyalar</h3>
            <button
              onClick={() => {
                setEditTarget(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#00B5D1] hover:bg-[#00a4bd] transition-colors text-white px-5 py-2.5 rounded-lg text-[14px] font-medium"
            >
              <Plus size={18} /> Yeni kateqoriya
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {categoryItems?.map((cat: any) => (
              <div key={cat.id} className="flex flex-col gap-3">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square border border-gray-100">
                  <img 
                    src={cat.photoUrl} 
                    alt={cat.name} 
                    className="w-full h-full object-cover" 
                  />
                  
                  {/* Statik Düymələr (Həmişə görünən) */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button 
                       onClick={() => { setEditTarget(cat); setModalOpen(true); }} 
                       className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:bg-white transition-colors"
                    >
                      <Pencil size={14} className="text-gray-700" />
                    </button>
                    <button 
                       onClick={() => setDeleteTarget(cat)} 
                       className="p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                
                <div className="px-3 py-2 bg-[#F9FAFB] border border-gray-100 rounded-md">
                  <p className="text-gray-500 text-[13px] truncate">{cat.name}</p>
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
        initialData={editTarget ? { name: editTarget.name, image: editTarget.photoUrl } : undefined}
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