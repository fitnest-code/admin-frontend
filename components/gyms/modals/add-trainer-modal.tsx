"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  useAddTrainer, 
  useProfessions 
} from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

export function AddTrainerModal({ onClose, isDashboard = false }: { onClose: () => void, isDashboard?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const id = useGymStore((state) => state.gymId);

  const { data: professions, isLoading: professionsLoading } = useProfessions();
  const { mutate: createTrainerAPI, isPending: createPending } = useAddTrainer();
  
  const isPending = createPending;

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
          gymId: Number(id),
          payload: {
            name: form.name,
            surname: form.surname,
            professionId: Number(form.professionId),
            phone: form.phone,
            email: form.email,
            photo: selectedFile,
          }
        },
        {
          onSuccess: () => {
            onClose();
          },
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-[1040px] max-h-[95vh] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-y-auto flex flex-col p-5 md:p-8 gap-6 md:gap-[34px] animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="w-full flex flex-col items-start">
          <div className="w-full h-12 flex items-center justify-between">
            <div className="flex-1 text-[24px] font-semibold text-[#101828]">Məşqçi əlavə et</div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-[#6a7282]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-[34px]">
          <div className="w-full flex flex-col xl:flex-row gap-6 md:gap-8 items-start">
            
            {/* Photo Section */}
            <div className="flex flex-col items-start gap-3 w-full xl:w-[444px] shrink-0">
              <div className="w-full text-[18px] leading-[28px] text-black font-semibold">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-4">
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[240px] md:h-[308px] bg-[#fafafa] border-2 border-dashed border-[#ececed] rounded-xl relative cursor-pointer flex items-center justify-center overflow-hidden hover:border-[#00B4CC] transition-all group"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Trainer" />
                  ) : (
                    <div className="text-[#6a7282] font-medium flex flex-col items-center gap-3 transition-transform group-hover:scale-105">
                      <Image src="/upload.svg" width={32} height={32} alt="Upload" className="opacity-60" />
                      <span className="text-[16px]">Şəkil yüklə</span>
                    </div>
                  )}
                </div>
                <div className="text-[14px] leading-5 tracking-[-0.15px] text-[#6a7282] font-medium italic">JPG or PNG • Max size 2MB</div>
              </div>
            </div>

            {/* Inputs Right Section */}
            <div className="flex flex-col w-full xl:flex-1 gap-5">
              <div className="w-full flex flex-col items-start gap-2.5">
                <div className="w-full text-[16px] leading-6 text-black font-semibold">Ad</div>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                  placeholder="Məs: Aysel"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-2.5">
                <div className="w-full text-[16px] leading-6 text-black font-semibold">Soyad</div>
                <input 
                  type="text" 
                  value={form.surname} 
                  onChange={e => setForm({...form, surname: e.target.value})} 
                  className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                  placeholder="Məs: Quliyeva"
                />
              </div>

              <div className="w-full flex flex-col items-start gap-2.5">
                <div className="w-full text-[16px] leading-6 text-black font-semibold">Növ</div>
                <div className="relative w-full">
                  <select 
                    value={form.professionId} 
                    onChange={e => setForm({...form, professionId: e.target.value})} 
                    className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] appearance-none cursor-pointer transition-all font-sans" 
                  >
                    <option value="">İxtisas seçin</option>
                    {professions?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center gap-5 md:gap-8">
            <div className="flex flex-col items-start gap-2.5">
              <div className="w-full text-[16px] leading-6 text-black font-semibold">Telefon nömrəsi</div>
              <input 
                type="text" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                placeholder="+994 50 578 56 56"
              />
            </div>
            <div className="flex flex-col items-start gap-2.5">
              <div className="w-full text-[16px] leading-6 text-black font-semibold">E-Poçt</div>
              <input 
                type="text" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                placeholder="aysel.quliyeva@gmail.com"
              />
            </div>
          </div>

          <div className="w-full flex justify-center mt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className={`w-[280px] h-12 rounded-[10px] flex items-center justify-center px-4 font-medium text-[16px] text-white transition-all 
                ${isPending ? 'bg-[#c1c1cc]' : 'bg-[#00B4CC] hover:bg-[#009DB3] shadow-sm'}`}
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : "Yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
