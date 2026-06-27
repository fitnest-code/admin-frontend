"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Upload, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useProfessions, useCategories, useGymDetailsAdmin } from "@/lib/query/gym-query";
import { useLessonTypes } from "@/lib/query/use-lesson-types";
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
  const { gymId, step1Data, updateStep2Trainer } = useGymStore();
  const { data: professions } = useProfessions();
  const { data: categoriesData } = useCategories();
  const { data: gymDetails } = useGymDetailsAdmin(gymId);
  const { lessonTypes: allLessonTypes } = useLessonTypes();

  // 1. Get only category IDs added in Step 1
  const activeCategoryIds = useMemo(() => {
    if (gymId && gymDetails) {
      const mainIds = gymDetails.mainCategories?.map((c: any) => c.id) || [];
      const subIds = gymDetails.subCategories?.map((c: any) => c.id) || [];
      return new Set<number>([...mainIds, ...subIds]);
    } else if (step1Data) {
      const mainIds = step1Data.mainCategoryDetails?.map((d) => d.categoryId) || [];
      const subIds = step1Data.subCategoryDetails?.map((d) => d.categoryId) || [];
      return new Set<number>([...mainIds, ...subIds]);
    }
    return new Set<number>();
  }, [gymId, gymDetails, step1Data]);

  // Filter global category items
  const availableCategories = useMemo(() => {
    return categoriesData?.items?.filter((c) => activeCategoryIds.has(c.id)) || [];
  }, [categoriesData, activeCategoryIds]);

  const [form, setForm] = useState({
    name: trainer.name || "",
    surname: trainer.surname || "",
    phone: trainer.phone || "",
    email: trainer.email || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(trainer.preview || null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(
    new Set(trainer.lessonTypeIds || [])
  );
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-detect and pre-select categories based on trainer's current lessonTypeIds
  useEffect(() => {
    if (trainer.lessonTypeIds && availableCategories.length > 0 && selectedCategoryIds.size === 0) {
      const initialCatIds = new Set<number>();
      trainer.lessonTypeIds.forEach((ltId: number) => {
        const matchingCat = availableCategories.find(c => 
          c.lessonTypes?.some((lt: any) => lt.id === ltId)
        );
        if (matchingCat) {
          initialCatIds.add(matchingCat.id);
        }
      });
      if (initialCatIds.size > 0) {
        setSelectedCategoryIds(initialCatIds);
      }
    }
  }, [trainer.lessonTypeIds, availableCategories, selectedCategoryIds]);

  // Load available lesson types for this gym/step1 selection
  const availableLessonTypes = useMemo(() => {
    return gymId 
      ? (gymDetails?.lessonTypes || [])
      : (allLessonTypes?.filter((lt: any) => step1Data?.lessonTypeIds?.includes(lt.id)) || []);
  }, [gymId, gymDetails, allLessonTypes, step1Data]);

  // Filter lesson types so we only display ones belonging to selectedCategoryIds
  const activeLessonTypes = useMemo(() => {
    if (selectedCategoryIds.size === 0) return [];
    const selectedCats = availableCategories.filter((c) => selectedCategoryIds.has(c.id));
    const allowedLessonTypeIds = new Set(
      selectedCats.flatMap((c) => c.lessonTypes || []).map((lt: any) => lt.id)
    );
    return availableLessonTypes.filter((lt: any) => allowedLessonTypeIds.has(lt.id));
  }, [availableLessonTypes, availableCategories, selectedCategoryIds]);

  // Clean up selected lesson types if their categories are deselected
  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
        const removedCategory = availableCategories.find((c) => c.id === catId);
        if (removedCategory && removedCategory.lessonTypes) {
          const removedLtIds = new Set(removedCategory.lessonTypes.map((lt: any) => lt.id));
          setSelectedLessonTypeIds((prevLts) => {
            const nextLts = new Set(prevLts);
            for (const ltId of prevLts) {
              const belongsToRemaining = availableCategories
                .filter((c) => c.id !== catId && next.has(c.id))
                .some((c) => c.lessonTypes?.some((lt: any) => lt.id === ltId));
              if (!belongsToRemaining && removedLtIds.has(ltId)) {
                nextLts.delete(ltId);
              }
            }
            return nextLts;
          });
        }
      } else {
        next.add(catId);
      }
      return next;
    });
  };

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

  const selectedLessonTypesList = activeLessonTypes.filter((lt: any) => selectedLessonTypeIds.has(lt.id));

  let dropdownLabel = "Dərs növü seçin (İstəyə bağlı)";
  if (selectedLessonTypesList.length === 1) {
    dropdownLabel = selectedLessonTypesList[0].name;
  } else if (selectedLessonTypesList.length > 1) {
    dropdownLabel = `${selectedLessonTypesList[0].name} +${selectedLessonTypesList.length - 1}`;
  }

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isDirty = useMemo(() => {
    const origLessons = [...(trainer.lessonTypeIds || [])].sort().join(",");
    const currLessons = Array.from(selectedLessonTypeIds).sort().join(",");
    
    // Check if category selection changed from initial
    const initialCatIds = new Set<number>();
    if (trainer.lessonTypeIds && availableCategories.length > 0) {
      trainer.lessonTypeIds.forEach((ltId: number) => {
        const matchingCat = availableCategories.find(c => 
          c.lessonTypes?.some((lt: any) => lt.id === ltId)
        );
        if (matchingCat) initialCatIds.add(matchingCat.id);
      });
    }
    const origCats = Array.from(initialCatIds).sort().join(",");
    const currCats = Array.from(selectedCategoryIds).sort().join(",");

    return (
      form.name !== trainer.name ||
      form.surname !== trainer.surname ||
      form.phone !== trainer.phone ||
      form.email !== trainer.email ||
      selectedFile !== null ||
      origLessons !== currLessons ||
      origCats !== currCats
    );
  }, [form, selectedFile, selectedLessonTypeIds, selectedCategoryIds, trainer, availableCategories]);

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
    <div className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-[800px] max-h-[95vh] rounded-2xl bg-white border border-[#ececed] shadow-2xl overflow-y-auto flex flex-col p-6 md:p-8 gap-6 animate-in zoom-in-95 duration-300 font-sans">
        
        {/* Header */}
        <div className="w-full h-10 flex items-center justify-between border-b border-[#ececed] pb-2">
          <div className="text-[20px] font-semibold text-[#101828]">Məşqçi detalları</div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors">
            <X size={18} className="text-[#6a7282]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Photo Section */}
            <div className="flex flex-col items-start gap-2 w-full md:w-[320px] shrink-0">
              <div className="text-[15px] leading-6 text-black font-semibold">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-3">
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[200px] md:h-[240px] rounded-[16px] border border-[#ececed] relative cursor-pointer flex items-center justify-center overflow-hidden hover:opacity-90 transition-all group bg-cover bg-center bg-no-repeat"
                  style={preview ? { backgroundImage: `url(${preview})` } : { backgroundColor: '#fafafa' }}
                >
                  {/* Overlay for "Change photo" */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                    preview ? "bg-black/40" : ""
                  )}>
                    <div className="flex flex-col items-center gap-4">
                      <Image 
                        src="/Şəkil dəyiş/Icon.svg" 
                        width={32} 
                        height={32} 
                        alt="Change" 
                        className={cn(preview ? "brightness-0 invert" : "")} 
                      />
                      <span className={cn(
                        "text-[13px] leading-5 font-medium tracking-[-0.15px] font-inter",
                        preview ? "text-white" : "text-black"
                      )}>
                        Şəkili dəyiş
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[12px] text-[#6a7282] font-medium italic">JPG or PNG • Max size 10MB</div>
              </div>
            </div>

            {/* Inputs Section */}
            <div className="flex flex-col w-full md:flex-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-[14px] font-semibold text-black/60">Ad <span className="text-red-500">*</span></div>
                <input 
                  type="text" 
                  value={form.name} 
                  required
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all" 
                  placeholder="Məs: Aysel"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-[14px] font-semibold text-black/60">Soyad <span className="text-red-500">*</span></div>
                <input 
                  type="text" 
                  value={form.surname} 
                  required
                  onChange={e => setForm({...form, surname: e.target.value})} 
                  className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all" 
                  placeholder="Məs: Quliyeva"
                />
              </div>

              {/* Category Select - Multi Select */}
              <div className="w-full flex flex-col items-start gap-1.5" ref={categoryDropdownRef}>
                <div className="w-full text-[14px] leading-5 text-black/60 font-semibold">Kateqoriya</div>
                <div className="relative w-full">
                  <div 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="min-h-[44px] w-full rounded-lg bg-[#fafafa] border border-[#ececed] px-3 py-2 text-[15px] font-medium outline-none flex flex-wrap items-center justify-between cursor-pointer hover:border-[#00B4CC] transition-all font-sans select-none gap-1.5"
                  >
                    {selectedCategoryIds.size > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                        {availableCategories.filter(c => selectedCategoryIds.has(c.id)).map(cat => (
                          <div 
                            key={cat.id} 
                            className="bg-[#00b4cc] text-white text-xs font-semibold rounded px-2.5 py-1 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <span>{cat.name}</span>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(cat.id);
                              }}
                              className="text-white/60 hover:text-white cursor-pointer font-bold leading-none text-xs"
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#94979c]">Kateqoriya seçin</span>
                    )}
                    <ChevronDown size={18} className={`text-black/40 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white border border-[#ececed] rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {availableCategories.map((cat: any) => {
                        const isSelected = selectedCategoryIds.has(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(cat.id);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "bg-[#00B4CC]/10 text-[#00B4CC] font-medium" : "hover:bg-gray-50 text-black"
                            }`}
                          >
                            <span className="text-[14px]">{cat.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#00B4CC] bg-[#00B4CC] text-white" : "border-gray-300"
                            }`}>
                              {isSelected && <span className="text-[10px] font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                      {availableCategories.length === 0 && (
                        <div className="px-3 py-3 text-sm text-gray-400 text-center">
                          Kateqoriya tapılmadı
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Type selector */}
              <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                <div className="text-[14px] font-semibold text-black/60">Növ</div>
                <div className="relative w-full">
                  <div 
                    onClick={() => {
                      if (selectedCategoryIds.size > 0) {
                        setIsDropdownOpen(!isDropdownOpen);
                      }
                    }}
                    className={cn(
                      "w-full h-[44px] rounded-lg border px-4 text-[15px] font-medium outline-none flex items-center justify-between font-sans select-none transition-all",
                      selectedCategoryIds.size === 0 
                        ? "bg-slate-50 border-slate-200 text-slate-400/70 cursor-not-allowed" 
                        : "bg-[#fafafa] border-[#ececed] cursor-pointer hover:border-[#00B4CC]"
                    )}
                  >
                    <span>
                      {selectedCategoryIds.size === 0 
                        ? "Əvvəlcə kateqoriya seçin" 
                        : dropdownLabel}
                    </span>
                    <ChevronDown size={18} className={cn("text-black/40 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                  </div>

                  {isDropdownOpen && selectedCategoryIds.size > 0 && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white border border-[#ececed] rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {activeLessonTypes.map((lt: any) => {
                        const isSelected = selectedLessonTypeIds.has(lt.id);
                        return (
                          <div
                            key={lt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonType(lt.id);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "bg-[#00B4CC]/10 text-[#00B4CC] font-medium" : "hover:bg-gray-50 text-black"
                            }`}
                          >
                            <span className="text-[14px]">{lt.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#00B4CC] bg-[#00B4CC] text-white" : "border-gray-300"
                            }`}>
                              {isSelected && <span className="text-[10px] font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                      {activeLessonTypes.length === 0 && (
                        <div className="px-3 py-3 text-sm text-gray-400 text-center">
                          Bu kateqoriyalar üçün dərs növü tapılmadı
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="text-[14px] font-semibold text-black/60">Telefon nömrəsi</div>
              <input 
                type="text" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all" 
                placeholder="+994 50 578 56 56"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-[14px] font-semibold text-black/60">E-Poçt</div>
              <input 
                type="text" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all" 
                placeholder="aysel.quliyeva@gmail.com"
              />
            </div>
          </div>

          <div className="w-full flex justify-center mt-2">
            <button 
              type="submit" 
              disabled={!isDirty}
              className={cn(
                "w-[280px] h-[48px] rounded-lg flex items-center justify-center px-4 font-semibold text-[16px] text-white transition-all shadow-md shadow-[#00B4CC]/10",
                isDirty ? "bg-[#00B4CC] hover:opacity-90" : "bg-[#c1c1cc] cursor-not-allowed"
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
