"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, RefreshCw, ChevronDown, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { 
  useProfessions,
  useCategories,
  useGymDetailsAdmin
} from "@/lib/query/gym-query";
import { useCreateTrainer } from "@/lib/query/trainers";
import { useLessonTypes } from "@/lib/query/use-lesson-types";
import { useGymStore } from "@/lib/store/gym-store";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { createPortal } from "react-dom";

export function AddTrainerModal({ onClose, isDashboard = false }: { onClose: () => void, isDashboard?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const id = useGymStore((state) => state.gymId);

  const { data: professions, isLoading: professionsLoading } = useProfessions();
  const { mutate: createTrainerAPI, isPending: createPending } = useCreateTrainer(Number(id));
  
  const isPending = createPending;

  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { step1Data, addStep2Trainer } = useGymStore();
  const { data: gymDetails } = useGymDetailsAdmin(id);
  const { lessonTypes: allLessonTypes } = useLessonTypes();

  // If we are in wizard (no gymId yet), use lesson types from Step 1 store
  const availableLessonTypes = id 
    ? (gymDetails?.lessonTypes || [])
    : (allLessonTypes?.filter((lt: any) => step1Data?.lessonTypeIds?.includes(lt.id)) || []);

  const selectedLessonTypesList = availableLessonTypes.filter((lt: any) => selectedLessonTypeIds.has(lt.id));

  let dropdownLabel = "Dərs növü seçin (İstəyə bağlı)";
  if (selectedLessonTypesList.length === 1) {
    dropdownLabel = selectedLessonTypesList[0].name;
  } else if (selectedLessonTypesList.length > 1) {
    dropdownLabel = `${selectedLessonTypesList[0].name} +${selectedLessonTypesList.length - 1}`;
  }

  const toggleLessonType = (ltId: number) => {
    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(ltId)) {
        next.delete(ltId);
      } else {
        next.add(ltId);
      }
      return next;
    });
  };

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
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id && isDashboard) return toast.error("Zal ID tapılmadı.");
    if (!form.name || !form.surname || !selectedFile) {
      return toast.error("Zəhmət olmasa ulduzlu (*) sahələri doldurun və şəkil seçin.");
    }
    // Dərs növü seçimi artıq məcburi deyil, boş ola bilər.

    const professionNameDisplay = dropdownLabel;

    if (isDashboard) {
      createTrainerAPI(
        {
          ...form,
          professionId: undefined,
          photo: selectedFile,
          lessonTypeIds: Array.from(selectedLessonTypeIds),
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gym-trainers"] });
            onClose();
          },
          onError: (err: any) => {
            toast.error(err?.message || "Xəta baş verdi");
          }
        }
      );
    } else {
      addStep2Trainer({
        ...form,
        professionId: "",
        photo: selectedFile,
        preview: preview!,
        professionName: professionNameDisplay,
        lessonTypeIds: Array.from(selectedLessonTypeIds),
      });
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
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

              <div className="w-full flex flex-col items-start gap-2.5" ref={dropdownRef}>
                <div className="w-full text-[16px] leading-6 text-black font-semibold">Növ</div>
                <div className="relative w-full">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-[60px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[18px] font-semibold outline-none flex items-center justify-between cursor-pointer hover:border-[#00B4CC] transition-all font-sans select-none"
                  >
                    <span className={selectedLessonTypeIds.size > 0 ? "text-black" : "text-[#94979c]"}>
                      {dropdownLabel}
                    </span>
                    <ChevronDown size={24} className={`text-black/40 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white border border-[#ececed] rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {availableLessonTypes.map((lt: any) => {
                        const isSelected = selectedLessonTypeIds.has(lt.id);
                        return (
                          <div
                            key={lt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonType(lt.id);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "bg-[#00B4CC]/10 text-[#00B4CC] font-medium" : "hover:bg-gray-50 text-black"
                            }`}
                          >
                            <span className="text-[16px]">{lt.name}</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#00B4CC] bg-[#00B4CC] text-white" : "border-gray-300"
                            }`}>
                              {isSelected && <span className="text-[12px] font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                      {availableLessonTypes.length === 0 && (
                        <div className="px-3 py-3 text-sm text-gray-400 text-center">
                          Dərs növü tapılmadı
                        </div>
                      )}
                    </div>
                  )}
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
    </div>,
    document.body
  );
}
