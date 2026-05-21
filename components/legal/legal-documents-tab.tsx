"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Play, Square, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LegalDocumentsTab() {
  const { data: documents, isLoading, refetch } = useLegalDocuments();
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteLegalDocument();
  const { mutate: activateDoc, isPending: isActivating } = useActivateLegalDocument();
  const { mutate: deactivateDoc, isPending: isDeactivating } = useDeactivateLegalDocument();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm("Bu sənədi silmək istədiyinizə əminsiniz?")) {
      deleteDoc(id, {
        onSuccess: () => {
          toast.success("Sənəd uğurla silindi");
          refetch();
        },
        onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
      });
    }
  };

  const handleToggleStatus = (doc: LegalDocument) => {
    const action = doc.isActive ? deactivateDoc : activateDoc;
    action(doc.id, {
      onSuccess: () => {
        toast.success(`Sənəd ${doc.isActive ? "deaktiv" : "aktiv"} edildi`);
        refetch();
      },
      onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
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
              <th className="pb-3 px-4">Başlıq</th>
              <th className="pb-3 px-4">Versiya</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {!documents || documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Hələ sənəd əlavə edilməyib
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-[#ececed] last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 pr-4 text-[#101828] font-medium">#{doc.id}</td>
                  <td className="py-4 px-4 text-[#4a5565]">{doc.type}</td>
                  <td className="py-4 px-4 text-[#101828] font-medium">{doc.title}</td>
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
                        onClick={() => handleDelete(doc.id)}
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

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Əməliyyat uğurla tamamlandı!"
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
        { type: formData.type, title: formData.title, content: formData.content, version: formData.version },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{document ? "Sənədi yenilə" : "Yeni sənəd"}</DialogTitle>
        </DialogHeader>
      <div className="flex flex-col gap-5 py-2">
        {!document && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Tip</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="h-11 rounded-lg border border-[#ececed] px-3 outline-none focus:border-[#00B4CC]"
            >
              <option value="TERMS">İstifadə Şərtləri</option>
              <option value="PRIVACY">Məxfilik Siyasəti</option>
              <option value="REFUND">Geri Qaytarma Siyasəti</option>
              <option value="OTHER">Digər</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Başlıq</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Məs: İstifadə Şərtləri v2"
            className="h-11 rounded-lg border border-[#ececed] px-3 outline-none focus:border-[#00B4CC]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Versiya</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="Məs: 1.0"
            className="h-11 rounded-lg border border-[#ececed] px-3 outline-none focus:border-[#00B4CC]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Məzmun (HTML/Text)</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Sənədin məzmununu bura daxil edin..."
            className="h-40 rounded-lg border border-[#ececed] p-3 outline-none focus:border-[#00B4CC] resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={() => {
              setFormData({ type: "", title: "", content: "", version: "" });
              onClose();
            }}
            className="h-10 px-6 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="h-10 px-6 rounded-lg font-semibold text-white bg-[#00B4CC] hover:bg-[#009DB3] transition-colors flex items-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Yadda saxla
          </button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}
