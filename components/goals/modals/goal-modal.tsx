"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import az from "@/lib/i18n/locales/az";

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
  t: typeof az;
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

    if (!code.trim()) {
      newErrors.code = t.validation.required;
    } else if (!/^[A-Z0-9_-]+$/.test(code.trim())) {
      newErrors.code = t.goals.codeNoSpaces;
    }

    if (!title.trim()) {
      newErrors.title = t.validation.required;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      code: code.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      image: selectedFile,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1a1b1e] rounded-[24px] border border-white/5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {mode === "create" ? t.goals.addGoal : t.goals.editGoal}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 text-gray-400 transition-colors rounded-xl hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {t.goals.image}
              </label>
              <div
                className="relative flex flex-col items-center justify-center h-48 transition-all border-2 border-dashed rounded-2xl border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02] cursor-pointer overflow-hidden group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/50 group-hover:opacity-100">
                      <span className="text-sm font-medium text-white">Yenilə</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-white/5">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm">Sürükləyin və ya klikləyin</span>
                  </div>
                )}
              </div>
            </div>

            {/* Code */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {t.goals.code}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setErrors((prev) => ({ ...prev, code: "" }));
                }}
                disabled={mode === "edit"}
                className={`w-full px-4 py-3 text-white transition-colors bg-white/5 border rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.code ? "border-red-500/50" : "border-white/10"
                }`}
                placeholder="WEIGHT_LOSS"
              />
              {errors.code && <p className="mt-1.5 text-sm text-red-400">{errors.code}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {t.goals.goalTitle}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={`w-full px-4 py-3 text-white transition-colors bg-white/5 border rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 ${
                  errors.title ? "border-red-500/50" : "border-white/10"
                }`}
              />
              {errors.title && <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
            </div>

            {/* Subtitle */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                {t.goals.goalSubtitle}
              </label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full h-24 px-4 py-3 text-white transition-colors border resize-none bg-white/5 border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/5 shrink-0 bg-[#1a1b1e]/50 rounded-b-[24px]">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors rounded-xl hover:text-white hover:bg-white/5 disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
}
