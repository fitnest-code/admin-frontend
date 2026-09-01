'use client'

import { useEffect, useState } from 'react'
import { Coins, Gift, Loader2, Megaphone } from 'lucide-react'
import { apiGet, apiPut } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { BulkCampaignModal, WelcomeBonusModal } from './campaign-modals'

type CoinSettings = {
  welcomeBonusAmount: number
  earnRateAznToCoin: number
  spendRateCoinToAzn: number
  maxDiscountPercentage: number
  expiryMonths: number
  active: boolean
}

function OpsBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
        'border-border bg-white text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs',
        disabled && 'opacity-55 cursor-not-allowed active:scale-100',
      )}
    >
      <Icon size={18} className="shrink-0 text-[#00B4CC]" />
      <span>{label}</span>
    </button>
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
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans">
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{c.title}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Settings */}
        <div className="flex-1 w-full rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Coins size={18} className="text-[#00B4CC]" />
            <h2 className="text-[16px] font-bold text-foreground tracking-tight">{c.settingsSection}</h2>
          </div>

          {settings ? (
            <>
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
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[#ececed] px-3 py-2.5">
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{c.loadFailed}</p>
          )}
        </div>

        {/* Operations — same pattern as customer detail */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="flex flex-col rounded-xl bg-white border border-border p-5 shadow-xs gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">{c.operations}</h2>
            </div>
            <div className="flex flex-col gap-3">
              <OpsBtn
                icon={Gift}
                label={c.sendWelcome}
                onClick={() => setWelcomeOpen(true)}
              />
              <OpsBtn
                icon={Megaphone}
                label={c.sendCampaign}
                onClick={() => setBulkOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {welcomeOpen && <WelcomeBonusModal onClose={() => setWelcomeOpen(false)} />}
      {bulkOpen && <BulkCampaignModal onClose={() => setBulkOpen(false)} />}

      <SuccessAnimationModal
        isOpen={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}
