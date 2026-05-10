"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useAddTrainer,
  useProfessionsQuery,
} from "@/lib/query/add-trainer-query";
import { useGymStore } from "@/lib/store/gym-store";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateTrainer } from "@/lib/query/trainers";
import Image from "next/image";

export function AddTrainerModal({ onClose, isDashboard = false }: { onClose: () => void, isDashboard?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const id = useGymStore((state) => state.gymId);

  const { data: professions, isLoading: professionsLoading } = useProfessionsQuery();
  const { mutate: createTrainerAPI, isPending: createPending } = useCreateTrainer(Number(id) || 1);
  const { mutate: uploadBatch, isPending: batchPending } = useAddTrainer();
  
  const isPending = createPending || batchPending;

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
    if (!id && isDashboard) return toast.error("Zal ID tapılmadı.");
    if (!form.name || !form.surname || !form.professionId || !selectedFile) {
      return toast.error("Zəhmət olmasa ulduzlu (*) sahələri doldurun və şəkil seçin.");
    }

    if (isDashboard) {
      createTrainerAPI(
        {
          name: form.name,
          surname: form.surname,
          professionId: Number(form.professionId),
          phone: form.phone,
          email: form.email,
          photo: selectedFile,
        },
        {
          onSuccess: () => {
            toast.success("Məşqçi əlavə edildi");
            queryClient.invalidateQueries({ queryKey: ["gym-trainers"] });
            onClose();
          },
          onError: () => toast.error("Xəta baş verdi"),
        }
      );
    } else {
      const professionName = professions?.find((p) => String(p.id) === form.professionId)?.name;
      addStep2Trainer({
        ...form,
        photo: selectedFile,
        preview: preview!,
        professionName,
      });
      toast.success("Məşqçi siyahıya əlavə edildi");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[800px] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-hidden flex flex-col p-6 gap-[34px] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="w-full flex flex-col items-start">
          <div className="w-full h-12 flex items-center justify-between">
            <div className="flex-1 text-[24px] font-semibold text-[#101828] font-['SF_Pro']">Məşqçi əlavə et</div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-[#6a7282]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-[34px]">
          <div className="w-full flex flex-col md:flex-row gap-5 items-start">
            
            {/* Photo Section */}
            <div className="flex flex-col items-start gap-3 w-full md:w-[444px]">
              <div className="w-full text-[18px] leading-[28px] text-black">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-4">
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[308px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative cursor-pointer flex items-center justify-center overflow-hidden hover:border-[#00B4CC] transition-colors"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Trainer" />
                  ) : (
                    <div className="text-[#6a7282] font-medium flex flex-col items-center gap-2">
                      <Image src="/upload.svg" width={32} height={32} alt="Upload" />
                      <span>Şəkil yüklə</span>
                    </div>
                  )}
                </div>
                <div className="text-[14px] leading-5 tracking-[-0.15px] text-[#6a7282]">JPG or PNG • Max size 2MB</div>
              </div>
            </div>

            {/* Inputs Right Section */}
            <div className="flex flex-col w-full md:w-auto md:flex-1 gap-3">
              <div className="w-full flex flex-col items-start gap-3">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Ad</div>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                  placeholder="Məs: Aysel"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-3 mt-1">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Soyad</div>
                <input 
                  type="text" 
                  value={form.surname} 
                  onChange={e => setForm({...form, surname: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                  placeholder="Məs: Quliyeva"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-3 mt-1">
                <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Növ</div>
                <select 
                  value={form.professionId} 
                  onChange={e => setForm({...form, professionId: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC] appearance-none" 
                >
                  <option value="">İxtisas seçin</option>
                  {professions?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-5 mt-2">
            <div className="flex flex-col items-start gap-3 w-full md:w-[48%]">
              <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">Telefon nömrəsi</div>
              <input 
                type="text" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                placeholder="+994 50 578 56 56"
              />
            </div>
            <div className="flex flex-col items-start gap-3 w-full md:w-[48%]">
              <div className="w-full text-[16px] leading-6 text-black font-['SF_Pro']">E-Poçt</div>
              <input 
                type="text" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[18px] font-semibold outline-none focus:border-[#00B4CC]" 
                placeholder="aysel.quliyeva@gmail.com"
              />
            </div>
          </div>

          <div className="w-full flex justify-center mt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className={`w-[280px] h-12 rounded-[10px] flex items-center justify-center px-4 font-medium text-[16px] text-white transition-colors 
                ${isPending ? 'bg-[#c1c1cc]' : 'bg-[#00B4CC] hover:bg-[#009DB3]'}`}
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : "Yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
