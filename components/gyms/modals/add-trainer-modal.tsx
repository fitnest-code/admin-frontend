"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useAddTrainer,
  useProfessionsQuery,
} from "@/lib/query/add-trainer-query";
import { useGymStore } from "@/lib/store/gym-store";
import { InputField } from "../components/InputField";
import { useQueryClient } from "@tanstack/react-query";

export function AddTrainerModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const id = useGymStore((state) => state.gymId);

  const { data: professions, isLoading: professionsLoading } =
    useProfessionsQuery();
  const { mutate, isPending } = useAddTrainer();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    professionId: "",
    phone: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Yalnız JPG, PNG və WEBP formatında şəkil seçə bilərsiniz");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Şəkil ölçüsü maksimum 10MB olmalıdır");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    toast.success("Şəkil seçildi");
  };

  const { addStep2Trainer } = useGymStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return toast.error("Zal ID tapılmadı.");
    if (!form.name || !form.surname || !form.professionId || !selectedFile) {
      return toast.error(
        "Zəhmət olmasa ulduzlu (*) sahələri doldurun və şəkil seçin.",
      );
    }

    const professionName = professions?.find(p => String(p.id) === form.professionId)?.name;

    addStep2Trainer({
      ...form,
      photo: selectedFile,
      preview: preview!,
      professionName
    });

    toast.success("Məşqçi siyahıya əlavə edildi");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Məşqçi əlavə et
            </h2>
            <p className="text-xs text-[#00B4CC] font-bold">Zal ID: {id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Şəkil Yükləmə Sahəsi - BURA DİQQƏT */}
            <div className="flex flex-col items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              <div
                onClick={() => fileRef.current?.click()}
                className={`group relative h-[200px] w-[200px] cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden
                  ${preview ? "border-[#00B4CC] bg-white" : "border-slate-200 bg-slate-50 hover:border-[#00B4CC]"}`}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Trainer preview"
                      className="h-full w-full object-cover"
                      // Şəkil yüklənə bilməsə xəta göstərsin
                      onError={() => {
                        setPreview(null);
                        toast.error("Şəkli göstərmək mümkün olmadı");
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <RefreshCw className="text-white" size={24} />
                      <span className="text-white text-[10px] ml-2 font-bold uppercase">
                        Dəyiş
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded-full shadow-sm text-[#00B4CC]">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Şəkil seçin *
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                PNG, JPG (Max. 2MB)
              </p>
            </div>

            {/* İnputlar */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Ad *"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Məs: Nəzrin"
                />
                <InputField
                  label="Soyad *"
                  value={form.surname}
                  onChange={(v) => setForm({ ...form, surname: v })}
                  placeholder="Məs: Məmmədova"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  İxtisas{" "}
                </label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00B4CC] bg-white text-sm transition-all"
                  value={form.professionId}
                  onChange={(e) =>
                    setForm({ ...form, professionId: e.target.value })
                  }
                >
                  <option value="">İxtisas seçin</option>
                  {professions?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Telefon"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="055XXXXXXX"
                />
                <InputField
                  label="E-poçt"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="n@example.com"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center border-t border-slate-50 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="w-full md:w-[280px] bg-[#00B4CC] text-white py-4 rounded-2xl font-bold hover:bg-[#009DB3] transition-all disabled:bg-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00B4CC20]"
            >
              {isPending ? (
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
