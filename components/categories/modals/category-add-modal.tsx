"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload } from "lucide-react";

export interface CategoryFormData {
  name: string;
  photo: File | null;
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: { name: string; image: string };
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setImagePreview(initialData?.image ?? null);
      setSelectedFile(null);
    }
  }, [open, initialData]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), photo: selectedFile });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-[460px] mx-4 rounded-2xl bg-white shadow-2xl p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-gray-900">
            {mode === "create" ? "Yeni kateqoriya əlavə et" : "Kateqoriyanı redaktə et"}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Kateqoriya şəkli</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full h-[160px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={18} className="text-teal-600" />
                  <span className="text-[13px] text-gray-500">Şəkil yüklə</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Kateqoriya adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 outline-none focus:border-teal-400"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold disabled:opacity-50 transition-all"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}