'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Wallet } from 'lucide-react'
import { apiPut } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

type CoinWalletResponse = {
  coinBalance?: number
  totalBalance?: number
  balance?: number
}

interface ChangeCoinBalanceModalProps {
  userId: number
  userName: string
  currentBalance?: number | null
  onClose: () => void
  onSuccess?: (balance?: number) => void
}

export function ChangeCoinBalanceModal({
  userId,
  userName,
  currentBalance,
  onClose,
  onSuccess,
}: ChangeCoinBalanceModalProps) {
  const t = useT()
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState(
    currentBalance !== null && currentBalance !== undefined && Number.isFinite(Number(currentBalance))
      ? String(currentBalance)
      : '0',
  )
  const [description, setDescription] = useState('')
  const [sendNotification, setSendNotification] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState(t.details.changeCoinBalanceDefaultTitle)
  const [notificationBody, setNotificationBody] = useState(t.details.changeCoinBalanceDefaultBody)
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    message: string
    type: 'success' | 'error'
  }>({ isOpen: false, message: '', type: 'success' })

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const amountNum = Number(amount)
  const canSubmit =
    Number.isFinite(amountNum) &&
    amountNum >= 0 &&
    (!sendNotification || (notificationTitle.trim() !== '' && notificationBody.trim() !== ''))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    try {
      const res = await apiPut<CoinWalletResponse>(`/api/v1/admin/coins/users/${userId}/balance`, {
        balance: amountNum,
        description: description.trim() || t.details.changeCoinBalanceDefaultDescription,
        sendNotification,
        notificationTitle: sendNotification ? notificationTitle.trim() : undefined,
        notificationBody: sendNotification ? notificationBody.trim() : undefined,
      })
      const balance = res.coinBalance ?? res.totalBalance ?? res.balance
      let parsed: number | undefined
      if (typeof balance === 'number') {
        parsed = balance
      } else if (balance !== undefined && balance !== null) {
        const asNumber = Number(balance)
        if (Number.isFinite(asNumber)) parsed = asNumber
      }
      if (parsed !== undefined) onSuccess?.(parsed)
      setModalConfig({
        isOpen: true,
        message: t.details.changeCoinBalanceSuccess.replace('{balance}', String(parsed ?? amountNum)),
        type: 'success',
      })
      setTimeout(() => onClose(), 1200)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.details.changeCoinBalanceFailed
      setModalConfig({ isOpen: true, message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const currentLabel =
    currentBalance !== null && currentBalance !== undefined && Number.isFinite(Number(currentBalance))
      ? new Intl.NumberFormat('az-AZ', { maximumFractionDigits: 2 }).format(Number(currentBalance))
      : '0'

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[480px] rounded-[12px] bg-white border border-[#ececed] p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-[#ececed] pb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00B4CC]/10 text-[#00B4CC]">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-black leading-7">
                {t.details.changeCoinBalanceTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {userName} · ID {userId} · {t.details.changeCoinBalanceCurrent}: {currentLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">{t.details.changeCoinBalanceNew}</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="30"
              className="h-11 w-full rounded-lg border border-[#ececed] bg-white px-4 text-[15px] outline-none focus:border-[#00B4CC]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-black">{t.details.sendCoinDescription}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.details.changeCoinBalanceDescriptionPlaceholder}
              className="h-11 w-full rounded-lg border border-[#ececed] bg-white px-4 text-[15px] outline-none focus:border-[#00B4CC]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="h-4 w-4 rounded border-[#cecfd2] accent-[#00B4CC]"
            />
            {t.details.sendCoinNotify}
          </label>

          {sendNotification && (
            <div className="flex flex-col gap-3 rounded-lg border border-[#ececed] bg-[#FAFAFA] p-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-black">{t.details.sendCoinNotifyTitle}</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#ececed] bg-white px-3 text-sm outline-none focus:border-[#00B4CC]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-black">{t.details.sendCoinNotifyBody}</label>
                <textarea
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#ececed] bg-white px-3 py-2 text-sm outline-none focus:border-[#00B4CC] resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 min-w-[110px] rounded-lg border border-[#cecfd2] bg-white px-4 text-sm font-medium text-black hover:bg-slate-50 disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="h-10 min-w-[110px] rounded-lg bg-[#00b4cc] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:bg-[#c1c1cc] disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? t.details.changeCoinBalanceSaving : t.details.changeCoinBalanceSubmit}
            </button>
          </div>
        </form>
      </div>

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          if (modalConfig.type === 'success') onClose()
        }}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </>,
    document.body,
  )
}
