'use client'

import { useEffect, useState } from 'react'
import { Loader2, Coins } from 'lucide-react'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'

type CoinSettings = {
  welcomeBonusAmount: number
  earnRateAznToCoin: number
  spendRateCoinToAzn: number
  maxDiscountPercentage: number
  expiryMonths: number
  active: boolean
}

export default function CampaignPage() {
  const [settings, setSettings] = useState<CoinSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [campaignAmount, setCampaignAmount] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('FitNest Coin kampaniyası')
  const [campaignBody, setCampaignBody] = useState('Hesabınıza bonus Coin əlavə edildi.')
  const [userIdsRaw, setUserIdsRaw] = useState('')
  const [welcomeTitle, setWelcomeTitle] = useState('Xoş gəldin bonusu')
  const [welcomeBody, setWelcomeBody] = useState('FitNest Coin hesabınıza əlavə edildi.')
  const [welcomeSending, setWelcomeSending] = useState(false)
  const [campaignSending, setCampaignSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiGet<CoinSettings>('/api/v1/admin/coins/settings')
      .then(setSettings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Ayarlar yüklənmədi'))
      .finally(() => setLoading(false))
  }, [])

  async function saveSettings() {
    if (!settings) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await apiPut<CoinSettings>('/api/v1/admin/coins/settings', settings)
      setSettings(updated)
      setMessage('Coin ayarları saxlanıldı.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Saxlama uğursuz oldu')
    } finally {
      setSaving(false)
    }
  }

  async function sendWelcomeBonusToExistingUsers() {
    setWelcomeSending(true)
    setError(null)
    setMessage(null)
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
      setMessage(
        `Xoş gəldin bonusu: ${result.totalSuccess}/${result.totalRequested} uğurlu, ${result.totalFailed} uğursuz.`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xoş gəldin bonusu göndərilmədi')
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
      setError('İstifadəçi ID-ləri boşdur.')
      return
    }

    const amount = Number(campaignAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Kampaniya Coin məbləği müsbət rəqəm olmalıdır.')
      return
    }

    setCampaignSending(true)
    setError(null)
    setMessage(null)
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
      setMessage(
        `Kampaniya tamamlandı: ${result.totalSuccess}/${result.totalRequested} uğurlu, ${result.totalFailed} uğursuz.`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kampaniya göndərilmədi')
    } finally {
      setCampaignSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-8 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4CC]/10">
          <Coins className="h-5 w-5 text-[#00B4CC]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kampaniya / FitNest Coin</h1>
          <p className="text-sm text-muted-foreground">
            Qeydiyyat bonusu, qazanma/istifadə qaydaları və toplu Coin kampaniyaları
          </p>
        </div>
      </div>

      {settings && (
        <section className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Qeydiyyat və sistem qaydaları</h2>
          <p className="text-sm text-muted-foreground">
            Yeni qeydiyyat bonusu və digər qaydalar buradan idarə olunur. Qeydiyyatda verilən Coin məbləği
            yalnız bu ayarlardan oxunur — kodda sabit dəyər yoxdur.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span>Qeydiyyat bonusu (Coin)</span>
              <input
                type="number"
                className="rounded-lg border border-border px-3 py-2"
                value={settings.welcomeBonusAmount}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeBonusAmount: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>1 AZN ödəniş = Coin</span>
              <input
                type="number"
                className="rounded-lg border border-border px-3 py-2"
                value={settings.earnRateAznToCoin}
                onChange={(e) =>
                  setSettings({ ...settings, earnRateAznToCoin: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Coin → AZN (20 Coin = 1 AZN)</span>
              <input
                type="number"
                className="rounded-lg border border-border px-3 py-2"
                value={settings.spendRateCoinToAzn}
                onChange={(e) =>
                  setSettings({ ...settings, spendRateCoinToAzn: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Etibarlılıq (ay)</span>
              <input
                type="number"
                className="rounded-lg border border-border px-3 py-2"
                value={settings.expiryMonths}
                onChange={(e) =>
                  setSettings({ ...settings, expiryMonths: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveSettings}
            className="self-start rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saxlanılır…' : 'Ayarları saxla'}
          </button>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mövcud istifadəçilər üçün xoş gəldin bonusu</h2>
        <p className="text-sm text-muted-foreground">
          Yalnız <code className="text-xs">isWelcomeBonusReceived = false</code> olan istifadəçilərə
          yuxarıdakı qeydiyyat bonusu məbləği verilir. Artıq bonus alanlara təkrar göndərilmir.
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span>Bildiriş başlığı (popup)</span>
          <input
            className="rounded-lg border border-border px-3 py-2"
            value={welcomeTitle}
            onChange={(e) => setWelcomeTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Bildiriş mətni (popup)</span>
          <textarea
            className="min-h-[80px] rounded-lg border border-border px-3 py-2"
            value={welcomeBody}
            onChange={(e) => setWelcomeBody(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={welcomeSending}
          onClick={sendWelcomeBonusToExistingUsers}
          className="self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {welcomeSending ? 'Göndərilir…' : 'Mövcud userlər üçün xoş gəldin bonusu göndər'}
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Toplu Coin kampaniyası</h2>
        <p className="text-sm text-muted-foreground">
          İstifadəçi ID-lərini vergül və ya yeni sətir ilə yazın. Coin-lər yalnız abunəlik ödənişində
          istifadə olunur; nağdlaşdırılmır və köçürülmür.
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span>Coin məbləği</span>
          <input
            type="number"
            className="rounded-lg border border-border px-3 py-2"
            value={campaignAmount}
            onChange={(e) => setCampaignAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Bildiriş başlığı</span>
          <input
            className="rounded-lg border border-border px-3 py-2"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Bildiriş mətni</span>
          <textarea
            className="min-h-[80px] rounded-lg border border-border px-3 py-2"
            value={campaignBody}
            onChange={(e) => setCampaignBody(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>İstifadəçi ID-ləri</span>
          <textarea
            className="min-h-[120px] rounded-lg border border-border px-3 py-2 font-mono text-xs"
            placeholder="1, 2, 3 və ya hər sətirdə bir ID"
            value={userIdsRaw}
            onChange={(e) => setUserIdsRaw(e.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={campaignSending}
          onClick={sendCampaign}
          className="self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {campaignSending ? 'Göndərilir…' : 'Kampaniya göndər'}
        </button>
      </section>

      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
