"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Upload, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useProfessions } from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createPortal } from "react-dom";

interface EditTrainerModalProps {
  onClose: () => void;
  trainer: any;
  index: number;
}

export function EditTrainerModal({ onClose, trainer, index }: EditTrainerModalProps) {
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateStep2Trainer } = useGymStore();
  const { data: professions } = useProfessions();

  const [form, setForm] = useState({
    name: trainer.name || "",
    surname: trainer.surname || "",
    professionId: String(trainer.professionId || ""),
    phone: trainer.phone || "",
    email: trainer.email || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(trainer.preview || null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isDirty = useMemo(() => {
    return (
      form.name !== trainer.name ||
      form.surname !== trainer.surname ||
      form.professionId !== String(trainer.professionId) ||
      form.phone !== trainer.phone ||
      form.email !== trainer.email ||
      selectedFile !== null
    );
  }, [form, selectedFile, trainer]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    if (!form.name || !form.surname || !form.professionId) {
      return toast.error("Zəhmət olmasa ulduzlu (*) sahələri doldurun.");
    }

    const professionName = professions?.find((p) => String(p.id) === form.professionId)?.name;
    
    updateStep2Trainer(index, {
      ...form,
      photo: selectedFile || trainer.photo,
      preview: preview!,
      professionName: professionName || trainer.professionName,
    });

    toast.success("Məşqçi məlumatları yeniləndi");
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-[1040px] max-h-[95vh] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-y-auto flex flex-col p-5 md:p-8 gap-6 md:gap-[34px] animate-in fade-in zoom-in duration-200 font-sans">
        
        {/* Header */}
        <div className="w-full h-12 flex items-center justify-between">
          <div className="text-[24px] font-semibold text-[#101828]">Məşqçi detalları</div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-[#6a7282]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-[34px]">
          <div className="w-full flex flex-col xl:flex-row gap-6 md:gap-8 items-start">
            
            {/* Photo Section */}
            <div className="flex flex-col items-start gap-3 w-full xl:w-[444px] shrink-0">
              <div className="text-[18px] leading-[28px] text-black font-semibold">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-4">
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[308px] rounded-[16px] border border-[#ececed] relative cursor-pointer flex items-center justify-center overflow-hidden hover:opacity-90 transition-all group bg-cover bg-center bg-no-repeat"
                  style={preview ? { backgroundImage: `url(${preview})` } : { backgroundColor: '#fafafa' }}
                >
                  {/* Overlay for "Change photo" */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-[30px] transition-all duration-300",
                    preview ? "bg-black/40" : ""
                  )}>
                    <div className="flex flex-col items-center gap-[30px]">
                      <Image 
                        src="/Şəkil dəyiş/Icon.svg" 
                        width={40} 
                        height={40} 
                        alt="Change" 
                        className={cn(preview ? "brightness-0 invert" : "")} 
                      />
                      <span className={cn(
                        "text-[14px] leading-[20px] font-medium tracking-[-0.15px] font-inter",
                        preview ? "text-white" : "text-black"
                      )}>
                        Şəkili dəyiş seç
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[14px] text-[#6a7282] font-medium italic">JPG or PNG • Max size 2MB</div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="flex flex-col w-full xl:flex-1 gap-5">
              {[
                { label: "Ad", key: "name", placeholder: "Məs: Aysel" },
                { label: "Soyad", key: "surname", placeholder: "Məs: Quliyeva" }
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-2.5">
                  <div className="text-[16px] font-semibold">{field.label}</div>
                  <input 
                    type="text" 
                    value={(form as any)[field.key]} 
                    onChange={e => setForm({...form, [field.key]: e.target.value})} 
                    className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all" 
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-2.5">
                <div className="text-[16px] font-semibold">Növ</div>
                <div className="relative w-full">
                  <select 
                    value={form.professionId} 
                    onChange={e => setForm({...form, professionId: e.target.value})} 
                    className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] appearance-none cursor-pointer transition-all" 
                  >
                    <option value="">İxtisas seçin</option>
                    {professions?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/40">
                    <ChevronDown size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            <div className="flex flex-col gap-2.5">
              <div className="text-[16px] font-semibold">Telefon nömrəsi</div>
              <input 
                type="text" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all" 
                placeholder="+994 50 578 56 56"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="text-[16px] font-semibold">E-Poçt</div>
              <input 
                type="text" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none focus:border-[#00B4CC] transition-all" 
                placeholder="aysel.quliyeva@gmail.com"
              />
            </div>
          </div>

          <div className="w-full flex justify-center mt-2">
            <button 
              type="submit" 
              disabled={!isDirty}
              className={cn(
                "w-[280px] h-12 rounded-[10px] flex items-center justify-center px-4 font-medium text-[16px] text-white transition-all shadow-sm",
                isDirty ? "bg-[#00B4CC] hover:bg-[#009DB3]" : "bg-[#c1c1cc] cursor-not-allowed"
              )}
            >
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
