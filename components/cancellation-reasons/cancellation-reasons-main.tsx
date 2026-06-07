"use client"

import { useState } from 'react'
import { Plus, Trash2, Pencil, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCancellationReasons, CancelReason } from '@/lib/query/use-cancellation-reasons'
import { ConfirmDeleteModal } from '../gyms/modals/confirm-delete-modal'
import { SuccessAnimationModal } from '../ui/success-animation-modal'
import { useT } from '@/lib/i18n'

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#ececed] bg-white p-6 flex flex-col gap-5 w-full">
      {title && <h2 className="text-sm font-semibold text-black">{title}</h2>}
      {children}
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4CC]',
        checked ? 'bg-[#00B4CC]' : 'bg-[#e4e4e7]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export default function CancellationReasonsMain({ isTab = false }: { isTab?: boolean }) {
  const t = useT()
  const { reasons, isLoading, createReason, updateReason, deleteReason } = useCancellationReasons()
  const [showFormModal, setShowFormModal] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editCode, setEditCode] = useState<string | null>(null)
  
  // Form fields
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [requiresComment, setRequiresComment] = useState(false)
  
  const [deleteTargetCode, setDeleteTargetCode] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  })

  // Open modal for creating a new reason
  const handleOpenCreate = () => {
    setFormMode('create')
    setEditCode(null)
    setCode('')
    setLabel('')
    setRequiresComment(false)
    setShowFormModal(true)
  }

  // Open modal for editing a reason
  const handleOpenEdit = (reason: CancelReason) => {
    setFormMode('edit')
    setEditCode(reason.code)
    setCode(reason.code)
    setLabel(reason.label)
    setRequiresComment(reason.requiresComment)
    setShowFormModal(true)
  }

  const handleLabelChange = (value: string) => {
    setLabel(value)
    if (!value.trim()) {
      setRequiresComment(true)
    }
  }

  // Save creation or edits
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    try {
      setIsActionLoading(true)
      // Enforce: if label is empty, switch requiresComment to true
      const finalRequiresComment = label.trim() === '' ? true : requiresComment
      const payload: CancelReason = {
        code: code.trim().toUpperCase(),
        label: label.trim() || code.trim().toUpperCase(), // fallback to code if empty
        requiresComment: finalRequiresComment,
      }

      if (formMode === 'edit' && editCode) {
        await updateReason({ code: editCode, payload })
        setModalConfig({ isOpen: true, message: t.cancellationReasons.successUpdated, type: 'success' })
      } else {
        await createReason(payload)
        setModalConfig({ isOpen: true, message: t.cancellationReasons.successAdded, type: 'success' })
      }
      setShowFormModal(false)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.error?.message || err?.message || t.error.generic
      setModalConfig({ isOpen: true, message: msg, type: 'error' })
    } finally {
      setIsActionLoading(false)
    }
  }

  // Delete reason
  const handleDelete = async () => {
    if (!deleteTargetCode) return

    try {
      setIsActionLoading(true)
      await deleteReason(deleteTargetCode)
      setModalConfig({ isOpen: true, message: t.cancellationReasons.successDeleted, type: 'success' })
      setDeleteTargetCode(null)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.error?.message || err?.message || t.error.generic
      setModalConfig({ isOpen: true, message: msg, type: 'error' })
    } finally {
      setIsActionLoading(false)
    }
  }

  const content = (
    <>
      <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start px-5 py-4">
        
        {/* Header toolbar */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-3 gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-semibold leading-[24px] text-black">
              {t.cancellationReasons.title}
            </h2>
            <p className="text-[12px] text-gray-500 leading-normal font-normal">
              {t.cancellationReasons.description}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="h-[40px] rounded-lg bg-[#00b4cc] flex items-center justify-center px-4 py-2 gap-2 text-[13px] font-medium text-white hover:opacity-90 transition-all shadow-md shadow-cyan-50 shrink-0"
          >
            <Plus size={16} /> {t.cancellationReasons.addBtn}
          </button>
        </div>

        {/* Content area */}
        <div className="w-full flex flex-col items-start gap-6 mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 w-full">
              <Loader2 className="animate-spin text-[#00B4CC]" size={32} />
            </div>
          ) : reasons.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 italic border border-dashed border-[#ececed] rounded-[12px] w-full">
              {t.cancellationReasons.noReasons}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-[#ececed] w-full">
              <table className="w-full text-sm font-sans border-collapse">
                <thead>
                  <tr className="border-b border-[#ececed] bg-gray-50/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black tracking-wider">{t.cancellationReasons.code}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black tracking-wider">{t.cancellationReasons.label}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-black tracking-wider">{t.cancellationReasons.requiresComment}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-black tracking-wider w-28">{t.cancellationReasons.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ececed]">
                  {reasons.map((reason) => (
                    <tr key={reason.code} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-black font-semibold font-sans">{reason.code}</td>
                      <td className="px-4 py-3.5 text-sm text-black font-normal font-sans">{reason.label}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans",
                          reason.requiresComment ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-500 border border-slate-200"
                        )}>
                          {reason.requiresComment ? t.common.yes : t.common.no}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(reason)}
                          className="p-1.5 rounded-lg border border-[#ececed] text-slate-500 hover:border-[#00B4CC] hover:text-[#00B4CC] transition-colors"
                          title={t.common.edit}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetCode(reason.code)}
                          className="p-1.5 rounded-lg border border-[#ececed] text-slate-500 hover:border-red-400 hover:text-red-500 transition-colors"
                          title={t.common.delete}
                        >
                          <Trash2 size={13} />
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

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white border border-[#ececed] p-6 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans"
          >
            <div className="flex items-center justify-between border-b border-[#ececed] pb-3 text-[#101828]">
              <h3 className="text-base font-semibold leading-tight font-sans">
                {formMode === 'create' ? t.cancellationReasons.createModalTitle : t.cancellationReasons.editModalTitle}
              </h3>
              <button type="button" onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 font-sans">{t.cancellationReasons.code}</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  disabled={formMode === 'edit'}
                  placeholder="Məs: USER_CHANGE_MIND"
                  className="rounded-lg border border-[#ececed] bg-[#fafafa] px-3 py-2.5 text-sm font-sans uppercase outline-none focus:border-[#00B4CC] transition-colors disabled:opacity-50"
                />
                <span className="text-[10px] text-gray-400 font-normal font-sans">{t.cancellationReasons.codeInstruction}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 font-sans">{t.cancellationReasons.label}</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Məs: Fikrimi dəyişdim"
                  className="rounded-lg border border-[#ececed] bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors font-sans"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#ececed] bg-[#fafafa] p-4 font-sans">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black font-sans">{t.cancellationReasons.requiresComment}</span>
                  <span className="text-[10px] text-gray-400 leading-normal font-sans">{t.cancellationReasons.commentHelpText}</span>
                </div>
                <Toggle checked={requiresComment} onChange={setRequiresComment} />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#ececed] pt-4 mt-2 font-sans">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="h-[38px] rounded-lg border border-[#ececed] px-5 text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-colors font-sans"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isActionLoading || !code.trim()}
                className="h-[38px] rounded-lg bg-[#00B4CC] px-6 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 font-sans"
              >
                {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : t.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetCode && (
        <ConfirmDeleteModal
          name={`"${deleteTargetCode}" ${t.cancellationReasons.deleteConfirm}`}
          isLoading={isActionLoading}
          onCancel={() => setDeleteTargetCode(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Success/Error Toast Modal */}
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
    <div className="w-full p-4 font-sans">
      {content}
    </div>
  );
}
