"use client";

import { useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCreateSupportedService } from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { InputField } from "../components/InputField";

interface AddServiceModalProps {
  onClose: () => void;
  onSuccess: (serviceName: string) => void;
}

export function AddServiceModal({ onClose, onSuccess }: AddServiceModalProps) {
  const { gymId } = useGymStore();
  const createService = useCreateSupportedService();
  const [name, setName] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Xidmət adını daxil edin");

    try {
      await createService.mutateAsync({ 
        name: trimmed, 
        gymId: gymId ? Number(gymId) : undefined 
      });
      onSuccess(trimmed);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Xidmət yaradıla bilmədi");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 rounded-lg text-[#00B4D8]">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Yeni xidmət əlavə et
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            Sistemə yeni xidmət əlavə edin. Bu xidmət həm bu zal, həm də digər zallar üçün seçilə bilər olacaq.
          </p>

          <InputField
            label="Xidmət adı *"
            value={name}
            onChange={setName}
            placeholder="Məs: Qapalı hovuz, Kafe və s."
            autoFocus
          />

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={createService.isPending}
              className="w-full bg-[#00B4D8] text-white py-4 rounded-2xl font-bold hover:bg-[#0096B4] transition-all disabled:bg-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00B4D820]"
            >
              {createService.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Yadda saxla"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
