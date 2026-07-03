"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Upload, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useProfessions, useCategories, useGymDetailsAdmin } from "@/lib/query/gym-query";
import { useLessonTypes } from "@/lib/query/use-lesson-types";
import { useGymStore } from "@/lib/store/gym-store";
import { useUpdateTrainer } from "@/lib/query/trainers";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { createPortal } from "react-dom";

interface EditTrainerModalProps {
  onClose: () => void;
  trainer: any;
  index: number;
  isDashboard?: boolean;
}

export function EditTrainerModal({ onClose, trainer, index, isDashboard = false }: EditTrainerModalProps) {
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { gymId, step1Data, updateStep2Trainer } = useGymStore();
  const { data: professions } = useProfessions();
  const { data: categoriesData } = useCategories();
  const { data: gymDetails } = useGymDetailsAdmin(gymId);
  const { lessonTypes: allLessonTypes } = useLessonTypes();

  const updateTrainerMutation = useUpdateTrainer(Number(gymId));

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

  // 2. Load available lesson types for this gym/step1 selection
  const availableLessonTypes = useMemo(() => {
    return gymId
      ? (gymDetails?.lessonTypes || [])
      : (allLessonTypes?.filter((lt: any) => step1Data?.lessonTypeIds?.includes(lt.id)) || []);
  }, [gymId, gymDetails, allLessonTypes, step1Data]);

  // Lesson types are matched to categories by name: gym-scoped lesson types (GymLessonType)
  // are copies with their own IDs, distinct from the catalog LessonType IDs referenced in
  // category.lessonTypes, so IDs can't be intersected directly for an existing gym.
  const normalizeName = (name: string) => (name || "").trim().toLowerCase();
  const lessonTypeIdToName = useMemo(() => {
    return new Map(availableLessonTypes.map((lt: any) => [lt.id, normalizeName(lt.name)]));
  }, [availableLessonTypes]);
  const categoryHasLessonType = (category: any, ltId: number) => {
    const name = lessonTypeIdToName.get(ltId);
    if (!name) return false;
    return category.lessonTypes?.some((lt: any) => normalizeName(lt.name) === name) ?? false;
  };

  const [form, setForm] = useState({
    name: trainer.name || "",
    surname: trainer.surname || "",
    phone: trainer.phone || "",
    email: trainer.email || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    trainer.picture 
      ? (trainer.picture.startsWith("http") || trainer.picture.startsWith("/") ? trainer.picture : `/api/v1/media/stream/${trainer.picture}`)
      : (trainer.preview || null)
  );
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
        const matchingCat = availableCategories.find(c => categoryHasLessonType(c, ltId));
        if (matchingCat) {
          initialCatIds.add(matchingCat.id);
        }
      });
      if (initialCatIds.size > 0) {
        setSelectedCategoryIds(initialCatIds);
      }
    }
  }, [trainer.lessonTypeIds, availableCategories, selectedCategoryIds, lessonTypeIdToName]);

  // 3. Filter lesson types so we only display ones belonging to selectedCategories
  const activeLessonTypes = useMemo(() => {
    if (selectedCategoryIds.size === 0) return [];
    const selectedCats = availableCategories.filter((c) => selectedCategoryIds.has(c.id));
    const allowedNames = new Set(
      selectedCats.flatMap((c) => c.lessonTypes || []).map((lt: any) => normalizeName(lt.name))
    );
    return availableLessonTypes.filter((lt: any) => allowedNames.has(normalizeName(lt.name)));
  }, [availableLessonTypes, availableCategories, selectedCategoryIds]);

  // Clean up selected lesson types if their categories are deselected
  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
        const removedCategory = availableCategories.find((c) => c.id === catId);
        if (removedCategory && removedCategory.lessonTypes) {
          setSelectedLessonTypeIds((prevLts) => {
            const nextLts = new Set(prevLts);
            for (const ltId of prevLts) {
              const belongsToRemaining = availableCategories
                .filter((c) => c.id !== catId && next.has(c.id))
                .some((c) => categoryHasLessonType(c, ltId));
              if (!belongsToRemaining && categoryHasLessonType(removedCategory, ltId)) {
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
        const matchingCat = availableCategories.find(c => categoryHasLessonType(c, ltId));
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
  }, [form, selectedFile, selectedLessonTypeIds, selectedCategoryIds, trainer, availableCategories, lessonTypeIdToName]);

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

    if (!form.name.trim()) return toast.error("Ad daxil edilməlidir.");
    if (!form.surname.trim()) return toast.error("Soyad daxil edilməlidir.");

    const professionNameDisplay = dropdownLabel;
    
    if (isDashboard) {
      updateTrainerMutation.mutate({
        trainerId: Number(trainer.trainer_id),
        data: {
          name: form.name,
          surname: form.surname,
          professionId: trainer.profession?.id,
          phone: form.phone,
          email: form.email,
          photo: selectedFile || undefined,
          lessonTypeIds: Array.from(selectedLessonTypeIds)
        }
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["gym-trainers", Number(gymId)] });
          toast.success("Məşqçi məlumatları yeniləndi");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi");
        }
      });
    } else {
      updateStep2Trainer(index, {
        ...form,
        professionId: "",
        photo: selectedFile || undefined,
        preview: preview || "",
        professionName: professionNameDisplay,
        lessonTypeIds: Array.from(selectedLessonTypeIds)
      });
      onClose();
    }
  };

  const isPending = updateTrainerMutation.isPending;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-300">
      <div className="w-full max-w-[800px] max-h-[95vh] rounded-2xl bg-white border border-[#ececed] shadow-2xl overflow-y-auto flex flex-col p-6 md:p-8 gap-6 animate-in zoom-in-95 duration-300 font-sans">
        {/* Header */}
        <div className="w-full flex flex-col items-start">
          <div className="w-full h-10 flex items-center justify-between">
            <div className="flex-1 text-[20px] font-semibold text-[#101828]">Məşqçi detalları</div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center relative cursor-pointer hover:bg-slate-100 rounded-full transition-colors">
              <X size={18} className="text-[#6a7282]" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Left Column: Picture */}
            <div className="flex flex-col items-start gap-2 w-full md:w-[320px] shrink-0">
              <div className="w-full text-[15px] leading-6 text-black font-semibold">Məşqçi şəkili</div>
              <div className="w-full flex flex-col items-start gap-3">
                <input 
                  ref={fileRef}
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp" 
                  className="hidden" 
                  onChange={handlePhotoChange}
                />
                
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[200px] md:h-[240px] bg-[#fafafa] border-2 border-dashed border-[#ececed] rounded-xl relative cursor-pointer flex items-center justify-center overflow-hidden hover:border-[#00B4CC] transition-all group"
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Trainer Image" />
                  ) : (
                    <div className="text-[#6a7282] font-medium flex flex-col items-center gap-2 transition-transform group-hover:scale-105">
                      <Image src="/upload.svg" width={28} height={28} alt="Upload" className="opacity-60" />
                      <span className="text-[14px]">Şəkil yüklə</span>
                    </div>
                  )}
                </div>
                <div className="text-[12px] leading-5 text-[#6a7282] font-medium italic">
                  JPG or PNG • Max 10MB
                </div>
              </div>
            </div>

            {/* Right Column: Name details & Category details */}
            <div className="flex flex-col w-full md:flex-1 gap-4">
              <div className="w-full flex flex-col items-start gap-1.5">
                <div className="w-full text-[14px] leading-5 text-black/60 font-semibold">Ad <span className="text-red-500">*</span></div>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                  placeholder="Məs: Aysel"
                />
              </div>
              <div className="w-full flex flex-col items-start gap-1.5">
                <div className="w-full text-[14px] leading-5 text-black/60 font-semibold">Soyad <span className="text-red-500">*</span></div>
                <input 
                  type="text" 
                  value={form.surname} 
                  onChange={e => setForm({...form, surname: e.target.value})} 
                  className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none focus:border-[#00B4CC] transition-all placeholder:text-[#94979c] font-sans" 
                  placeholder="Məs: Quliyeva"
                />
              </div>

              {/* Category Select Dropdown */}
              <div className="w-full flex flex-col items-start gap-1.5" ref={categoryDropdownRef}>
                <div className="w-full text-[14px] leading-5 text-black/60 font-semibold">Kateqoriya seçimi</div>
                <div className="relative w-full">
                  <div 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full h-[44px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[15px] font-medium outline-none flex items-center justify-between cursor-pointer hover:border-[#00B4CC] transition-all font-sans select-none"
                  >
                    <span className={selectedCategoryIds.size > 0 ? "text-black" : "text-[#94979c]"}>
                      {selectedCategoryIds.size === 0 
                        ? "Kateqoriya seçin" 
                        : Array.from(selectedCategoryIds).map(id => availableCategories.find(c => c.id === id)?.name).filter(Boolean).join(", ")}
                    </span>
                    <ChevronDown size={18} className={cn("text-black/40 transition-transform duration-200", isCategoryDropdownOpen && "rotate-180")} />
                  </div>

                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white border border-[#ececed] rounded-xl shadow-lg z-50 max-h-[220px] overflow-y-auto p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                      {availableCategories.map((c: any) => {
                        const isSelected = selectedCategoryIds.has(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(c.id);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "bg-[#00B4CC]/10 text-[#00B4CC] font-medium" : "hover:bg-gray-50 text-black"
                            }`}
                          >
                            <span className="text-[14px]">{c.name}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#00B4CC] bg-[#00B4CC] text-white" : "border-gray-300"
                            }`}>
                              {isSelected && <span className="text-[10px] font-bold">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Type (Növ) Selection */}
              <div className="w-full flex flex-col items-start gap-1.5" ref={dropdownRef}>
                <div className="w-full text-[14px] leading-5 text-black/60 font-semibold">Növ</div>
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
              disabled={!isDirty || isPending}
              className={cn(
                "w-[280px] h-[48px] rounded-lg flex items-center justify-center px-4 font-semibold text-[16px] text-white transition-all shadow-md shadow-[#00B4CC]/10",
                isDirty && !isPending ? "bg-[#00B4CC] hover:opacity-90" : "bg-[#c1c1cc] cursor-not-allowed"
              )}
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : "Yadda saxla"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
