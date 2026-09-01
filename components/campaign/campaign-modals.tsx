'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiPost } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { Spinner } from '@/components/ui/spinner'

type SendState = 'form' | 'confirm' | 'success' | 'error'

function ModalBase({
  children,
  onClose,
  closeDisabled = false,
}: {
  children: React.ReactNode
  onClose: () => void
  closeDisabled?: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={closeDisabled ? undefined : onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-[12px] bg-white border border-[#ececed] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  rows,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'number'
  rows?: number
}) {
  const className =
    'w-full rounded-[4px] border border-[#ececed] bg-white px-4 py-3 text-[16px] text-black outline-none focus:border-[#00B4CC] transition-colors placeholder:text-muted-foreground/60'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[16px] font-medium text-black leading-[24px]">{label}</label>
      {rows ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${className} min-h-[100px] resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  )
}

function FormActions({
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
  disabled,
}: {
  onCancel: () => void
  onConfirm: () => void
  cancelLabel: string
  confirmLabel: string
  disabled?: boolean
}) {
  return (
    <div className="w-full flex items-center justify-center gap-4 mt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-[40px] max-w-[140px] rounded-[8px] bg-white border border-[#cecfd2] flex items-center justify-center px-4 transition-all hover:bg-slate-50"
      >
        <span className="text-sm font-medium text-black">{cancelLabel}</span>
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className="flex-1 h-[40px] max-w-[140px] rounded-[8px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-sm text-white text-sm font-semibold disabled:bg-[#c1c1cc] disabled:shadow-none disabled:cursor-not-allowed"
      >
        {confirmLabel}
      </button>
    </div>
  )
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
  loading = false,
  cancelLabel,
  confirmLabel,
  sendingLabel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  cancelLabel: string
  confirmLabel: string
  sendingLabel: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-4 gap-6">
      <p className="text-xl font-semibold text-black text-center max-w-xs leading-relaxed">{message}</p>
      <div className="w-full flex items-center justify-center gap-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-[40px] max-w-[140px] rounded-[8px] bg-white border border-[#cecfd2] flex items-center justify-center px-4 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-medium text-black">{cancelLabel}</span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 h-[40px] max-w-[140px] rounded-[8px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-sm text-white text-sm font-semibold disabled:opacity-80 disabled:cursor-not-allowed gap-2"
        >
          {loading ? (
            <>
              <Spinner className="size-4 text-white" />
              <span>{sendingLabel}</span>
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </div>
  )
}

export function WelcomeBonusModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const c = t.campaign
  const [title, setTitle] = useState(c.defaultWelcomeTitle)
  const [body, setBody] = useState(c.defaultWelcomeBody)
  const [state, setState] = useState<SendState>('form')
  const [loading, setLoading] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  async function handleConfirm() {
    setLoading(true)
    try {
      const res = await apiPost<{
        totalRequested: number
        totalSuccess: number
        totalFailed: number
      }>('/api/v1/admin/coins/bulk-welcome-bonus', {
        notificationTitle: title,
        notificationBody: body,
        sendNotification: true,
      })
      setResultMessage(
        c.welcomeResult
          .replace('{success}', String(res.totalSuccess))
          .replace('{total}', String(res.totalRequested))
          .replace('{failed}', String(res.totalFailed)),
      )
      setState('success')
    } catch (e) {
      setResultMessage(e instanceof Error ? e.message : c.welcomeFailed)
      setState('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ModalBase onClose={onClose} closeDisabled={loading}>
        {state === 'form' && (
          <div className="flex flex-col gap-6 font-sans">
            <div className="w-full border-b border-[#ececed] pb-3">
              <h2 className="text-[20px] font-semibold text-black leading-[30px]">{c.welcomeModalTitle}</h2>
            </div>
            <Field label={c.notificationTitle} value={title} onChange={setTitle} />
            <Field label={c.notificationBody} value={body} onChange={setBody} rows={4} />
            <FormActions
              onCancel={onClose}
              onConfirm={() => setState('confirm')}
              cancelLabel={t.common.cancel}
              confirmLabel={t.modals.sendButton}
              disabled={!title.trim() || !body.trim()}
            />
          </div>
        )}
        {state === 'confirm' && (
          <ConfirmDialog
            message={c.confirmWelcomeTitle}
            onConfirm={handleConfirm}
            onCancel={() => setState('form')}
            loading={loading}
            cancelLabel={t.common.cancel}
            confirmLabel={t.modals.sendButton}
            sendingLabel={c.sending}
          />
        )}
      </ModalBase>
      <SuccessAnimationModal
        isOpen={state === 'success'}
        onClose={onClose}
        message={resultMessage}
        type="success"
      />
      <SuccessAnimationModal
        isOpen={state === 'error'}
        onClose={() => setState('form')}
        message={resultMessage}
        type="error"
      />
    </>
  )
}

export function BulkCampaignModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const c = t.campaign
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState(c.defaultCampaignTitle)
  const [body, setBody] = useState(c.defaultCampaignBody)
  const [userIdsRaw, setUserIdsRaw] = useState('')
  const [state, setState] = useState<SendState>('form')
  const [loading, setLoading] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  async function handleConfirm() {
    const ids = userIdsRaw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0)

    if (ids.length === 0) {
      setResultMessage(c.emptyUserIds)
      setState('error')
      return
    }

    const coinAmount = Number(amount)
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      setResultMessage(c.invalidAmount)
      setState('error')
      return
    }

    setLoading(true)
    try {
      const res = await apiPost<{
        totalRequested: number
        totalSuccess: number
        totalFailed: number
      }>('/api/v1/admin/coins/bulk-adjust', {
        userIds: ids,
        amount: coinAmount,
        type: 'CAMPAIGN_BONUS',
        description: title,
        notificationTitle: title,
        notificationBody: body,
        sendNotification: true,
      })
      setResultMessage(
        c.campaignResult
          .replace('{success}', String(res.totalSuccess))
          .replace('{total}', String(res.totalRequested))
          .replace('{failed}', String(res.totalFailed)),
      )
      setState('success')
    } catch (e) {
      setResultMessage(e instanceof Error ? e.message : c.campaignFailed)
      setState('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ModalBase onClose={onClose} closeDisabled={loading}>
        {state === 'form' && (
          <div className="flex flex-col gap-5 font-sans">
            <div className="w-full border-b border-[#ececed] pb-3">
              <h2 className="text-[20px] font-semibold text-black leading-[30px]">{c.bulkModalTitle}</h2>
            </div>
            <Field label={c.coinAmount} value={amount} onChange={setAmount} type="number" placeholder="0" />
            <Field label={c.notificationTitle} value={title} onChange={setTitle} />
            <Field label={c.notificationBody} value={body} onChange={setBody} rows={3} />
            <Field
              label={c.userIds}
              value={userIdsRaw}
              onChange={setUserIdsRaw}
              rows={4}
              placeholder={c.userIdsPlaceholder}
            />
            <FormActions
              onCancel={onClose}
              onConfirm={() => setState('confirm')}
              cancelLabel={t.common.cancel}
              confirmLabel={t.modals.sendButton}
              disabled={!amount.trim() || !title.trim() || !userIdsRaw.trim()}
            />
          </div>
        )}
        {state === 'confirm' && (
          <ConfirmDialog
            message={c.confirmCampaignTitle}
            onConfirm={handleConfirm}
            onCancel={() => setState('form')}
            loading={loading}
            cancelLabel={t.common.cancel}
            confirmLabel={t.modals.sendButton}
            sendingLabel={c.sending}
          />
        )}
      </ModalBase>
      <SuccessAnimationModal
        isOpen={state === 'success'}
        onClose={onClose}
        message={resultMessage}
        type="success"
      />
      <SuccessAnimationModal
        isOpen={state === 'error'}
        onClose={() => setState('form')}
        message={resultMessage}
        type="error"
      />
    </>
  )
}
