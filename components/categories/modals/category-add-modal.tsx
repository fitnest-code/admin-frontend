"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Loader2, Pencil, Check } from "lucide-react";
import { useLessonTypes } from "@/lib/query/use-lesson-types";
import { apiGet, apiPost, apiRequest } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/lib/i18n";

export interface CategoryFormData {
  name: string;
  photo: File | null;
  icon: File | null;
  lessonTypeIds?: number[];
  translations?: { languageCode: string; fieldValue: string }[];
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: { id?: number; name: string; image: string; iconUrl?: string; lessonTypes?: { id: number; name: string }[] };
  mode?: "create" | "edit";
}

export default function CategoryModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode = "create",
}: CategoryModalProps) {
  const t = useT();
  const [languages, setLanguages] = useState<string[]>(["AZ", "RU", "EN"]);
  const [activeTab, setActiveTab] = useState<string>("AZ");
  const [names, setNames] = useState<Record<string, string>>({ AZ: "", EN: "", RU: "" });

  const queryClient = useQueryClient();
  const [editingLtId, setEditingLtId] = useState<number | null>(null);
  const [editingLtValue, setEditingLtValue] = useState<string>("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [selectedLessonTypeIds, setSelectedLessonTypeIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const { lessonTypes, createLessonType, deleteLessonType } = useLessonTypes(activeTab);

  // Fetch languages
  useEffect(() => {
    apiGet<any>('/me/languages')
      .then(res => {
        const list = res?.data || res;
        if (Array.isArray(list)) {
          setLanguages(list.map((l: any) => {
            const val = typeof l === 'object' && l !== null ? (l.code || '') : l;
            return String(val).toUpperCase();
          }).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
  }, [activeTab, queryClient]);

  useEffect(() => {
    if (open) {
      const azName = initialData?.name ?? "";
      setNames({
        AZ: azName,
        EN: "",
        RU: "",
      });
      setActiveTab("AZ");
      setImagePreview(initialData?.image ?? null);
      setIconPreview(initialData?.iconUrl ?? null);
      setSelectedFile(null);
      setSelectedIconFile(null);
      if (initialData?.lessonTypes) {
        setSelectedLessonTypeIds(new Set(initialData.lessonTypes.map((lt) => lt.id)));
      } else {
        setSelectedLessonTypeIds(new Set());
      }

      if (mode === "edit" && initialData?.id) {
        apiGet<any>('/categories', {
          headers: { "Accept-Language": "AZ" }
        }).then((res) => {
          const items = Array.isArray(res) 
            ? res 
            : (res?.content || res?.data || res?.items || []);
          const match = items.find((c: any) => c.id === initialData.id);
          if (match?.name) {
            setNames((prev) => ({ ...prev, AZ: match.name }));
          }
        }).catch((err) => console.error("Error fetching categories in AZ:", err));

        apiGet<any[]>(`/admin/translations`, {
          params: {
            entityType: "CATEGORY",
            entityId: String(initialData.id),
            fieldName: "name"
          }
        })
        .then(res => {
          const list = (res as any)?.data || res;
          if (Array.isArray(list)) {
            const newNames: Record<string, string> = {
              AZ: azName,
              EN: "",
              RU: ""
            };
            list.forEach(item => {
              if (item.languageCode && item.fieldName === "name") {
                newNames[item.languageCode.toUpperCase()] = item.fieldValue || "";
              }
            });
            setNames(prev => ({ 
              ...prev, 
              ...newNames,
              AZ: prev.AZ !== azName ? prev.AZ : newNames.AZ 
            }));
          }
        })
        .catch(err => console.error("Error fetching translations:", err));
      }
    }
  }, [open, initialData, mode]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleIconFile = useCallback((file: File) => {
    // Validating for SVG or images
    if (!file.type.startsWith("image/") && file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) return;
    setSelectedIconFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIconPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const [newLessonTypeName, setNewLessonTypeName] = useState("");
  const [isAddingLessonType, setIsAddingLessonType] = useState(false);
  const [isSubmittingLessonType, setIsSubmittingLessonType] = useState(false);

  const handleSave = () => {
    if (!names.AZ.trim()) return;
    onSave({ 
      name: names.AZ.trim(), 
      photo: selectedFile,
      icon: selectedIconFile,
      lessonTypeIds: Array.from(selectedLessonTypeIds),
      translations: Object.entries(names)
        .filter(([lang, val]) => lang !== "AZ" && val.trim() !== "")
        .map(([lang, val]) => ({
          languageCode: lang,
          fieldValue: val.trim()
        }))
    });
  };

  const handleAddLessonTypeSubmit = async () => {
    const trimmed = newLessonTypeName.trim();
    if (!trimmed || isSubmittingLessonType) return;

    setIsSubmittingLessonType(true);
    try {
      const result = await createLessonType(trimmed);
      setSelectedLessonTypeIds((prev) => new Set(prev).add(result.id));
      setNewLessonTypeName("");
      setIsAddingLessonType(false); // Hide the box on success
    } catch (err) {
      console.error("Error creating lesson type", err);
    } finally {
      setIsSubmittingLessonType(false);
    }
  };

  const toggleLessonType = (id: number) => {
    setSelectedLessonTypeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleDeleteLessonType = async (id: number) => {
    try {
      await deleteLessonType(id);
      setSelectedLessonTypeIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error("Error deleting lesson type", err);
    }
  };

  const handleStartEditLessonType = async (lt: any) => {
    setEditingLtId(lt.id);
    setEditingLtValue(lt.name || "");
    setIsSubmittingLessonType(true);

    try {
      if (activeTab === "AZ") {
        try {
          const ltDetails = await apiGet<any>(`/admin/lesson-types/${lt.id}`);
          if (ltDetails?.name) {
            setEditingLtValue(ltDetails.name);
          }
        } catch (e) {
          console.warn("Failed to fetch lesson type details:", e);
        }
      } else {
        try {
          const list = await apiGet<any[]>(`/admin/translations`, {
            params: {
              entityType: "LessonType",
              entityId: String(lt.id),
              fieldName: "name",
              languageCode: activeTab
            }
          });
          const transList = Array.isArray(list) ? list : (list as any)?.data || [];
          const item = transList.find((t: any) => t.languageCode?.toUpperCase() === activeTab && t.fieldName === "name");
          if (item?.fieldValue) {
            setEditingLtValue(item.fieldValue);
          }
        } catch (e) {
          console.warn("Failed to fetch translations:", e);
        }
      }
    } catch (err) {
      console.error("Failed to load lesson type for editing:", err);
    } finally {
      setIsSubmittingLessonType(false);
    }
  };

  const handleConfirmEditLessonType = async (lt: any) => {
    const trimmed = editingLtValue.trim();
    if (!trimmed || isSubmittingLessonType) return;
    setIsSubmittingLessonType(true);

    try {
      if (activeTab === "AZ") {
        await apiRequest(`/admin/lesson-types/${lt.id}`, {
          method: "PUT",
          body: { name: trimmed }
        });
      } else {
        await apiRequest(`/admin/translations`, {
          method: "PUT",
          body: {
            entityType: "LessonType",
            entityId: String(lt.id),
            fieldName: "name",
            languageCode: activeTab,
            fieldValue: trimmed
          }
        });
      }
      setEditingLtId(null);
      setEditingLtValue("");
      queryClient.invalidateQueries({ queryKey: ["lesson-types"] });
    } catch (err) {
      console.error("Failed to update lesson type name/translation:", err);
    } finally {
      setIsSubmittingLessonType(false);
    }
  };

  const handleCancelEditLessonType = () => {
    setEditingLtId(null);
    setEditingLtValue("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4 sm:py-10">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      
      <div className="relative z-10 w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center justify-center p-4 sm:p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-2.5">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {mode === "create" ? t.categories.createHeader : t.categories.editHeader}
          </h2>
          <button onClick={() => onOpenChange(false)} className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col items-start gap-4 sm:gap-5 text-[#000]">
          
          {/* Kateqoriya şəkli */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">{t.categories.photoLabel}</label>
            <div className="w-full flex flex-col items-start gap-2 text-center text-[13px] text-[#4a5565] font-inter">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[120px] relative rounded-2xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image src="/upload.svg" width={32} height={32} alt="upload" className="w-8 h-8 opacity-70" />
                    <span className="text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[-0.15px] text-[#101828]">Upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-full text-left text-[11px] sm:text-[12px] leading-[18px] tracking-[-0.15px] text-[#6a7282]">
                JPG or PNG • Max size 2MB
              </div>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="w-full flex items-center border-b border-[#ececed] gap-1">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-2 text-[13px] font-semibold transition-all border-b-2 ${
                  activeTab === lang
                    ? "border-[#00b4cc] text-[#00b4cc]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Kateqoriya adı */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">
              {t.categories.nameLabel} ({activeTab})
            </label>
            <input
              type="text"
              value={names[activeTab] || ""}
              onChange={(e) => setNames((prev) => ({ ...prev, [activeTab]: e.target.value }))}
              placeholder={activeTab === "AZ" ? "Məs: Fitness" : activeTab === "EN" ? "E.g., Fitness" : "Например: Фитнес"}
              className="w-full h-[40px] rounded-lg bg-[#fafafa] border border-[#ececed] px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors"
            />
          </div>



          {/* Kateqoriya Icon */}
          <div className="w-full flex flex-col items-start gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">{t.categories.iconLabel}</label>
            <div className="w-full flex flex-col items-start gap-2 text-center text-[13px] text-[#4a5565] font-inter">
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="w-full h-[60px] relative rounded-2xl border border-dashed border-[#99a1af] bg-[#fafafa] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-gray-50"
              >
                {iconPreview ? (
                  <div className="w-full h-full flex items-center justify-center p-2 bg-[#ececed]/10">
                    <img src={iconPreview} alt="icon preview" className="h-8 w-8 object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Image src="/upload.svg" width={20} height={20} alt="upload" className="w-5 h-5 opacity-70" />
                    <span className="text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[-0.15px] text-[#101828]">Upload</span>
                  </div>
                )}
              </div>
              <input ref={iconInputRef} type="file" className="hidden" accept="image/*,image/svg+xml,.svg" onChange={(e) => e.target.files?.[0] && handleIconFile(e.target.files[0])} />
              <div className="w-full text-left text-[11px] sm:text-[12px] leading-[18px] tracking-[-0.15px] text-[#6a7282]">
                JPG, PNG or SVG • Max size 2MB
              </div>
            </div>
          </div>

          {/* Unified Növ Section */}
          <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-start p-3 sm:p-5 gap-4 text-[13px]">
            {/* Header */}
            <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[14px] sm:text-[16px] font-semibold text-[#000] gap-2">
              <span className="leading-tight">{t.categories.lessonTypesLabel} ({selectedLessonTypeIds.size}/{lessonTypes?.length || 0})</span>
              {!isAddingLessonType && (
                <button
                  type="button"
                  onClick={() => setIsAddingLessonType(true)}
                  className="h-[32px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-3 gap-1.5 text-[12px] sm:text-[13px] text-[#fafafa] font-medium hover:bg-[#00a4bd] transition-colors shrink-0"
                >
                  <span className="leading-none">{t.categories.addLessonTypeBtn}</span>
                  <Plus size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Addition Form Box */}
            {isAddingLessonType && (
              <div className="w-full rounded-xl bg-white border border-[#ececed] flex flex-col items-end p-3 sm:p-5 gap-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-full border-b border-[#ececed] pb-2 flex items-center justify-between text-[14px] sm:text-[16px] font-semibold text-[#000]">
                  <span className="leading-tight">{t.categories.addLessonTypeBtn}</span>
                  <button
                    type="button"
                    onClick={() => { setIsAddingLessonType(false); setNewLessonTypeName(""); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X size={16} className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full flex flex-col items-start gap-2">
                  <label className="text-[12px] sm:text-[13px] text-[#000] leading-tight font-medium">{t.categories.lessonTypesLabel} {t.common.name.toLowerCase()}</label>
                  <div className="w-full h-[40px] rounded-lg bg-[#fafafa] border border-[#ececed] flex items-center justify-between px-3 gap-3 text-[13px] sm:text-[14px] focus-within:border-[#00b4cc] transition-colors">
                    <input
                      type="text"
                      value={newLessonTypeName}
                      onChange={(e) => setNewLessonTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLessonTypeSubmit()}
                      placeholder="Məs: Pilates"
                      autoFocus
                      className="w-full h-full bg-transparent outline-none text-[#000] text-[13px] sm:text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setNewLessonTypeName("")}
                      className="w-5 h-5 rounded-[4px] bg-[#ececed] flex items-center justify-center text-[#000] hover:bg-gray-200 transition-colors shrink-0"
                    >
                      <X size={10} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddLessonTypeSubmit}
                  disabled={!newLessonTypeName.trim() || isSubmittingLessonType}
                  className="w-full sm:w-[120px] h-[36px] rounded-lg bg-[#00b4cc] flex items-center justify-center text-[#fafafa] font-medium text-[13px] hover:bg-[#00a4bd] disabled:opacity-50 transition-colors gap-2"
                >
                  {isSubmittingLessonType ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <span className="leading-none">{t.common.add}</span>
                  )}
                </button>
              </div>
            )}

            {/* List of Items Grid */}
            <div className="w-full flex flex-wrap items-center gap-2 pt-1 max-h-[160px] overflow-y-auto pr-1">
              {lessonTypes?.map((lt) => {
                const isSelected = selectedLessonTypeIds.has(lt.id);
                const isEditing = editingLtId === lt.id;

                if (isEditing) {
                  return (
                    <div
                      key={lt.id}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-none h-[36px] rounded-lg flex items-center justify-between px-2 gap-1.5 bg-[#fafafa] border border-[#00b4cc]"
                    >
                      <input
                        type="text"
                        value={editingLtValue}
                        onChange={(e) => setEditingLtValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handleConfirmEditLessonType(lt);
                          } else if (e.key === "Escape") {
                            e.stopPropagation();
                            handleCancelEditLessonType();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        style={{ width: `${Math.max(editingLtValue.length || 6, 6) + 2}ch` }}
                        className="bg-transparent outline-none text-[#101828] text-[12px] sm:text-[13px] font-medium min-w-[60px] max-w-[180px]"
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmEditLessonType(lt);
                          }}
                          disabled={!editingLtValue.trim() || isSubmittingLessonType}
                          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEditLessonType();
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={lt.id}
                    onClick={() => toggleLessonType(lt.id)}
                    className={`flex-[1_1_calc(50%-4px)] sm:flex-none min-w-[100px] sm:min-w-[120px] h-[36px] rounded-lg flex items-center justify-between px-2 sm:px-2.5 gap-2 cursor-pointer select-none transition-colors ${
                      isSelected 
                        ? "bg-[#00b4cc]/[0.04] border border-[#00b4cc]" 
                        : "bg-[#fafafa] border border-[#ececed]"
                    }`}
                  >
                    <span className="text-[#101828] text-[12px] sm:text-[13px] font-medium truncate">{lt.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditLessonType(lt);
                        }}
                        className="p-1 hover:opacity-75 transition-opacity flex items-center justify-center"
                      >
                        <Pencil size={13} className="text-gray-500 hover:text-[#00b4cc]" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLessonType(lt.id);
                        }}
                        className="p-1 hover:opacity-70 transition-opacity flex items-center justify-center"
                      >
                        <Image src="/trash.png" width={16} height={16} alt="delete" className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <button
          onClick={handleSave}
          disabled={!names.AZ.trim()}
          className="w-full max-w-[280px] h-[48px] rounded-xl bg-[#00b4cc] text-white flex items-center justify-center px-4 py-2 font-medium text-[14px] disabled:opacity-50 hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50"
        >
          {t.common.save}
        </button>

      </div>
    </div>
  );
}