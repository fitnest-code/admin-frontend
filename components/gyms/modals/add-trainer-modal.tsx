"use client";

import { useState, useRef } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAddTrainer, useProfessionsQuery } from "@/lib/query/add-trainer-query";
import { useGymStore } from "@/lib/store/gym-store"; 
import { InputField } from "../components/InputField";

export function AddTrainerModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  
  // Store-dan gymId-ni alırıq (Step 1-də set etdiyimiz ID)
  const gymId = useGymStore((state) => state.gymId); 
  
  // Backend-den ixtisasları çəkirik
  const { data: professions, isLoading: professionsLoading } = useProfessionsQuery();
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Şəkil ölçüsü maksimum 2MB olmalıdır");
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasiyalar
    if (!gymId) {
      return toast.error("Zal ID tapılmadı. Zəhmət olmasa Step 1-i tamamlayın.");
    }

    if (!form.name || !form.surname || !form.professionId || !selectedFile) {
      return toast.error("Zəhmət olmasa ulduzlu (*) sahələri doldurun və foto yükləyin");
    }

    // Payload-u Swagger-dəki struktura uyğun hazırlayırıq
    // Qeyd: Mutation daxilində URLSearchParams istifadə edərək query-yə çeviririk
    mutate({
      gymId: Number(gymId),
      names: [form.name],
      surnames: [form.surname],
      professionIds: [Number(form.professionId)],
      emails: form.email ? [form.email] : [],
      phones: form.phone ? [form.phone] : [],
      photos: [selectedFile],
    }, {
      onSuccess: () => {
        toast.success("Məşqçi uğurla əlavə edildi");
        onClose(); // Modalı bağla
      },
      onError: (err: any) => {
        toast.error(err.message || "Məşqçi əlavə edilərkən xəta baş verdi");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Məşqçi əlavə et</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Zal ID: {gymId || "Gözlənilir..."}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Foto Yükləmə Bölməsi */}
            <div className="flex flex-col items-center gap-3">
              <input 
                ref={fileRef} 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoChange} 
              />
              <div 
                onClick={() => fileRef.current?.click()} 
                className={`group relative h-[200px] w-[200px] cursor-pointer rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden
                  ${preview ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:border-[#00B4CC] hover:bg-[#00B4CC05]'}`}
              >
                {preview ? (
                  <>
                    <img src={preview} className="h-full w-full object-cover" alt="preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded-full shadow-sm text-[#00B4CC]">
                      <Upload size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Foto seçin</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Məşqçi fotosu * (Max. 2MB)</p>
            </div>

            {/* İnputlar Bölməsi */}
            <div className="flex-1 space-y-5">
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
                <label className="text-sm font-semibold text-slate-700">İxtisas *</label>
                <select 
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC10] bg-white text-sm transition-all shadow-sm disabled:opacity-50"
                  value={form.professionId}
                  onChange={(e) => setForm({...form, professionId: e.target.value})}
                  disabled={professionsLoading}
                >
                  <option value="">{professionsLoading ? "İxtisaslar yüklənir..." : "İxtisas seçin"}</option>
                  {professions?.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
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

          {/* Footer Düymə */}
          <div className="mt-10 flex justify-center border-t border-slate-100 pt-6">
            <button 
              type="submit"
              disabled={isPending || professionsLoading} 
              className="w-full md:w-[280px] bg-[#00B4CC] text-white py-4 rounded-2xl font-bold hover:bg-[#009DB3] hover:shadow-lg hover:shadow-[#00B4CC30] transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Yadda saxlanılır...</span>
                </>
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