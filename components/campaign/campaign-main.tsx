'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

type CoinSettings = {
  welcomeBonusAmount: number
  earnRateAznToCoin: number
  spendRateCoinToAzn: number
  maxDiscountPercentage: number
  expiryMonths: number
  active: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#ececed] bg-white p-6 flex flex-col gap-5 w-full">
      <h2 className="text-[16px] font-semibold leading-6 text-black border-b border-[#ececed] pb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-medium text-[#475467]">{children}</span>
}

const inputClass =
  'w-full rounded-lg border border-[#ececed] bg-white px-3 py-2.5 text-sm text-black placeholder:text-[#98a2b3] focus:outline-none focus:border-[#00b4cc] transition-colors'

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

export default function CampaignMain() {
  const t = useT()
  const c = t.campaign

  const [settings, setSettings] = useState<CoinSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campaignAmount, setCampaignAmount] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignBody, setCampaignBody] = useState('')
  const [userIdsRaw, setUserIdsRaw] = useState('')
  const [welcomeTitle, setWelcomeTitle] = useState('')
  const [welcomeBody, setWelcomeBody] = useState('')
  const [welcomeSending, setWelcomeSending] = useState(false)
  const [campaignSending, setCampaignSending] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  useEffect(() => {
    setCampaignTitle(c.defaultCampaignTitle)
    setCampaignBody(c.defaultCampaignBody)
    setWelcomeTitle(c.defaultWelcomeTitle)
    setWelcomeBody(c.defaultWelcomeBody)
  }, [c.defaultCampaignBody, c.defaultCampaignTitle, c.defaultWelcomeBody, c.defaultWelcomeTitle])

  useEffect(() => {
    apiGet<CoinSettings>('/api/v1/admin/coins/settings')
      .then(setSettings)
      .catch(() => setModal({ open: true, message: c.loadFailed, type: 'error' }))
      .finally(() => setLoading(false))
  }, [c.loadFailed])

  async function saveSettings() {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await apiPut<CoinSettings>('/api/v1/admin/coins/settings', settings)
      setSettings(updated)
      setModal({ open: true, message: c.settingsSaved, type: 'success' })
    } catch (e) {
      setModal({
        open: true,
        message: e instanceof Error ? e.message : c.saveFailed,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function sendWelcomeBonusToExistingUsers() {
    setWelcomeSending(true)
    try {
      const result = await apiPost<{
        totalRequested: number
        totalSuccess: number
        totalFailed: number
      }>('/api/v1/admin/coins/bulk-welcome-bonus', {
        notificationTitle: welcomeTitle,
        notificationBody: welcomeBody,
        sendNotification: true,
      })
      setModal({
        open: true,
        message: c.welcomeResult
          .replace('{success}', String(result.totalSuccess))
          .replace('{total}', String(result.totalRequested))
          .replace('{failed}', String(result.totalFailed)),
        type: 'success',
      })
    } catch (e) {
      setModal({
        open: true,
        message: e instanceof Error ? e.message : c.welcomeFailed,
        type: 'error',
      })
    } finally {
      setWelcomeSending(false)
    }
  }

  async function sendCampaign() {
    const ids = userIdsRaw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0)

    if (ids.length === 0) {
      setModal({ open: true, message: c.emptyUserIds, type: 'error' })
      return
    }

    const amount = Number(campaignAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setModal({ open: true, message: c.invalidAmount, type: 'error' })
      return
    }

    setCampaignSending(true)
    try {
      const result = await apiPost<{
        totalRequested: number
        totalSuccess: number
        totalFailed: number
      }>('/api/v1/admin/coins/bulk-adjust', {
        userIds: ids,
        amount,
        type: 'CAMPAIGN_BONUS',
        description: campaignTitle,
        notificationTitle: campaignTitle,
        notificationBody: campaignBody,
        sendNotification: true,
      })
      setModal({
        open: true,
        message: c.campaignResult
          .replace('{success}', String(result.totalSuccess))
          .replace('{total}', String(result.totalRequested))
          .replace('{failed}', String(result.totalFailed)),
        type: 'success',
      })
    } catch (e) {
      setModal({
        open: true,
        message: e instanceof Error ? e.message : c.campaignFailed,
        type: 'error',
      })
    } finally {
      setCampaignSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-10 font-sans w-full max-w-4xl">
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{c.title}</h1>
      </div>

      {settings && (
        <Section title={c.settingsSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.welcomeBonus}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={settings.welcomeBonusAmount}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeBonusAmount: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.earnRate}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={settings.earnRateAznToCoin}
                onChange={(e) =>
                  setSettings({ ...settings, earnRateAznToCoin: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.spendRate}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={settings.spendRateCoinToAzn}
                onChange={(e) =>
                  setSettings({ ...settings, spendRateCoinToAzn: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.maxDiscount}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={settings.maxDiscountPercentage}
                onChange={(e) =>
                  setSettings({ ...settings, maxDiscountPercentage: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>{c.expiryMonths}</FieldLabel>
              <input
                type="number"
                className={inputClass}
                value={settings.expiryMonths}
                onChange={(e) =>
                  setSettings({ ...settings, expiryMonths: Number(e.target.value) })
                }
              />
            </label>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-[#ececed] px-3 py-2.5 sm:col-span-2">
              <FieldLabel>{c.active}</FieldLabel>
              <Toggle
                checked={settings.active}
                onChange={(active) => setSettings({ ...settings, active })}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveSettings}
            className="self-start h-10 rounded-lg bg-[#00b4cc] px-5 text-[13px] font-medium text-white hover:opacity-90 transition-all disabled:opacity-60 shadow-md shadow-cyan-50"
          >
            {saving ? c.saving : c.saveSettings}
          </button>
        </Section>
      )}

      <Section title={c.welcomeSection}>
        <div className="grid gap-4">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.notificationTitle}</FieldLabel>
            <input className={inputClass} value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.notificationBody}</FieldLabel>
            <textarea
              className={cn(inputClass, 'min-h-[88px] resize-y')}
              value={welcomeBody}
              onChange={(e) => setWelcomeBody(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={welcomeSending}
          onClick={sendWelcomeBonusToExistingUsers}
          className="self-start h-10 rounded-lg border border-[#00b4cc] bg-white px-5 text-[13px] font-medium text-[#00b4cc] hover:bg-[#00b4cc]/5 transition-all disabled:opacity-60"
        >
          {welcomeSending ? c.sending : c.sendWelcome}
        </button>
      </Section>

      <Section title={c.bulkSection}>
        <div className="grid gap-4">
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.coinAmount}</FieldLabel>
            <input
              type="number"
              className={inputClass}
              value={campaignAmount}
              onChange={(e) => setCampaignAmount(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.notificationTitle}</FieldLabel>
            <input className={inputClass} value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.notificationBody}</FieldLabel>
            <textarea
              className={cn(inputClass, 'min-h-[88px] resize-y')}
              value={campaignBody}
              onChange={(e) => setCampaignBody(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <FieldLabel>{c.userIds}</FieldLabel>
            <textarea
              className={cn(inputClass, 'min-h-[120px] resize-y font-mono text-xs')}
              placeholder={c.userIdsPlaceholder}
              value={userIdsRaw}
              onChange={(e) => setUserIdsRaw(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={campaignSending}
          onClick={sendCampaign}
          className="self-start h-10 rounded-lg bg-[#00b4cc] px-5 text-[13px] font-medium text-white hover:opacity-90 transition-all disabled:opacity-60 shadow-md shadow-cyan-50"
        >
          {campaignSending ? c.sending : c.sendCampaign}
        </button>
      </Section>

      <SuccessAnimationModal
        isOpen={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}
