"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useI18nStore, useT } from "@/lib/i18n";
import {
  useLegalDocuments,
  useDeleteLegalDocument,
  type LegalDocument,
} from "@/lib/query/legal-query";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { ConfirmDeleteModal } from "@/components/gyms/modals/confirm-delete-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LegalDocumentModal } from "./modals/legal-document-modal";


export function LegalDocumentsTab() {
  const selectedLang = useI18nStore((s) => s.locale);
  const t = useT();
  const { data: documents, isLoading, refetch } = useLegalDocuments(selectedLang);
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteLegalDocument();

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
          message: t.legal.deleteSuccess,
          type: "success",
        });
        setDeleteTarget(null);
        refetch();
      },
      onError: (err: any) => {
        setStatusModal({
          isOpen: true,
          message: err.message || t.legal.errorOccurred,
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
        <h2 className="text-[18px] font-bold text-[#101828] font-sans tracking-tight">{t.legal.sectionTitle}</h2>
        <button
          onClick={() => {
            setEditingDoc(null);
            setIsFormModalOpen(true);
          }}
          className="h-10 px-4 bg-[#00B4CC] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#009DB3] transition-colors"
        >
          <Plus size={18} />
          <span>{t.legal.newDocument}</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-[#ececed] text-left text-[13px] font-semibold text-[#6a7282]">
              <th className="pb-3 pr-4">{t.legal.id}</th>
              <th className="pb-3 px-4">{t.legal.type}</th>
              <th className="pb-3 px-4">{t.legal.createdAt}</th>
              <th className="pb-3 px-4">{t.legal.updatedAt}</th>
              <th className="pb-3 px-4">{t.legal.version}</th>
              <th className="pb-3 px-4">{t.legal.status}</th>
              <th className="pb-3 pl-4 text-right">{t.legal.actions}</th>
            </tr>
          </thead>
          <tbody>
            {!documents || documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  {t.legal.noDocuments}
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-[#ececed] last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 pr-4 text-[#101828] font-medium">#{doc.id}</td>
                  <td className="py-4 px-4 text-[#4a5565]">
                    {doc.type === "TERMS_OF_USE"
                      ? t.legal.termsOfUse
                      : doc.type === "PRIVACY_POLICY"
                      ? t.legal.privacyPolicy
                      : doc.type}
                  </td>
                  <td className="py-4 px-4 text-[#101828] font-medium">{doc.createdAt || "---"}</td>
                  <td className="py-4 px-4 text-[#101828] font-medium">{doc.updatedAt || "---"}</td>
                  <td className="py-4 px-4 text-[#4a5565]">{doc.version}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full",
                      doc.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {doc.isActive ? t.legal.active : t.legal.deactive}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer">
                            <Image src="/more.svg" width={24} height={24} alt={t.legal.more} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white border border-[#ececed] rounded-lg shadow-sm">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingDoc(doc);
                              setIsFormModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-[#4a5565] hover:bg-slate-50 cursor-pointer"
                          >
                            <Pencil size={14} className="text-[#00B4CC]" />
                            <span>{t.legal.edit}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 size={14} className="text-red-500" />
                            <span>{t.legal.delete}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LegalDocumentModal
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
        message={t.legal.successMsg}
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


