"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface TranslationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    entityType: string;
    entityId: string;
    languageCode: string;
    fieldName: string;
    fieldValue: string;
  }) => Promise<void>;
  initialData?: {
    id?: number;
    entityType: string;
    entityId: string;
    languageCode: string;
    fieldName: string;
    fieldValue: string;
  };
  mode?: "create" | "edit";
}

const ENTITY_TYPES = [
  "GYM",
  "CATEGORY",
  "STORE",
  "TRAINER",
  "PROFESSION",
  "ROOM",
  "SUPPORTEDSERVICE",
  "GymAdmin",
  "GymLessonType",
  "GymSubscription"
];

const FIELD_NAMES = [
  "name",
  "description",
  "addressText",
  "city",
  "surname",
  "title",
  "subtitle"
];

const LANGUAGES = [
  { code: "AZ", label: "Azerbaijani", flag: "🇦🇿" },
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "RU", label: "Russian", flag: "🇷🇺" }
];

export function getFlagEmoji(lang: string) {
  const code = lang.toUpperCase().trim();
  if (code === "AZ") return "🇦🇿";
  if (code === "EN" || code === "GB") return "🇬🇧";
  if (code === "RU") return "🇷🇺";
  if (code === "TR") return "🇹🇷";
  if (code === "DE") return "🇩🇪";
  if (code === "FR") return "🇫🇷";
  if (code === "ES") return "🇪🇸";
  if (code === "IT") return "🇮🇹";
  return "🏳️";
}

export default function TranslationModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode = "create",
}: TranslationModalProps) {
  const t = useT();
  const [entityType, setEntityType] = useState("");
  const [customEntityType, setCustomEntityType] = useState("");
  const [isCustomEntity, setIsCustomEntity] = useState(false);

  const [entityId, setEntityId] = useState("");

  const [fieldName, setFieldName] = useState("");
  const [customFieldName, setCustomFieldName] = useState("");
  const [isCustomField, setIsCustomField] = useState(false);

  const [languageCode, setLanguageCode] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [isCustomLang, setIsCustomLang] = useState(false);

  const [fieldValue, setFieldValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        if (ENTITY_TYPES.includes(initialData.entityType)) {
          setEntityType(initialData.entityType);
          setIsCustomEntity(false);
        } else {
          setEntityType("custom");
          setCustomEntityType(initialData.entityType);
          setIsCustomEntity(true);
        }

        setEntityId(initialData.entityId);

        if (FIELD_NAMES.includes(initialData.fieldName)) {
          setFieldName(initialData.fieldName);
          setIsCustomField(false);
        } else {
          setFieldName("custom");
          setCustomFieldName(initialData.fieldName);
          setIsCustomField(true);
        }

        const isStandardLang = LANGUAGES.some(l => l.code === initialData.languageCode.toUpperCase());
        if (isStandardLang) {
          setLanguageCode(initialData.languageCode.toUpperCase());
          setIsCustomLang(false);
        } else {
          setLanguageCode("custom");
          setCustomLanguage(initialData.languageCode.toUpperCase());
          setIsCustomLang(true);
        }

        setFieldValue(initialData.fieldValue);
      } else {
        setEntityType(ENTITY_TYPES[0]);
        setCustomEntityType("");
        setIsCustomEntity(false);
        setEntityId("");
        setFieldName(FIELD_NAMES[0]);
        setCustomFieldName("");
        setIsCustomField(false);
        setLanguageCode(LANGUAGES[0].code);
        setCustomLanguage("");
        setIsCustomLang(false);
        setFieldValue("");
      }
      setError(null);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = async () => {
    const finalEntityType = isCustomEntity ? customEntityType.trim() : entityType;
    const finalFieldName = isCustomField ? customFieldName.trim() : fieldName;
    const finalLanguageCode = isCustomLang ? customLanguage.trim().toUpperCase() : languageCode;

    if (!finalEntityType || !entityId.trim() || !finalFieldName || !finalLanguageCode || !fieldValue.trim()) {
      setError(t.validation.fillRequired);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        entityType: finalEntityType,
        entityId: entityId.trim(),
        languageCode: finalLanguageCode,
        fieldName: finalFieldName,
        fieldValue: fieldValue.trim()
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t.error.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFlag = isCustomLang ? getFlagEmoji(customLanguage) : getFlagEmoji(languageCode);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && onOpenChange(false)} />
      
      <div className="relative z-10 w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#ececed] flex flex-col items-center p-6 gap-5 shadow-2xl">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-3">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight text-black">
            {mode === "create" ? t.translations.add : t.translations.edit}
          </h2>
          <button 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
            className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Content */}
        <div className="w-full flex flex-col gap-4 text-black">
          {error && (
            <div className="p-3 text-[13px] font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Entity Type */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.translations.entityType}</label>
            <select
              value={entityType}
              onChange={(e) => {
                const val = e.target.value;
                setEntityType(val);
                setIsCustomEntity(val === "custom");
              }}
              disabled={isSubmitting || mode === "edit"}
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 text-black"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">Other (Custom Type)...</option>
            </select>

            {isCustomEntity && (
              <input
                type="text"
                value={customEntityType}
                onChange={(e) => setCustomEntityType(e.target.value)}
                disabled={isSubmitting || mode === "edit"}
                placeholder={t.translations.placeholderEntityType}
                className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 mt-1.5 text-black"
              />
            )}
          </div>

          {/* Entity ID */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.translations.entityId}</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              disabled={isSubmitting || mode === "edit"}
              placeholder="E.g. 15"
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 text-black"
            />
          </div>

          {/* Field Name */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.translations.fieldName}</label>
            <select
              value={fieldName}
              onChange={(e) => {
                const val = e.target.value;
                setFieldName(val);
                setIsCustomField(val === "custom");
              }}
              disabled={isSubmitting || mode === "edit"}
              className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 text-black"
            >
              {FIELD_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
              <option value="custom">Other (Custom Field)...</option>
            </select>

            {isCustomField && (
              <input
                type="text"
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
                disabled={isSubmitting || mode === "edit"}
                placeholder={t.translations.placeholderFieldName}
                className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 mt-1.5 text-black"
              />
            )}
          </div>

          {/* Language Code & flag detection */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60 flex items-center justify-between">
              <span>{t.translations.languageCode}</span>
              <span className="text-[16px]" title="Auto-detected Flag">{currentFlag}</span>
            </label>
            <div className="relative flex items-center">
              <select
                value={languageCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setLanguageCode(val);
                  setIsCustomLang(val === "custom");
                }}
                disabled={isSubmitting || mode === "edit"}
                className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] px-3 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 text-black"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.code} ({l.label})</option>
                ))}
                <option value="custom">Other (Custom Code)...</option>
              </select>
            </div>

            {isCustomLang && (
              <div className="relative flex items-center mt-1.5">
                <input
                  type="text"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  disabled={isSubmitting || mode === "edit"}
                  placeholder="E.g. TR, FR, DE"
                  className="w-full h-[42px] rounded-xl bg-[#fafafa] border border-[#ececed] pl-4 pr-10 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors disabled:opacity-60 uppercase text-black"
                />
                <span className="absolute right-3 text-[16px] pointer-events-none">{currentFlag}</span>
              </div>
            )}
          </div>

          {/* Translation Value */}
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-black/60">{t.translations.fieldValue}</label>
            <textarea
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder={t.translations.placeholderValue}
              className="w-full rounded-xl bg-[#fafafa] border border-[#ececed] p-4 text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors resize-y min-h-[100px] disabled:opacity-60 text-black"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full flex items-center justify-end gap-3 border-t border-[#ececed] pt-4 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-[42px] px-5 rounded-xl border border-[#dddcdc] text-black font-medium text-[14px] hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !fieldValue.trim()}
            className="h-[42px] px-6 rounded-xl bg-[#00b4cc] text-white flex items-center justify-center font-medium text-[14px] disabled:opacity-50 hover:bg-[#00a4bd] transition-all shadow-md shadow-cyan-50 gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              t.common.save
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
