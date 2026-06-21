"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import az, { type TranslationKeys } from "@/lib/i18n/locales/az";

export interface GoalFormData {
  code: string;
  title: string;
  subtitle?: string;
  image: File | null;
}

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: GoalFormData) => void;
  initialData?: { code: string; title: string; subtitle?: string; imageUrl?: string };
  mode?: "create" | "edit";
  t: TranslationKeys;
  isLoading?: boolean;
}

export default function GoalModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode = "create",
  t,
  isLoading = false,
}: GoalModalProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode(initialData?.code ?? "");
      setTitle(initialData?.title ?? "");
      setSubtitle(initialData?.subtitle ?? "");
      setImagePreview(initialData?.imageUrl ?? null);
      setSelectedFile(null);
      setErrors({});
    }
  }, [open, initialData]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = t.validation.required;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let finalCode = code;
    if (mode === "create") {
      finalCode = title.trim().toUpperCase()
          .replace(/Ə/g, 'E').replace(/Ö/g, 'O').replace(/Ü/g, 'U')
          .replace(/Ş/g, 'S').replace(/Ç/g, 'C').replace(/Ğ/g, 'G')
          .replace(/İ/g, 'I').replace(/I/g, 'I')
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
      if (!finalCode) finalCode = "GOAL_" + Date.now();
    }

    onSave({
      code: finalCode,
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: selectedFile,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4 sm:py-10">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      <div className="relative z-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center justify-center p-4 sm:p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-2.5">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {mode === "create" ? t.goals.addGoal : t.goals.editGoal}
          </h2>
          <button onClick={() => onOpenChange(false)} className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col items-start gap-4 sm:gap-5 text-[#000]">
          
          {/* Image Upload */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">
              {t.goals.image}
            </label>
            <div className="w-full flex flex-col items-start gap-2 text-center text-[13px] text-[#4a5565] font-inter">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="w-full h-[140px] relative rounded-2xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[-0.15px] text-[#101828]">Şəkil Yüklə</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.svg" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          </div>



          {/* Title */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">
              {t.goals.goalTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="Başlıq daxil edin"
              className={`w-full h-[40px] rounded-lg bg-[#fafafa] border px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors ${
                errors.title ? "border-red-500" : "border-[#ececed]"
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-500 mt-[-4px]">{errors.title}</p>}
          </div>

          {/* Subtitle */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">
              {t.goals.goalSubtitle}
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Yarımbaşlıq daxil edin"
              className="w-full h-[80px] rounded-lg bg-[#fafafa] border border-[#ececed] p-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-end gap-3 mt-2 border-t border-[#ececed] pt-4">
          <button 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-[44px] px-5 rounded-lg border border-[#ececed] bg-white text-[14px] font-medium text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="h-[44px] px-6 rounded-lg bg-[#00b4cc] flex items-center justify-center gap-2 text-[14px] font-medium text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {t.common.save}
          </button>
        </div>

      </div>
    </div>
  );
}
