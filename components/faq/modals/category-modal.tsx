"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string }) => Promise<void>;
  initialData?: { id?: number; name: string };
  mode?: "create" | "edit";
}

export default function FAQCategoryModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode = "create",
}: CategoryModalProps) {
  const t = useT();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t.validation.required);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({ name: name.trim() });
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t.error.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && onOpenChange(false)} />
      
      <div className="relative z-10 w-full max-w-[450px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-3">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {mode === "create" ? t.faq.addCategory : t.faq.editCategory}
          </h2>
          <button 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full flex flex-col gap-4 text-black">
          {error && (
            <div className="p-3 text-[13px] font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Category Name */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.faq.categoryName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. General, Payments, Workouts"
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex items-center justify-end gap-3 border-t border-[#ececed] pt-4 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-[42px] px-5 rounded-xl border border-[#dddcdc] text-black font-medium text-[14px] hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !name.trim()}
            className="h-[42px] px-6 rounded-xl bg-[#00b4cc] text-white flex items-center justify-center font-medium text-[14px] disabled:opacity-50 hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50 gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              t.common.save
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
