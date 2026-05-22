"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useI18nStore } from "@/lib/i18n";
import {
  useLegalDocuments,
  useCreateLegalDocument,
  useUpdateLegalDocument,
  useDeleteLegalDocument,
  useActivateLegalDocument,
  useDeactivateLegalDocument,
  type LegalDocument,
} from "@/lib/query/legal-query";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { ConfirmDeleteModal } from "@/components/gyms/modals/confirm-delete-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LegalDocumentsTab() {
  const selectedLang = useI18nStore((s) => s.locale);
  const { data: documents, isLoading, refetch } = useLegalDocuments(selectedLang);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteLegalDocument();
  const { mutate: activateDoc, isPending: isActivating } = useActivateLegalDocument();
  const { mutate: deactivateDoc, isPending: isDeactivating } = useDeactivateLegalDocument();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LegalDocument | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  const handleDelete = (doc: LegalDocument) => {
    setDeleteTarget(doc);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteDoc(deleteTarget.id, {
      onSuccess: () => {
        setStatusModal({
          isOpen: true,
          message: "Sənəd uğurla silindi",
          type: "success",
        });
        setDeleteTarget(null);
        refetch();
      },
      onError: (err: any) => {
        setStatusModal({
          isOpen: true,
          message: err.message || "Xəta baş verdi",
          type: "error",
        });
      },
    });
  };

  const handleToggleStatus = (doc: LegalDocument) => {
    const action = doc.isActive ? deactivateDoc : activateDoc;
    action(doc.id, {
      onSuccess: () => {
        setStatusModal({
          isOpen: true,
          message: `Sənəd ${doc.isActive ? "deaktiv" : "aktiv"} edildi`,
          type: "success",
        });
        refetch();
      },
      onError: (err: any) => {
        setStatusModal({
          isOpen: true,
          message: err.message || "Xəta baş verdi",
          type: "error",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#00B4CC]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-4 sm:p-5 gap-6 text-left text-sm text-foreground font-sans shadow-sm">
      <div className="self-stretch flex items-center justify-between pb-3 border-b border-[#ececed]">
        <h2 className="text-[18px] font-bold text-[#101828] font-sans tracking-tight">Hüquqi Sənədlər</h2>
        <button
          onClick={() => {
            setEditingDoc(null);
            setIsFormModalOpen(true);
          }}
          className="h-10 px-4 bg-[#00B4CC] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#009DB3] transition-colors"
        >
          <Plus size={18} />
          <span>Yeni Sənəd</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#ececed] text-left text-[13px] font-semibold text-[#6a7282]">
              <th className="pb-3 pr-4">ID</th>
              <th className="pb-3 px-4">Tip</th>
              <th className="pb-3 px-4">Yaradılma tarixi</th>
              <th className="pb-3 px-4">Son dəyişdirilmə tarixi</th>
              <th className="pb-3 px-4">Versiya</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {!documents || documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  Hələ sənəd əlavə edilməyib
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-[#ececed] last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 pr-4 text-[#101828] font-medium">#{doc.id}</td>
                  <td className="py-4 px-4 text-[#4a5565]">{doc.type}</td>
                  <td className="py-4 px-4 text-[#101828] font-medium">{doc.createdAt || "---"}</td>
                  <td className="py-4 px-4 text-[#101828] font-medium">{doc.updatedAt || "---"}</td>
                  <td className="py-4 px-4 text-[#4a5565]">{doc.version}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full",
                      doc.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {doc.isActive ? "Aktiv" : "Deaktiv"}
                    </span>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        title={doc.isActive ? "Deaktiv et" : "Aktiv et"}
                        disabled={isActivating || isDeactivating}
                      >
                        {doc.isActive ? <Square size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingDoc(doc);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Redaktə et"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                        title="Sil"
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DocumentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        document={editingDoc}
        onSuccess={() => {
          setIsFormModalOpen(false);
          setShowSuccessModal(true);
          refetch();
        }}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Əməliyyat uğurla tamamlandı!"
      />

      <SuccessAnimationModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
}

// Sub-component for Document Create/Edit
function DocumentFormModal({ isOpen, onClose, document, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  onSuccess: () => void;
}) {
  const selectedLang = useI18nStore((s) => s.locale);
  const { mutate: createDoc, isPending: isCreating } = useCreateLegalDocument();
  const { mutate: updateDoc, isPending: isUpdating } = useUpdateLegalDocument();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    content: "",
    version: "1.0",
  });

  // Reset or populate form when modal opens
  if (isOpen && document && formData.title === "" && formData.type === "") {
    setFormData({
      type: document.type,
      title: document.title,
      content: document.content,
      version: document.version,
    });
  } else if (isOpen && !document && formData.version === "" && formData.type === "") {
    setFormData({ type: "TERMS", title: "", content: "", version: "1.0" });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.type.trim()) {
      toast.error("Bütün vacib xanaları doldurun");
      return;
    }

    if (document) {
      updateDoc(
        { id: document.id, payload: { title: formData.title, content: formData.content, version: formData.version } },
        {
          onSuccess,
          onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
        }
      );
    } else {
      createDoc(
        {
          type: formData.type,
          title: formData.title,
          content: formData.content,
          version: formData.version,
          is_active: false,
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setFormData({ type: "", title: "", content: "", version: "" });
        onClose();
      }
    }}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[600px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1F2937]">
            {document ? "Sənədi yenilə" : "Yeni sənəd"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {!document && (
            <div className="flex flex-col gap-2 w-full text-left">
              <label className="text-sm font-semibold text-[#1F2937]">Tip</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#00B4CC] focus:bg-white transition-all h-[48px]"
              >
                <option value="TERMS">İstifadə Şərtləri</option>
                <option value="PRIVACY">Məxfilik Siyasəti</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full text-left">
            <label className="text-sm font-semibold text-[#1F2937]">Başlıq</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Məs: İstifadə Şərtləri v2"
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#00B4CC] focus:bg-white transition-all h-[48px]"
            />
          </div>

          <div className="flex flex-col gap-2 w-full text-left">
            <label className="text-sm font-semibold text-[#1F2937]">Versiya</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="Məs: 1.0"
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#00B4CC] focus:bg-white transition-all h-[48px]"
            />
          </div>

          <div className="flex flex-col gap-2 w-full text-left">
            <label className="text-sm font-semibold text-[#1F2937]">Məzmun (HTML/Text)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Sənədin məzmununu bura daxil edin..."
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-xl px-4 py-3 text-sm font-medium text-[#1F2937] outline-none focus:border-[#00B4CC] focus:bg-white transition-all h-[240px] resize-none"
            />
          </div>

          <div className="flex items-center justify-center gap-4 w-full mt-4">
            <button
              onClick={() => {
                setFormData({ type: "", title: "", content: "", version: "" });
                onClose();
              }}
              className="flex-1 h-12 rounded-xl border border-[#ECECED] bg-white text-[#4A5568] font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-white font-semibold text-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
              Yadda saxla
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
