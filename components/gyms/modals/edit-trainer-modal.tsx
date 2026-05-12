"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Upload, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useProfessions, useCategories, useGymDetailsAdmin } from "@/lib/query/gym-query";
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
  const gymId = useGymStore((state) => state.gymId);
  const { updateStep2Trainer } = useGymStore();
  const { data: professions } = useProfessions();
  const { data: categoriesData } = useCategories();
  const { data: gymDetails } = useGymDetailsAdmin(gymId);

  const [form, setForm] = useState({
    name: trainer.name || "",
    surname: trainer.surname || "",
    phone: trainer.phone || "",
    email: trainer.email || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(trainer.preview || null);
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(
    new Set(trainer.lessonTypeIds || [])
  );
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

  const availableLessonTypes = gymDetails?.lessonTypes || [];
  const selectedLessonTypesList = availableLessonTypes.filter((lt: any) => selectedLessonTypeIds.has(lt.id));

  let dropdownLabel = "Dərs növü seçin";
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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isDirty = useMemo(() => {
    const origLessons = [...(trainer.lessonTypeIds || [])].sort().join(",");
    const currLessons = Array.from(selectedLessonTypeIds).sort().join(",");
    return (
      form.name !== trainer.name ||
      form.surname !== trainer.surname ||
      form.phone !== trainer.phone ||
      form.email !== trainer.email ||
      selectedFile !== null ||
      origLessons !== currLessons
    );
  }, [form, selectedFile, selectedLessonTypeIds, trainer]);

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

    if (!form.name || !form.surname) {
      return toast.error("Zəhmət olmasa ulduzlu (*) sahələri doldurun.");
    }
    if (selectedLessonTypeIds.size === 0) {
      return toast.error("Zəhmət olmasa ən azı bir dərs növü seçin.");
    }

    const professionNameDisplay = dropdownLabel;
    
    updateStep2Trainer(index, {
      ...form,
      professionId: "",
      photo: selectedFile || trainer.photo,
      preview: preview!,
      professionName: professionNameDisplay,
      lessonTypeIds: Array.from(selectedLessonTypeIds),
    });

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

              <div className="flex flex-col gap-2.5" ref={dropdownRef}>
                <div className="text-[16px] font-semibold">Növ</div>
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
