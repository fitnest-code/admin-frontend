'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { apiPost } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { Spinner } from '@/components/ui/spinner'

function ModalBase({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
      onClick={onClose}
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

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  loading,
  disabled,
}: {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <div className="w-full flex items-center justify-end gap-3 mt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="h-[40px] px-5 rounded-[8px] bg-white border border-[#cecfd2] flex items-center justify-center transition-all hover:bg-slate-50 disabled:opacity-60"
      >
        <span className="text-sm font-medium text-black">{cancelLabel}</span>
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled || loading}
        className="h-[40px] px-6 rounded-[8px] bg-[#00b4cc] flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-sm text-white font-semibold text-sm disabled:bg-[#c1c1cc] disabled:shadow-none disabled:cursor-not-allowed"
      >
        {loading && <Spinner className="size-4 text-white" />}
        {confirmLabel}
      </button>
    </div>
  )
}

export function WelcomeBonusModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const c = t.campaign
  const [title, setTitle] = useState(c.defaultWelcomeTitle)
  const [body, setBody] = useState(c.defaultWelcomeBody)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  async function handleSend() {
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
      setResult({
        open: true,
        message: c.welcomeResult
          .replace('{success}', String(res.totalSuccess))
          .replace('{total}', String(res.totalRequested))
          .replace('{failed}', String(res.totalFailed)),
        type: 'success',
      })
    } catch (e) {
      setResult({
        open: true,
        message: e instanceof Error ? e.message : c.welcomeFailed,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase onClose={onClose}>
      <div className="flex flex-col gap-6 font-sans">
        <div className="w-full border-b border-[#ececed] pb-3">
          <h2 className="text-[20px] font-semibold text-black leading-[30px]">{c.welcomeModalTitle}</h2>
        </div>
        <Field label={c.notificationTitle} value={title} onChange={setTitle} />
        <Field label={c.notificationBody} value={body} onChange={setBody} rows={4} />
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSend}
          cancelLabel={t.common.cancel}
          confirmLabel={loading ? c.sending : c.sendWelcome}
          loading={loading}
          disabled={!title.trim() || !body.trim()}
        />
      </div>
      <SuccessAnimationModal
        isOpen={result.open}
        onClose={() => {
          setResult((r) => ({ ...r, open: false }))
          if (result.type === 'success') onClose()
        }}
        message={result.message}
        type={result.type}
      />
    </ModalBase>
  )
}

export function BulkCampaignModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const c = t.campaign
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState(c.defaultCampaignTitle)
  const [body, setBody] = useState(c.defaultCampaignBody)
  const [userIdsRaw, setUserIdsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  async function handleSend() {
    const ids = userIdsRaw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0)

    if (ids.length === 0) {
      setResult({ open: true, message: c.emptyUserIds, type: 'error' })
      return
    }

    const coinAmount = Number(amount)
    if (!Number.isFinite(coinAmount) || coinAmount <= 0) {
      setResult({ open: true, message: c.invalidAmount, type: 'error' })
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
      setResult({
        open: true,
        message: c.campaignResult
          .replace('{success}', String(res.totalSuccess))
          .replace('{total}', String(res.totalRequested))
          .replace('{failed}', String(res.totalFailed)),
        type: 'success',
      })
    } catch (e) {
      setResult({
        open: true,
        message: e instanceof Error ? e.message : c.campaignFailed,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalBase onClose={onClose}>
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
        <ModalActions
          onCancel={onClose}
          onConfirm={handleSend}
          cancelLabel={t.common.cancel}
          confirmLabel={loading ? c.sending : c.sendCampaign}
          loading={loading}
          disabled={!amount.trim() || !title.trim() || !userIdsRaw.trim()}
        />
      </div>
      <SuccessAnimationModal
        isOpen={result.open}
        onClose={() => {
          setResult((r) => ({ ...r, open: false }))
          if (result.type === 'success') onClose()
        }}
        message={result.message}
        type={result.type}
      />
    </ModalBase>
  )
}
