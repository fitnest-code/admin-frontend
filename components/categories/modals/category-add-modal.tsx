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
      
      <div className="relative z-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center justify-center p-4 sm:p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-2.5">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {mode === "create" ? "Yeni kateqoriya əlavə et" : "Kateqoriyanı redaktə et"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col items-start gap-4 sm:gap-5 text-[#000]">
          
          {/* Kateqoriya şəkli */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">Kateqoriya şəkli</label>
            <div className="w-full flex flex-col items-start gap-2 text-center text-[13px] text-[#4a5565] font-inter">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[100px] sm:h-[120px] relative rounded-xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/upload.svg" width={24} height={24} alt="upload" className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[-0.15px] text-[#101828]">Upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-full text-left text-[11px] sm:text-[12px] leading-[18px] tracking-[-0.15px] text-[#6a7282]">
                JPG or PNG • Max size 2MB
              </div>
            </div>
          </div>

          {/* Kateqoriya adı */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">Kateqoriya adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Məs: Fitness"
              className="w-full h-[40px] rounded-lg bg-[#fafafa] border border-[#ececed] px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors"
            />
          </div>

          {/* Unified Növ Section */}
          <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-start p-3 sm:p-5 gap-4 text-[13px]">
            {/* Header */}
            <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[14px] sm:text-[16px] font-semibold text-[#000] gap-2">
              <span className="leading-tight">Növ ({selectedLessonTypeIds.size}/{lessonTypes?.length || 0})</span>
              {!isAddingLessonType && (
                <button
                  type="button"
                  onClick={() => setIsAddingLessonType(true)}
                  className="h-[32px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-3 gap-1.5 text-[12px] sm:text-[13px] text-[#fafafa] font-medium hover:bg-[#00a4bd] transition-colors shrink-0"
                >
                  <span className="leading-none">Növ əlavə et</span>
                  <Plus size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Addition Form Box */}
            {isAddingLessonType && (
              <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-end p-3 sm:p-5 gap-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[14px] sm:text-[16px] font-semibold text-[#000]">
                  <span className="leading-tight">Növ əlavə et</span>
                  <button
                    type="button"
                    onClick={() => { setIsAddingLessonType(false); setNewLessonTypeName(""); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X size={16} className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full flex flex-col items-start gap-2">
                  <label className="text-[12px] sm:text-[13px] text-[#000] leading-tight font-medium">Növ adı</label>
                  <div className="w-full h-[40px] rounded-lg bg-[#fafafa] border border-[#ececed] flex items-center justify-between px-3 gap-3 text-[13px] sm:text-[14px] focus-within:border-[#00b4cc] transition-colors">
                    <input
                      type="text"
                      value={newLessonTypeName}
                      onChange={(e) => setNewLessonTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLessonTypeSubmit()}
                      placeholder="Məs: Pilates"
                      autoFocus
                      className="w-full h-full bg-transparent outline-none text-[#000] text-[13px] sm:text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setNewLessonTypeName("")}
                      className="w-5 h-5 rounded-[4px] bg-[#ececed] flex items-center justify-center text-[#000] hover:bg-gray-200 transition-colors shrink-0"
                    >
                      <X size={10} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddLessonTypeSubmit}
                  disabled={!newLessonTypeName.trim() || isSubmittingLessonType}
                  className="w-full sm:w-[120px] h-[36px] rounded-lg bg-[#00b4cc] flex items-center justify-center text-[#fafafa] font-medium text-[13px] hover:bg-[#00a4bd] disabled:opacity-50 transition-colors gap-2"
                >
                  {isSubmittingLessonType ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <span className="leading-none">Əlavə et</span>
                  )}
                </button>
              </div>
            )}

            {/* List of Items Grid */}
            <div className="w-full flex flex-wrap items-center gap-2 pt-1">
              {lessonTypes?.map((lt) => {
                const isSelected = selectedLessonTypeIds.has(lt.id);
                return (
                  <div
                    key={lt.id}
                    onClick={() => toggleLessonType(lt.id)}
                    className={`flex-[1_1_calc(50%-4px)] sm:flex-none min-w-[100px] sm:min-w-[120px] h-[36px] rounded-lg flex items-center justify-between px-2 sm:px-2.5 gap-2 cursor-pointer select-none transition-colors ${
                      isSelected 
                        ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc]" 
                        : "bg-[#fafafa] border border-[#ececed]"
                    }`}
                  >
                    <span className="text-[#101828] text-[12px] sm:text-[13px] font-medium truncate">{lt.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLessonType(lt.id);
                      }}
                      className="p-1 hover:opacity-70 transition-opacity shrink-0 flex items-center justify-center"
                    >
                      <Image src="/trash.png" width={16} height={16} alt="delete" className="w-4 h-4 shrink-0" />
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
          className="w-full max-w-[180px] h-[40px] rounded-lg bg-[#00b4cc] text-white flex items-center justify-center px-4 py-2 font-medium text-[14px] disabled:opacity-50 hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50"
        >
          Yadda saxla
        </button>

      </div>
    </div>
  );
}