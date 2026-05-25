"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (code: string) => void;
  isLoading?: boolean;
}

export function getLanguageFlag(langCode: string): string {
  const code = langCode.toUpperCase().trim();
  const mapping: Record<string, string> = {
    EN: "GB",
    ZH: "CN",
    JA: "JP",
    KO: "KR",
    HY: "AM",
    KA: "GE",
    EL: "GR",
    DA: "DK",
    SV: "SE",
    UK: "UA",
    CS: "CZ",
    FA: "IR",
    HE: "IL",
    HI: "IN",
    VI: "VN",
    AR: "SA",
  };
  const countryCode = mapping[code] || code;
  if (countryCode.length !== 2) {
    return "🌐";
  }
  const codePoints = countryCode
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

export default function LanguageModal({
  open,
  onOpenChange,
  onSave,
  isLoading = false,
}: LanguageModalProps) {
  const t = useT();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError(t.languages.errorSelect);
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 10) {
      setError(t.languages.codeLengthError);
      return;
    }
    onSave(trimmed);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans p-4 sm:py-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white border border-[#ececed] flex flex-col p-5 sm:p-6 gap-5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-5 text-[#101828] border-b border-[#ececed] pb-3">
          <h2 className="text-[16px] sm:text-[18px] font-semibold leading-tight">
            {t.languages.add}
          </h2>
          <button
            onClick={() => !isLoading && onOpenChange(false)}
            className="w-6 h-6 text-[#101828] hover:text-gray-600 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="w-full flex flex-col gap-4 text-black">
          <div className="w-full flex flex-col gap-2">
            <label className="text-[12px] sm:text-[13px] leading-[20px] font-medium text-black/60">
              {t.languages.code}
            </label>
            <div className="flex items-center gap-3 w-full">
              <input
                type="text"
                value={code}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, ""); // restrict to alphabetical language codes
                  setCode(val);
                  setError("");
                }}
                placeholder={t.languages.codePlaceholder}
                disabled={isLoading}
                className={`flex-1 h-[40px] rounded-lg bg-[#fafafa] border px-3 text-[13px] sm:text-[14px] font-medium outline-none focus:border-[#00b4cc] transition-colors ${
                  error ? "border-red-500" : "border-[#ececed]"
                }`}
              />
              <div
                className="w-10 h-10 shrink-0 flex items-center justify-center bg-gray-50 border border-[#ececed] rounded-lg text-2xl shadow-sm transition-all"
                title={t.languages.flag}
              >
                {getLanguageFlag(code)}
              </div>
            </div>
            {error && (
              <p className="text-[11px] text-red-500 mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex items-center justify-end gap-3 border-t border-[#ececed] pt-4 mt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-[40px] px-4 rounded-lg border border-[#ececed] bg-white text-[13px] sm:text-[14px] font-medium text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="h-[40px] px-5 rounded-lg bg-[#00b4cc] flex items-center justify-center gap-2 text-[13px] sm:text-[14px] font-medium text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {t.common.save}
          </button>
        </div>

      </div>
    </div>
  );
}
