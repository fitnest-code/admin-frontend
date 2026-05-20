"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { FAQCategory } from "@/lib/query/faq-query";

interface FAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { question: string; answer: string; categoryId: number }) => Promise<void>;
  categories: FAQCategory[];
  initialData?: { id?: number; question: string; answer: string; categoryId: number };
  mode?: "create" | "edit";
}

export default function FAQModal({
  open,
  onOpenChange,
  onSave,
  categories,
  initialData,
  mode = "create",
}: FAQModalProps) {
  const t = useT();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuestion(initialData?.question ?? "");
      setAnswer(initialData?.answer ?? "");
      setCategoryId(initialData?.categoryId ?? "");
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = async () => {
    if (!question.trim() || !answer.trim() || !categoryId) {
      setError(t.validation.fillRequired);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        question: question.trim(),
        answer: answer.trim(),
        categoryId: Number(categoryId),
      });
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
      
      <div className="relative z-10 w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-3">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {mode === "create" ? t.faq.addFaq : t.faq.editFaq}
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

          {/* Question */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.faq.question}</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. How can I freeze my subscription?"
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.faq.category}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              disabled={isSubmitting}
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60"
            >
              <option value="">{t.faq.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Answer */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.faq.answer}</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder="Provide a detailed answer here..."
              className="w-full rounded-xl bg-[#fafafa] border border-[#ececed] p-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors resize-y min-h-[100px] disabled:opacity-60"
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
            disabled={isSubmitting || !question.trim() || !answer.trim() || !categoryId}
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
