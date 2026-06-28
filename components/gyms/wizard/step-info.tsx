"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Trash2, ChevronDown, Check, AlertCircle } from "lucide-react";
import { cn, normalizePhoneNumber } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useCategories, useValidateGymStep1 } from "@/lib/query/gym-query";
import { CategoryDetail, GymStep1PayloadV2 } from "@/lib/types/gym";
import { toast } from "sonner";
import Image from "next/image";

const AZ_PHONE_REGEX = /^(\+994|0)?\s?(10|50|51|55|60|70|77|99)(\s?\d){7}$/;

interface SubcategoryBlock {
  id: string;
  categoryId: number | null;
  phone: string;
  about: string;
}

export function StepInfo({ onNext }: { onNext: () => void }) {
  const { step1Data, setStep1Data } = useGymStore();

  const [name, setName] = useState(step1Data?.name || "");
  const [about, setAbout] = useState(step1Data?.description || "");
  const [phone, setPhone] = useState(step1Data?.phone || "");
  const [email, setEmail] = useState(step1Data?.email || "");

  const [mainCategoryId, setMainCategoryId] = useState<number | null>(
    step1Data?.mainCategoryDetails?.[0]?.categoryId || null
  );

  const [hasSubcategories, setHasSubcategories] = useState<boolean>(
    step1Data?.hasSubcategories ?? !!(step1Data?.subCategoryDetails && step1Data.subCategoryDetails.length > 0)
  );

  const [subCategoryBlocks, setSubCategoryBlocks] = useState<SubcategoryBlock[]>(() => {
    if (step1Data?.subCategoryDetails && step1Data.subCategoryDetails.length > 0) {
      return step1Data.subCategoryDetails.map((detail, idx) => ({
        id: `block-${idx}-${Date.now()}`,
        categoryId: detail.categoryId,
        phone: detail.phone || "",
        about: detail.description || "",
      }));
    }
    return [];
  });

  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(
    new Set(step1Data?.lessonTypeIds || [])
  );

  const [errors, setErrors] = useState<{
    mainCategoryId?: string;
    name?: string;
    phone?: string;
    email?: string;
    subcategories?: Record<string, string>;
  }>({});

  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [openSubDropdownId, setOpenSubDropdownId] = useState<string | null>(null);

  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const subDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target as Node)) {
        setIsMainDropdownOpen(false);
      }
      if (openSubDropdownId) {
        const ref = subDropdownRefs.current[openSubDropdownId];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenSubDropdownId(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSubDropdownId]);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const validateStep1 = useValidateGymStep1();

  // Filter main categories so that if selected as subcategory, they are locked out
  const selectedSubIds = subCategoryBlocks
    .map((b) => b.categoryId)
    .filter((id): id is number => id !== null);

  const mainCategoryOptions =
    categoriesData?.items?.filter((c) => !selectedSubIds.includes(c.id)) || [];

  // Get available subcategories for a block
  const getSubcategoryOptions = (currentBlockId: string) => {
    const selectedOtherSubIds = subCategoryBlocks
      .filter((b) => b.id !== currentBlockId && b.categoryId !== null)
      .map((b) => b.categoryId as number);

    return (
      categoriesData?.items?.filter(
        (c) => c.id !== mainCategoryId && !selectedOtherSubIds.includes(c.id)
      ) || []
    );
  };

  // Sync selected lesson types when categories change
  useEffect(() => {
    if (!categoriesData?.items) return;
    const activeCategoryIds = [
      ...(mainCategoryId ? [mainCategoryId] : []),
      ...subCategoryBlocks.map((b) => b.categoryId).filter((id): id is number => id !== null),
    ];
    const activeCategories = categoriesData.items.filter((c) =>
      activeCategoryIds.includes(c.id)
    );
    const activeLessonTypeIds = new Set(
      activeCategories.flatMap((c) => c.lessonTypes || []).map((lt) => lt.id)
    );

    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of prev) {
        if (!activeLessonTypeIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      // auto-select new active lesson types if set was empty or to help user
      if (prev.size === 0 && activeLessonTypeIds.size > 0) {
        activeLessonTypeIds.forEach((id) => next.add(id));
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [mainCategoryId, subCategoryBlocks, categoriesData]);

  // Aggregate union of lesson types for display
  const selectedCategories =
    categoriesData?.items?.filter(
      (c) =>
        mainCategoryId === c.id || subCategoryBlocks.some((b) => b.categoryId === c.id)
    ) || [];

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

  const selectMainCategory = (id: number) => {
    setMainCategoryId(id);
    setIsMainDropdownOpen(false);
    if (errors.mainCategoryId) setErrors((p) => ({ ...p, mainCategoryId: undefined }));
  };

  const handleToggleSubcategories = (checked: boolean) => {
    setHasSubcategories(checked);
    if (checked) {
      if (subCategoryBlocks.length === 0) {
        setSubCategoryBlocks([
          { id: `block-${Date.now()}`, categoryId: null, phone: "", about: "" },
        ]);
      }
    } else {
      setSubCategoryBlocks([]);
    }
  };

  const addSubcategoryBlock = () => {
    setSubCategoryBlocks((prev) => [
      ...prev,
      { id: `block-${Date.now()}`, categoryId: null, phone: "", about: "" },
    ]);
  };

  const removeSubcategoryBlock = (id: string) => {
    setSubCategoryBlocks((prev) => prev.filter((b) => b.id !== id));
    // Clear subcategory specific error
    if (errors.subcategories) {
      const newSubs = { ...errors.subcategories };
      delete newSubs[id];
      delete newSubs[`${id}_phone`];
      setErrors((prev) => ({ ...prev, subcategories: newSubs }));
    }
  };

  const updateSubcategoryBlock = (id: string, fields: Partial<SubcategoryBlock>) => {
    setSubCategoryBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...fields } : b))
    );
    // Clear subcategory specific error on change
    if (errors.subcategories) {
      const newSubs = { ...errors.subcategories };
      if (fields.categoryId !== undefined) delete newSubs[id];
      if (fields.phone !== undefined) delete newSubs[`${id}_phone`];
      setErrors((prev) => ({ ...prev, subcategories: newSubs }));
    }
  };

  const toggleLessonType = (id: number) => {
    setSelectedLessonTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildPayload = (): GymStep1PayloadV2 => {
    const mainCategoryDetails: CategoryDetail[] = mainCategoryId
      ? [
          {
            categoryId: mainCategoryId,
            phone: normalizePhoneNumber(phone),
            description: about.trim(),
          },
        ]
      : [];

    const subCategoryDetails: CategoryDetail[] = subCategoryBlocks
      .filter((b) => b.categoryId !== null)
      .map((b) => ({
        categoryId: b.categoryId as number,
        phone: normalizePhoneNumber(b.phone),
        description: b.about.trim(),
      }));

    return {
      mainCategoryDetails,
      subCategoryDetails,
      hasSubcategories,
      name: name.trim(),
      description: about.trim(),
      phone: normalizePhoneNumber(phone),
      email: email.trim() === "" ? null : email.trim(),
      lessonTypeIds: Array.from(selectedLessonTypeIds),
    };
  };

  const validateLocal = () => {
    const newErrors: typeof errors = {};

    if (!mainCategoryId) {
      newErrors.mainCategoryId = "Kateqoriya seçilməlidir";
    }

    if (!name.trim()) {
      newErrors.name = "Zal adı daxil edilməlidir";
    } else if (name.trim().length < 2) {
      newErrors.name = "Zal adı ən azı 2 simvoldan ibarət olmalıdır";
    }

    if (!phone.trim()) {
      newErrors.phone = "Telefon nömrəsi daxil edilməlidir";
    } else {
      const cleaned = phone.replace(/[\s()\-]/g, "");
      if (!AZ_PHONE_REGEX.test(cleaned)) {
        newErrors.phone = "Yanlış mobil nömrə formatı (Məs: 0501234567)";
      }
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Yanlış e-poçt formatı";
      }
    }

    if (hasSubcategories) {
      const subcategoryErrors: Record<string, string> = {};
      let hasSubError = false;

      if (subCategoryBlocks.length === 0) {
        toast.error("Ən azı bir alt kateqoriya əlavə edilməlidir");
        hasSubError = true;
      } else {
        const selectedIds = new Set<number>();
        subCategoryBlocks.forEach((block) => {
          if (!block.categoryId) {
            subcategoryErrors[block.id] = "Alt kateqoriya seçilməlidir";
            hasSubError = true;
          } else if (selectedIds.has(block.categoryId)) {
            subcategoryErrors[block.id] = "Bu alt kateqoriya artıq seçilib";
            hasSubError = true;
          } else if (block.categoryId === mainCategoryId) {
            subcategoryErrors[block.id] = "Alt kateqoriya əsas kateqoriya ilə eyni ola bilməz";
            hasSubError = true;
          } else {
            selectedIds.add(block.categoryId);
          }

          if (block.phone.trim()) {
            const cleanedSubPhone = block.phone.replace(/[\s()\-]/g, "");
            if (!AZ_PHONE_REGEX.test(cleanedSubPhone)) {
              subcategoryErrors[`${block.id}_phone`] = "Yanlış mobil nömrə formatı";
              hasSubError = true;
            }
          }
        });
      }

      if (hasSubError) {
        newErrors.subcategories = subcategoryErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateLocal()) {
      toast.error("Zəhmət olmasa formdakı səhvləri düzəldin");
      return;
    }

    try {
      const payload = buildPayload();
      await validateStep1.mutateAsync(payload);
      setStep1Data(payload);
      onNext();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || "Məlumatlar yanlışdır";
      toast.error(errMsg);
    }
  };

  const isSaving = validateStep1.isPending;

  return (
    <div className="flex flex-col gap-8 font-sans text-black animate-in fade-in duration-500">
      {/* 1. Zal məlumatları Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-[#ececed] pb-3">
          <h2 className="text-[18px] font-semibold leading-[28px]">Zal məlumatları</h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* Gym Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">
              Zal adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Zal adı"
              className={cn(
                "h-[48px] w-full bg-[#fafafa] border rounded-xl px-4 text-[15px] outline-none placeholder:text-black/30 font-medium transition-all focus:border-[#00b4cc] focus:bg-white",
                errors.name ? "border-red-500 focus:border-red-500" : "border-[#ececed]"
              )}
            />
            {errors.name && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </span>
            )}
          </div>

          {/* Main Category Dropdown */}
          <div className="flex flex-col gap-2" ref={mainDropdownRef}>
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">
              Kateqoriya <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
                className={cn(
                  "h-[48px] w-full bg-[#fafafa] border rounded-xl px-4 text-[15px] font-medium transition-all flex items-center justify-between outline-none focus:border-[#00b4cc] focus:bg-white",
                  errors.mainCategoryId ? "border-red-500" : "border-[#ececed]"
                )}
              >
                {mainCategoryId ? (
                  <span className="text-black">
                    {categoriesData?.items?.find((c) => c.id === mainCategoryId)?.name || "Fitness"}
                  </span>
                ) : (
                  <span className="text-black/30">Kateqoriya seçin</span>
                )}
                <ChevronDown
                  size={18}
                  className={cn("text-black/40 transition-transform", isMainDropdownOpen && "rotate-180")}
                />
              </button>

              {isMainDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[240px] overflow-y-auto rounded-xl border border-[#ececed] bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center p-4 gap-2 text-sm text-black/50">
                      <Loader2 className="h-4 w-4 animate-spin text-[#00b4cc]" />
                      Yüklənir...
                    </div>
                  ) : mainCategoryOptions.length > 0 ? (
                    mainCategoryOptions.map((cat) => {
                      const isSelected = mainCategoryId === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => selectMainCategory(cat.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                            isSelected
                              ? "bg-[#00b4cc]/10 text-[#00b4cc]"
                              : "text-black hover:bg-slate-50"
                          )}
                        >
                          {cat.name}
                          {isSelected && <Check size={16} />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-black/40">Kateqoriya tapılmadı</div>
                  )}
                </div>
              )}
            </div>
            {errors.mainCategoryId && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.mainCategoryId}
              </span>
            )}
          </div>

          {/* About */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">Haqqında</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Haqqında"
              className="h-[100px] w-full bg-[#fafafa] border border-[#ececed] rounded-xl p-4 text-[15px] outline-none resize-none placeholder:text-black/30 font-medium transition-all focus:border-[#00b4cc] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Subcategories Switch & Dynamic Blocks */}
      <div className="flex flex-col gap-5">
        <div
          onClick={() => handleToggleSubcategories(!hasSubcategories)}
          className="flex items-center gap-3 cursor-pointer select-none py-1 group"
        >
          <div
            className={cn(
              "h-[28px] w-[28px] rounded-lg border-2 flex items-center justify-center transition-all duration-200",
              hasSubcategories
                ? "bg-[#00b4cc] border-[#00b4cc] text-white shadow-sm shadow-[#00b4cc]/20"
                : "border-[#ececed] bg-white group-hover:border-slate-400"
            )}
          >
            {hasSubcategories && (
              <svg className="h-[14px] w-[14px] stroke-white stroke-[3.5] fill-none" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="text-[15px] font-semibold text-[#333333] leading-6 select-none">
            Bu zalda alt kateqoriyalar mövcuddur.
          </div>
        </div>

        {hasSubcategories && (
          <div className="flex flex-col gap-5 rounded-xl border border-[#ececed] p-4 bg-[#fafafa]/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-[#ececed] pb-2">
              <span className="text-[16px] font-semibold text-black">Alt Kateqoriyalar</span>
            </div>

            <div className="flex flex-col gap-5">
              {subCategoryBlocks.map((block, idx) => {
                const availableOptions = getSubcategoryOptions(block.id);
                const blockError = errors.subcategories?.[block.id];
                const blockPhoneError = errors.subcategories?.[`${block.id}_phone`];

                return (
                  <div
                    key={block.id}
                    className="flex flex-col gap-4 rounded-xl border border-[#ececed] p-4 bg-white shadow-sm animate-in fade-in duration-200"
                  >
                    {/* Header with Subcategory label and custom clean delete button */}
                    <div className="flex items-center justify-between border-b border-[#ececed] pb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Alt Kateqoriya #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubcategoryBlock(block.id)}
                        className="flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title="Alt kateqoriyanı sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Form elements in block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Subcategory Select */}
                      <div
                        className="flex flex-col gap-2 relative"
                        ref={(el) => {
                          subDropdownRefs.current[block.id] = el;
                        }}
                      >
                        <label className="text-[13px] text-black/50 font-medium">Alt kateqoriya</label>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSubDropdownId(openSubDropdownId === block.id ? null : block.id)
                          }
                          className={cn(
                            "h-[44px] w-full bg-[#fafafa] border rounded-lg px-3 text-[14px] font-medium transition-all flex items-center justify-between outline-none focus:border-[#00b4cc] focus:bg-white",
                            blockError ? "border-red-500" : "border-[#ececed]"
                          )}
                        >
                          {block.categoryId ? (
                            <span className="text-black">
                              {categoriesData?.items?.find((c) => c.id === block.categoryId)?.name}
                            </span>
                          ) : (
                            <span className="text-black/30">Alt kateqoriya seçin</span>
                          )}
                          <ChevronDown size={16} className="text-black/40" />
                        </button>

                        {openSubDropdownId === block.id && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-[#ececed] bg-white p-1 shadow-lg animate-in fade-in duration-100">
                            {availableOptions.length > 0 ? (
                              availableOptions.map((cat) => (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => {
                                    updateSubcategoryBlock(block.id, { categoryId: cat.id });
                                    setOpenSubDropdownId(null);
                                  }}
                                  className="flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-sm font-medium text-black hover:bg-slate-50 transition-colors"
                                >
                                  {cat.name}
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-xs text-black/40">
                                Əlavə edilə bilən kateqoriya yoxdur
                              </div>
                            )}
                          </div>
                        )}
                        {blockError && (
                          <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} /> {blockError}
                          </span>
                        )}
                      </div>

                      {/* Phone number */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] text-black/50 font-medium">Telefon nömrəsi</label>
                        <input
                          type="tel"
                          value={block.phone}
                          onChange={(e) => updateSubcategoryBlock(block.id, { phone: e.target.value })}
                          placeholder="+994 00 000 00 00"
                          className={cn(
                            "h-[44px] w-full bg-[#fafafa] border rounded-lg px-3 text-[14px] outline-none placeholder:text-black/30 font-medium transition-all focus:border-[#00b4cc] focus:bg-white",
                            blockPhoneError ? "border-red-500 focus:border-red-500" : "border-[#ececed]"
                          )}
                        />
                        {blockPhoneError && (
                          <span className="text-red-500 text-xs font-medium flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} /> {blockPhoneError}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* About subcategory */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] text-black/50 font-medium">Haqqında</label>
                      <textarea
                        value={block.about}
                        onChange={(e) => updateSubcategoryBlock(block.id, { about: e.target.value })}
                        placeholder="Haqqında"
                        className="h-[60px] w-full bg-[#fafafa] border border-[#ececed] rounded-lg p-3 text-[14px] outline-none resize-none placeholder:text-black/30 font-medium transition-all focus:border-[#00b4cc] focus:bg-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add subcategory button styled exactly like design */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={addSubcategoryBlock}
                className="flex items-center justify-center gap-3 rounded-[12px] bg-[#00b4cc] text-white hover:opacity-90 w-[160px] h-[42px] text-sm font-semibold transition-all shadow-md shadow-[#00b4cc]/10"
              >
                <span>Əlavə et</span>
                <Image src="/vuesax/linear/add.png" width={18} height={18} alt="" className="shrink-0" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Əlaqə Section */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-[#ececed] pb-3">
          <h2 className="text-[18px] font-semibold leading-[28px]">Əlaqə</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">
              Telefon nömrəsi <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
              }}
              placeholder="+994 00 000 00 00"
              className={cn(
                "h-[48px] w-full bg-[#fafafa] border rounded-xl px-4 text-[15px] outline-none placeholder:text-black/30 font-semibold transition-all focus:border-[#00b4cc] focus:bg-white",
                errors.phone ? "border-red-500 focus:border-red-500" : "border-[#ececed]"
              )}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.phone}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[20px] text-black/60 font-medium">E-Poçt</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="asss@gmail.com"
              className={cn(
                "h-[48px] w-full bg-[#fafafa] border rounded-xl px-4 text-[15px] outline-none placeholder:text-black/30 font-semibold transition-all focus:border-[#00b4cc] focus:bg-white",
                errors.email ? "border-red-500 focus:border-red-500" : "border-[#ececed]"
              )}
            />
            {errors.email && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email}
              </span>
            )}
          </div>
        </div>
      </div>



      {/* 5. Footer Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-[#ececed] pt-5 mt-2">
        <button
          type="button"
          onClick={() => {
            const { resetStep1Data } = useGymStore.getState();
            resetStep1Data();
            setName("");
            setAbout("");
            setPhone("");
            setEmail("");
            setMainCategoryId(null);
            setHasSubcategories(false);
            setSubCategoryBlocks([]);
            setSelectedLessonTypeIds(new Set());
            setErrors({});
          }}
          className="h-[44px] px-8 rounded-xl border border-[#ececed] text-black text-[14px] font-semibold hover:bg-slate-50 transition-colors"
        >
          Sıfırla
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSaving}
          className="h-[44px] w-[240px] rounded-xl bg-[#00b4cc] text-white text-[14px] font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>
    </div>
  );
}
