"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn, normalizePhoneNumber } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useCategories, useValidateGymStep1 } from "@/lib/query/gym-query";
import { GymStep1PayloadV2 } from "@/lib/types/gym";
import { toast } from "sonner";
import styles from "./step-info.module.css";

export function StepInfo({ onNext }: { onNext: () => void }) {
  const { step1Data, setStep1Data } = useGymStore();

  const [categoryIds, setCategoryIds] = useState<number[]>(step1Data?.categoryIds || []);
  const [name, setName] = useState(step1Data?.name || "");
  const [about, setAbout] = useState(step1Data?.description || "");
  const [phone, setPhone] = useState(step1Data?.phone || "");
  const [email, setEmail] = useState(step1Data?.email || "");

  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(new Set(step1Data?.lessonTypeIds || []));

  const [errors, setErrors] = useState<{ categoryId?: string, name?: string, phone?: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const validateStep1 = useValidateGymStep1();

  // Aggregate union of lesson types for all selected categories
  const selectedCategories = categoriesData?.items?.filter((c) => categoryIds.includes(c.id)) || [];
  const allLessonTypes = selectedCategories.reduce((acc, cat) => {
    if (cat.lessonTypes) {
      cat.lessonTypes.forEach((lt) => {
        if (!acc.some((item) => item.id === lt.id)) {
          acc.push(lt);
        }
      });
    }
    return acc;
  }, [] as { id: number; name: string }[]);

  // Synchronize selected lesson types when categories change
  useEffect(() => {
    if (!categoriesData?.items) return;
    const activeCategories = categoriesData.items.filter(c => categoryIds.includes(c.id));
    const activeLessonTypeIds = new Set(
      activeCategories.flatMap(c => c.lessonTypes || []).map(lt => lt.id)
    );
    setSelectedLessonTypeIds(prev => {
      const next = new Set(prev);
      let changed = false;
      for (const id of prev) {
        if (!activeLessonTypeIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [categoryIds, categoriesData]);

  const toggleCategory = (id: number) => {
    if (errors.categoryId) setErrors(p => ({ ...p, categoryId: undefined }));
    setCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleLessonType = (id: number) => {
    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildPayload = (): GymStep1PayloadV2 => ({
    categoryIds,
    name,
    description: about,
    phone: normalizePhoneNumber(phone),
    email: email.trim() === "" ? null : email.trim(),
    lessonTypeIds: Array.from(selectedLessonTypeIds),
  });

  const validateLocal = () => {
    const newErrors: typeof errors = {};
    if (!categoryIds || categoryIds.length === 0) newErrors.categoryId = "Kateqoriya seçilməlidir";
    if (!name) newErrors.name = "Zal adı daxil edilməlidir";
    if (!phone) newErrors.phone = "Telefon nömrəsi daxil edilməlidir";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateLocal()) return;

    try {
      const payload = buildPayload();
      await validateStep1.mutateAsync(payload);
      setStep1Data(payload);
      onNext();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Məlumatlar yanlışdır");
    }
  };

  const isSaving = validateStep1.isPending;

  return (
    <div className="flex flex-col gap-8 font-sans text-black animate-in fade-in duration-500">
      {/* Zal Məlumatları Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px]">Zal məlumatları</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* Category Dropdown Multi-Select */}
          <div className={styles.kateqoriyaParent} ref={dropdownRef}>
            <div className={styles.kateqoriya}>
              Kateqoriya seçimi <span className="text-red-500">*</span>
            </div>
            
            <div 
              className={styles.frameWrapper}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={styles.frameParent}>
                <div className={styles.frameGroup}>
                  {selectedCategories.length === 0 ? (
                    <span className={styles.placeholder}>Kateqoriya seçin</span>
                  ) : (
                    selectedCategories.map((cat) => (
                      <div key={cat.id} className={styles.frameContainer}>
                        <div className={styles.yogaWrapper}>
                          <div className={styles.yoga}>{cat.name}</div>
                        </div>
                        <div 
                          className={styles.x}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(cat.id);
                          }}
                        >
                          <div className={styles.x2}>
                            <Image 
                              className={styles.vectorIcon} 
                              width={15} 
                              height={15} 
                              sizes="100vw" 
                              alt="Sil"
                              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGxpbmUgeDE9IjE4IiB5MT0iNiIgeDI9IjYiIHkyPSIxOCI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4="
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.x}>
                  <Image 
                    className={styles.vuesaxlineararrowDownIcon} 
                    width={24} 
                    height={24} 
                    sizes="100vw" 
                    alt="Aç"
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTAxODI4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTUgOGw3IDcgNy03Ii8+PC9zdmc+"
                  />
                </div>
              </div>
            </div>
            
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center p-4 gap-2 text-sm text-black/50">
                    <Loader2 className="h-4 w-4 animate-spin text-[#00b4cc]" />
                    Kateqoriyalar yüklənir...
                  </div>
                ) : categoriesData?.items && categoriesData.items.length > 0 ? (
                  categoriesData.items.map((cat) => {
                    const isSelected = categoryIds.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          styles.dropdownItem,
                          isSelected && styles.dropdownItemActive
                        )}
                      >
                        <span>{cat.name}</span>
                        <div className={cn(
                          styles.checkbox,
                          isSelected && styles.checkboxActive
                        )}>
                          {isSelected && (
                            <svg className={styles.checkboxIcon} viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-sm text-black/40">
                    Kateqoriya tapılmadı
                  </div>
                )}
              </div>
            )}
            
            {errors.categoryId && <span className="text-red-500 text-xs font-medium">{errors.categoryId}</span>}
          </div>

          {/* Lesson Types Grid (Növlər) */}
          {allLessonTypes.length > 0 && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">Dərs növləri</label>
              <div className="w-full flex flex-wrap items-center gap-3">
                {allLessonTypes.map((lt) => {
                  const isSelected = selectedLessonTypeIds.has(lt.id);
                  return (
                    <div
                      key={lt.id}
                      onClick={() => toggleLessonType(lt.id)}
                      className={`flex-[1_1_calc(50%-8px)] sm:flex-none min-w-[120px] h-[48px] rounded-[8px] flex items-center justify-center px-4 cursor-pointer select-none transition-all duration-200 ${
                        isSelected 
                          ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc] text-[#00b4cc] font-medium" 
                          : "bg-[#fafafa] border border-[#ececed] text-[#101828] hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <span className="text-[14px] leading-[20px] truncate">{lt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gym Name */}
          <div className="flex flex-col gap-2">
             <label className="text-[14px] leading-[20px] text-black/60 font-medium">Zal adı <span className="text-red-500">*</span></label>
             <input 
               type="text"
               value={name}
               onChange={(e) => {
                 setName(e.target.value);
                 if (errors.name) setErrors(p => ({ ...p, name: undefined }));
               }}
               placeholder="Zal adı"
               className={cn(
                 "h-[44px] w-full bg-[#fafafa] border rounded-lg px-4 text-[15px] outline-none placeholder:text-black/40 font-medium transition-colors",
                 errors.name ? "border-red-500" : "border-[#ececed]"
               )}
             />
             {errors.name && <span className="text-red-500 text-xs font-medium">{errors.name}</span>}
          </div>

          {/* About */}
          <div className="flex flex-col gap-2">
             <label className="text-[14px] leading-[20px] text-black/60 font-medium">Haqqında</label>
             <textarea 
               value={about}
               onChange={(e) => setAbout(e.target.value)}
               placeholder="Haqqında"
               className="h-[80px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg p-4 text-[15px] outline-none resize-none placeholder:text-black/40 font-medium"
             />
          </div>
        </div>
      </div>

      {/* Əlaqə Section */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-[#ececed] pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px]">Əlaqə</h2>
        </div>
        
        <div className="flex flex-col gap-4">
           <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">Telefon nömrəsi <span className="text-red-500">*</span></label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(p => ({ ...p, phone: undefined }));
                }}
                placeholder="+994 00 000 00 00"
                className={cn(
                  "h-[44px] w-full bg-[#fafafa] border rounded-lg px-4 text-[15px] font-semibold outline-none placeholder:text-black/40 transition-colors",
                  errors.phone ? "border-red-500" : "border-[#ececed]"
                )}
              />
              {errors.phone && <span className="text-red-500 text-xs font-medium">{errors.phone}</span>}
           </div>
           
           <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px] text-black/60 font-medium">E-Poçt</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asss@gmail.com"
                className="h-[44px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg px-4 text-[15px] font-semibold outline-none placeholder:text-black/40"
              />
           </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button 
          onClick={() => {
            const { resetStep1Data } = useGymStore.getState();
            resetStep1Data();
            setCategoryIds([]);
            setName("");
            setAbout("");
            setPhone("");
            setEmail("");
            setSelectedLessonTypeIds(new Set());
            setErrors({});
          }}
          className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
        >
          Sıfırla
        </button>
        <button 
          onClick={handleNext}
          disabled={isSaving}
          className="h-[40px] w-[240px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>
    </div>
  );
}
