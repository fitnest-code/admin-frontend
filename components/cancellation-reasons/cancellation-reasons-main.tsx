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
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
      {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
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
        'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4CC]',
        checked ? 'bg-[#00B4CC]' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default function CancellationReasonsMain() {
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

  // Save creation or edits
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !label.trim()) return

    try {
      setIsActionLoading(true)
      const payload: CancelReason = {
        code: code.trim().toUpperCase(),
        label: label.trim(),
        requiresComment,
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

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-xl font-bold text-foreground">{t.cancellationReasons.title}</h1>
      
      <div className="flex flex-col gap-4">
        <Section>
          <div className="flex justify-between items-center pb-2 gap-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.cancellationReasons.description}
            </p>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#008799] transition-colors shrink-0 shadow-sm"
            >
              <Plus size={14} /> {t.cancellationReasons.addBtn}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-[#00B4CC]" size={28} />
            </div>
          ) : reasons.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground italic border border-dashed border-border rounded-xl">
              {t.cancellationReasons.noReasons}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">{t.cancellationReasons.code}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">{t.cancellationReasons.label}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">{t.cancellationReasons.requiresComment}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground w-28">{t.cancellationReasons.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reasons.map((reason) => (
                    <tr key={reason.code} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-foreground font-semibold">{reason.code}</td>
                      <td className="px-4 py-3.5 text-sm text-foreground">{reason.label}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                          reason.requiresComment ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-500 border border-slate-200"
                        )}>
                          {reason.requiresComment ? t.common.yes : t.common.no}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(reason)}
                          className="p-1.5 rounded-lg border border-border text-slate-500 hover:border-[#00B4CC] hover:text-[#00B4CC] transition-colors"
                          title={t.common.edit}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetCode(reason.code)}
                          className="p-1.5 rounded-lg border border-border text-slate-500 hover:border-red-400 hover:text-red-500 transition-colors"
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
        </Section>

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
            <form
              onSubmit={handleSave}
              className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white border border-[#ececed] p-6 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-[#ececed] pb-3 text-[#101828]">
                <h3 className="text-base font-semibold leading-tight">
                  {formMode === 'create' ? t.cancellationReasons.createModalTitle : t.cancellationReasons.editModalTitle}
                </h3>
                <button type="button" onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t.cancellationReasons.code}</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    disabled={formMode === 'edit'}
                    placeholder="Məs: USER_CHANGE_MIND"
                    className="rounded-lg border border-border bg-[#fafafa] px-3 py-2.5 text-sm font-mono uppercase outline-none focus:border-[#00B4CC] transition-colors disabled:opacity-50"
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{t.cancellationReasons.codeInstruction}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t.cancellationReasons.label}</label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Məs: Fikrimi dəyişdim"
                    className="rounded-lg border border-border bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-[#fafafa] p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{t.cancellationReasons.requiresComment}</span>
                    <span className="text-[10px] text-muted-foreground leading-normal">{t.cancellationReasons.commentHelpText}</span>
                  </div>
                  <Toggle checked={requiresComment} onChange={setRequiresComment} />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="h-[38px] rounded-lg border border-border px-5 text-sm font-semibold text-foreground hover:bg-slate-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !code.trim() || !label.trim()}
                  className="h-[38px] rounded-lg bg-[#00B4CC] px-6 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
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
      </div>
    </div>
  )
}
