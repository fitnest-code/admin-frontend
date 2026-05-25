"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18nStore } from "@/lib/i18n";
import {
  useCreateLegalDocument,
  useUpdateLegalDocument,
  useActivateLegalDocument,
  useDeactivateLegalDocument,
  type LegalDocument,
} from "@/lib/query/legal-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LegalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  onSuccess: () => void;
}

export function LegalDocumentModal({
  isOpen,
  onClose,
  document,
  onSuccess,
}: LegalDocumentModalProps) {
  const selectedLang = useI18nStore((s) => s.locale);
  const { mutate: createDoc, isPending: isCreating } = useCreateLegalDocument();
  const { mutate: updateDoc, isPending: isUpdating } = useUpdateLegalDocument();
  const { mutate: activateDoc, isPending: isActivating } = useActivateLegalDocument();
  const { mutate: deactivateDoc, isPending: isDeactivating } = useDeactivateLegalDocument();

  const isPending = isCreating || isUpdating || isActivating || isDeactivating;

  const [formData, setFormData] = useState({
    type: "",
    content: "",
    version: "1.0",
    isActive: false,
  });

  // Reset or populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (document) {
        setFormData({
          type: document.type,
          content: document.content,
          version: document.version,
          isActive: document.isActive,
        });
      } else {
        setFormData({
          type: "TERMS_OF_USE",
          content: "",
          version: "1.0",
          isActive: false,
        });
      }
    }
  }, [isOpen, document]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.content.trim() || !formData.type.trim()) {
      toast.error("Bütün vacib xanaları doldurun");
      return;
    }

    if (document) {
      updateDoc(
        {
          id: document.id,
          payload: { content: formData.content, version: formData.version },
        },
        {
          onSuccess: () => {
            if (formData.isActive !== document.isActive) {
              const action = formData.isActive ? activateDoc : deactivateDoc;
              action(document.id, {
                onSuccess,
                onError: (err: any) =>
                  toast.error(err.message || "Status yenilənərkən xəta baş verdi"),
              });
            } else {
              onSuccess();
            }
          },
          onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
        }
      );
    } else {
      createDoc(
        {
          type: formData.type,
          content: formData.content,
          version: formData.version,
          is_active: formData.isActive,
          language: selectedLang,
        },
        {
          onSuccess,
          onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
        }
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        style={{ maxWidth: "1088px" }}
        className="w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] sm:max-w-[1088px] max-w-[1088px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[24px] p-6 bg-white border border-[#ECECED] text-[#101828] font-sans"
      >
        <DialogHeader className="pb-4 border-b border-[#ECECED]">
          <DialogTitle className="text-2xl font-semibold leading-[28px] text-[#101828]">
            {document ? "Sənədi yenilə" : "Yeni sənəd"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-[28px] py-2">
          {/* Status Switch (aligned to right) */}
          <div className="flex items-center justify-end gap-3 self-stretch">
            <span className="text-base font-normal leading-6 text-[#101828]">Status</span>
            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className={cn(
                "relative inline-flex h-[31px] w-[51px] shrink-0 items-center cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                formData.isActive ? "bg-[#00B4CC]" : "bg-[#E9E9EA]"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-md transition duration-200 ease-in-out",
                  formData.isActive ? "translate-x-[20px]" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Tip and Versiya fields side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {/* Tip (Dropdown) */}
            <div className="flex flex-col gap-3 w-full text-left">
              <label className="text-base font-normal leading-6 text-black">Tip</label>
              {document ? (
                <div className="h-[60px] w-full rounded-xl bg-[#FAFAFA] border border-[#ECECED] px-3 flex items-center justify-start text-lg font-normal text-[#101828]">
                  {formData.type === "TERMS_OF_USE"
                    ? "İstifadə Şərtləri"
                    : "Məxfilik Siyasəti"}
                </div>
              ) : (
                <div className="relative w-full">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-[60px] bg-[#FAFAFA] border border-[#ECECED] rounded-xl px-3 text-lg font-normal text-[#101828] outline-none focus:border-[#00B4CC] focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="TERMS_OF_USE">İstifadə Şərtləri</option>
                    <option value="PRIVACY_POLICY">Məxfilik Siyasəti</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#101828]">
                    <svg
                      className="fill-current h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Versiya */}
            <div className="flex flex-col gap-3 w-full text-left">
              <label className="text-base font-normal leading-6 text-black">Versiya</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="Məs: 1.0"
                className="w-full h-[60px] bg-[#FAFAFA] border border-[#ECECED] rounded-xl px-3 text-lg font-medium text-[#101828] outline-none focus:border-[#00B4CC] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Məzmun */}
          <div className="flex flex-col gap-3 w-full text-left">
            <label className="text-base font-normal leading-6 text-[#030305]">
              Məzmun
            </label>
            <div className="h-[400px] rounded-xl bg-[#FAFAFA] border border-[#ECECED] flex flex-col p-3">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Sənədin məzmununu bura daxil edin..."
                className="w-full h-full bg-transparent outline-none resize-none text-base leading-6 text-[#101828] font-normal"
              />
            </div>
          </div>

          {/* Save Button (aligned to right) */}
          <div className="flex items-center justify-end w-full mt-4">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-[280px] h-[48px] rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-white font-medium text-base transition-all flex items-center justify-center cursor-pointer disabled:bg-[#C1C1CC] disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 size={18} className="animate-spin mr-2" />}
              Yadda saxla
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
