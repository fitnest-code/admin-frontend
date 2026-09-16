"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguages } from "@/lib/query/use-languages";
import { ConfirmDeleteModal } from "../gyms/modals/confirm-delete-modal";
import { SuccessAnimationModal } from "../ui/success-animation-modal";

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#ececed] bg-white p-6 flex flex-col gap-5 w-full">
      {title && <h2 className="text-sm font-semibold text-black">{title}</h2>}
      {children}
    </div>
  );
}

export default function LanguagesMain({ isTab = false }: { isTab?: boolean }) {
  const { languages, isLoading, createLanguage, updateLanguage, deleteLanguage } = useLanguages();

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editCode, setEditCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [deleteTargetCode, setDeleteTargetCode] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditCode(null);
    setCode("");
    setShowFormModal(true);
  };

  const handleOpenEdit = (langCode: string) => {
    setFormMode("edit");
    setEditCode(langCode);
    setCode(langCode);
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    if (!/^[A-Z]{2,10}$/.test(normalized)) {
      setModalConfig({
        isOpen: true,
        message: "Dil kodu 2–10 hərf olmalıdır (məs: AZ, EN, TR).",
        type: "error",
      });
      return;
    }

    try {
      setIsActionLoading(true);
      if (formMode === "edit" && editCode) {
        await updateLanguage.mutateAsync({ code: editCode, newCode: normalized });
        setModalConfig({ isOpen: true, message: "Dil uğurla yeniləndi!", type: "success" });
      } else {
        await createLanguage.mutateAsync(normalized);
        setModalConfig({ isOpen: true, message: "Dil uğurla əlavə olundu!", type: "success" });
      }
      setShowFormModal(false);
    } catch (err: any) {
      const msg =
        err?.payload?.error?.message ||
        err?.message ||
        "Əməliyyat zamanı xəta baş verdi";
      setModalConfig({ isOpen: true, message: msg, type: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetCode) return;
    try {
      setIsActionLoading(true);
      await deleteLanguage.mutateAsync(deleteTargetCode);
      setDeleteTargetCode(null);
      setModalConfig({ isOpen: true, message: "Dil uğurla silindi!", type: "success" });
    } catch (err: any) {
      const msg =
        err?.payload?.error?.message ||
        err?.message ||
        "Dili silmək mümkün olmadı";
      setModalConfig({ isOpen: true, message: msg, type: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const content = (
    <>
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-3 gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-semibold leading-[24px] text-black">Dillər</h2>
            <p className="text-[12px] text-gray-500 leading-normal font-normal">
              Sistemdə dəstəklənən dilləri əlavə edin və ya silin. Yeni dillər məqsəd, kateqoriya və digər tərcümə formalarda görünəcək.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="h-[40px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-4 py-2 gap-2 text-[13px] font-medium text-white hover:opacity-90 transition-all shadow-md shadow-cyan-50 shrink-0"
          >
            <Plus size={16} /> Yeni dil
          </button>
        </div>

        <div className="w-full flex flex-col items-start gap-6 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 w-full">
              <Loader2 className="animate-spin text-[#00B4CC]" size={32} />
            </div>
          ) : languages.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 italic border border-dashed border-[#ececed] rounded-[12px] w-full">
              Hələ dil əlavə edilməyib
            </div>
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-[#ececed] w-full">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[#ececed] bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black tracking-wider">
                      Dil kodu
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-black tracking-wider w-28">
                      Əməliyyat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ececed]">
                  {languages.map((lang) => (
                    <tr key={lang} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-black font-semibold font-sans">
                        {lang}
                      </td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(lang)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#00B4CC] hover:bg-cyan-50 transition-colors"
                          title="Redaktə et"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetCode(lang)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isActionLoading && setShowFormModal(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#ececed] p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#ececed] pb-3">
              <h3 className="text-[16px] font-semibold text-[#101828]">
                {formMode === "create" ? "Yeni dil əlavə et" : "Dili redaktə et"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                disabled={isActionLoading}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Dil kodu</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AZ"
                maxLength={10}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors uppercase"
                autoFocus
              />
              <p className="text-[11px] text-gray-400">
                ISO kodu kimi qısa kod istifadə edin (AZ, EN, RU, TR və s.)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                disabled={isActionLoading}
                className="h-10 px-4 rounded-lg border border-[#ececed] text-sm font-medium text-[#344054] hover:bg-gray-50 disabled:opacity-50"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={!code.trim() || isActionLoading}
                className={cn(
                  "h-10 px-5 rounded-lg bg-[#00b4cc] text-sm font-medium text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-40"
                )}
              >
                {isActionLoading && <Loader2 size={14} className="animate-spin" />}
                Yadda saxla
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTargetCode && (
        <ConfirmDeleteModal
          name={deleteTargetCode}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTargetCode(null)}
          isLoading={isActionLoading}
        />
      )}

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>
  );

  if (isTab) return content;

  return (
    <div className="flex flex-col gap-4 w-full">
      <Section>{content}</Section>
    </div>
  );
}
