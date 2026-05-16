"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Loader2 } from "lucide-react";
import { useLessonTypes } from "@/lib/query/use-lesson-types";

export interface CategoryFormData {
  name: string;
  photo: File | null;
  lessonTypeIds?: number[];
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: { name: string; image: string; lessonTypes?: { id: number; name: string }[] };
  mode?: "create" | "edit";
}

export default function CategoryModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode = "create",
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { lessonTypes, createLessonType, deleteLessonType } = useLessonTypes();

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setImagePreview(initialData?.image ?? null);
      setSelectedFile(null);
      if (initialData?.lessonTypes) {
        setSelectedLessonTypeIds(new Set(initialData.lessonTypes.map((lt) => lt.id)));
      } else {
        setSelectedLessonTypeIds(new Set());
      }
    }
  }, [open, initialData]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const [newLessonTypeName, setNewLessonTypeName] = useState("");
  const [isAddingLessonType, setIsAddingLessonType] = useState(false);
  const [isSubmittingLessonType, setIsSubmittingLessonType] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ 
      name: name.trim(), 
      photo: selectedFile,
      lessonTypeIds: Array.from(selectedLessonTypeIds)
    });
  };

  const handleAddLessonTypeSubmit = async () => {
    const trimmed = newLessonTypeName.trim();
    if (!trimmed || isSubmittingLessonType) return;

    setIsSubmittingLessonType(true);
    try {
      const result = await createLessonType(trimmed);
      setSelectedLessonTypeIds((prev) => new Set(prev).add(result.id));
      setNewLessonTypeName("");
      setIsAddingLessonType(false); // Hide the box on success
    } catch (err) {
      console.error("Error creating lesson type", err);
    } finally {
      setIsSubmittingLessonType(false);
    }
  };

  const toggleLessonType = (id: number) => {
    setSelectedLessonTypeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleDeleteLessonType = async (id: number) => {
    try {
      await deleteLessonType(id);
      setSelectedLessonTypeIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error("Error deleting lesson type", err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4 sm:py-10">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      <div className="relative z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-[#ececed] flex flex-col items-center justify-center p-4 sm:p-7 gap-6 sm:gap-7 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-3">
          <h2 className="text-[18px] sm:text-[22px] font-semibold leading-[24px] sm:leading-[28px]">
            {mode === "create" ? "Yeni kateqoriya əlavə et" : "Kateqoriyanı redaktə et"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col items-start gap-5 sm:gap-6 text-[#000]">
          
          {/* Kateqoriya şəkli */}
          <div className="w-full flex flex-col items-start gap-2 sm:gap-3">
            <label className="text-[13px] sm:text-[14px] leading-[20px] font-semibold text-black/60">Kateqoriya şəkli</label>
            <div className="w-full flex flex-col items-start gap-2 sm:gap-3 text-center text-[14px] text-[#4a5565] font-inter">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[120px] sm:h-[150px] relative rounded-xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 sm:gap-[30px]">
                    <Image src="/upload.svg" width={32} height={32} alt="upload" className="w-8 h-8 sm:w-10 sm:h-10" />
                    <span className="text-[13px] sm:text-[14px] font-medium leading-[20px] tracking-[-0.15px] text-[#101828]">Upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-full text-left text-[12px] sm:text-[14px] leading-[18px] sm:leading-[20px] tracking-[-0.15px] text-[#6a7282]">
                JPG or PNG • Max size 2MB
              </div>
            </div>
          </div>

          {/* Kateqoriya adı */}
          <div className="w-full flex flex-col items-start gap-2 sm:gap-3">
            <label className="text-[13px] sm:text-[14px] leading-[20px] font-semibold text-black/60">Kateqoriya adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məs: Fitness"
              className="w-full h-[44px] sm:h-[48px] rounded-lg bg-[#fafafa] border border-[#ececed] px-3 sm:px-4 text-[14px] sm:text-[15px] font-medium outline-none focus:border-[#00b4cc] transition-colors"
            />
          </div>

          {/* Unified Növ Section */}
          <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-start p-4 sm:p-6 gap-4 sm:gap-6 text-[14px]">
            {/* Header */}
            <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[15px] sm:text-[18px] font-semibold text-[#000] gap-2 sm:gap-4">
              <span className="leading-[24px] sm:leading-[30px]">Növ ({selectedLessonTypeIds.size}/{lessonTypes?.length || 0})</span>
              {!isAddingLessonType && (
                <button
                  type="button"
                  onClick={() => setIsAddingLessonType(true)}
                  className="h-[36px] sm:h-[40px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-3 sm:px-4 gap-1 sm:gap-2 text-[13px] sm:text-[14px] text-[#fafafa] font-medium hover:bg-[#00a4bd] transition-colors shrink-0"
                >
                  <span className="leading-[20px] sm:leading-[24px]">Növ əlavə et</span>
                  <Plus size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Addition Form Box */}
            {isAddingLessonType && (
              <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-end p-4 sm:p-7 gap-4 sm:gap-7 shadow-sm animate-in fade-in duration-200">
                <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[16px] sm:text-[20px] font-semibold text-[#000]">
                  <span className="leading-[24px] sm:leading-[30px]">Növ əlavə et</span>
                  <button
                    type="button"
                    onClick={() => { setIsAddingLessonType(false); setNewLessonTypeName(""); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="w-full flex flex-col items-start gap-2 sm:gap-3">
                  <label className="text-[14px] sm:text-[16px] text-[#000] leading-[20px] sm:leading-[24px] font-medium">Növ adı</label>
                  <div className="w-full h-[48px] sm:h-[60px] rounded-[12px] bg-[#fafafa] border border-[#ececed] flex items-center justify-between px-3 gap-3 sm:gap-5 text-[16px] sm:text-[18px] focus-within:border-[#00b4cc] transition-colors">
                    <input
                      type="text"
                      value={newLessonTypeName}
                      onChange={(e) => setNewLessonTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLessonTypeSubmit()}
                      placeholder="Məs: Pilates"
                      autoFocus
                      className="w-full h-full bg-transparent outline-none text-[#000] text-[15px] sm:text-[18px]"
                    />
                    <button
                      type="button"
                      onClick={() => setNewLessonTypeName("")}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-[4px] bg-[#ececed] flex items-center justify-center text-[#000] hover:bg-gray-200 transition-colors shrink-0"
                    >
                      <X size={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddLessonTypeSubmit}
                  disabled={!newLessonTypeName.trim() || isSubmittingLessonType}
                  className="w-full sm:w-[193px] h-[44px] sm:h-[48px] rounded-[12px] bg-[#00b4cc] flex items-center justify-center text-[#fafafa] font-medium text-[15px] sm:text-[16px] hover:bg-[#00a4bd] disabled:opacity-50 transition-colors gap-2"
                >
                  {isSubmittingLessonType ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <span className="leading-[20px] sm:leading-[24px]">Əlavə et</span>
                  )}
                </button>
              </div>
            )}

            {/* List of Items Grid */}
            <div className="w-full flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              {lessonTypes?.map((lt) => {
                const isSelected = selectedLessonTypeIds.has(lt.id);
                return (
                  <div
                    key={lt.id}
                    onClick={() => toggleLessonType(lt.id)}
                    className={`flex-[1_1_calc(50%-4px)] sm:flex-none min-w-[120px] sm:min-w-[140px] h-[40px] sm:h-[48px] rounded-lg flex items-center justify-between px-2 sm:px-3 gap-2 sm:gap-3 cursor-pointer select-none transition-colors ${
                      isSelected 
                        ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc]" 
                        : "bg-[#fafafa] border border-[#ececed]"
                    }`}
                  >
                    <span className="text-[#101828] text-[13px] sm:text-[14px] leading-[20px] sm:leading-[24px] font-medium truncate">{lt.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLessonType(lt.id);
                      }}
                      className="p-1 hover:opacity-70 transition-opacity shrink-0 flex items-center justify-center"
                    >
                      <Image src="/trash.png" width={20} height={20} alt="delete" className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full max-w-[240px] h-[40px] rounded-lg bg-[#00b4cc] text-white flex items-center justify-center px-4 py-2 font-medium text-[14px] sm:text-[15px] disabled:opacity-50 hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50"
        >
          Yadda saxla
        </button>

      </div>
    </div>
  );
}