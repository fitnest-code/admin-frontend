'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useT } from '@/lib/i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  type AdminPricingCampaignRequest,
  type AdminPricingCampaignResponse,
  usePricingCampaignMutations,
  usePricingCampaigns,
} from '@/lib/query/use-pricing-campaigns'
import { CoinSaveBar, CoinSection, CoinTabLoader } from './campaign-coin-ui'
import { cn } from '@/lib/utils'

const TIER_MONTHS = [3, 6, 12] as const

function emptyLocalized() {
  return { az: '', ru: '', en: '' }
}

function emptyRequest(): AdminPricingCampaignRequest {
  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  return {
    code: 'BLACK_FRIDAY',
    startsAt: now.toISOString(),
    endsAt: end.toISOString(),
    maxPercent: 50,
    discounts: TIER_MONTHS.map((months) => ({ months, percent: 0 })),
    pushTitle: emptyLocalized(),
    pushBody: emptyLocalized(),
    pushLast12hTitle: emptyLocalized(),
    pushLast12hBody: emptyLocalized(),
  }
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string {
  return new Date(value).toISOString()
}

function responseToRequest(c: AdminPricingCampaignResponse): AdminPricingCampaignRequest {
  return {
    code: c.code,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    maxPercent: c.maxPercent,
    discounts: normalizeDiscounts(c.discounts),
    pushTitle: { ...c.pushTitle },
    pushBody: { ...c.pushBody },
    pushLast12hTitle: { ...c.pushLast12hTitle },
    pushLast12hBody: { ...c.pushLast12hBody },
  }
}

function normalizeDiscounts(
  discounts: AdminPricingCampaignResponse['discounts'],
): AdminPricingCampaignRequest['discounts'] {
  const byMonth = new Map(
    discounts.map((d) => [d.months, typeof d.percent === 'number' ? d.percent : Number(d.percent)]),
  )
  return TIER_MONTHS.map((months) => ({
    months,
    percent: byMonth.get(months) ?? 0,
  }))
}

type LocalizedKey = keyof AdminPricingCampaignRequest['pushTitle']

function LocalizedFields({
  title,
  value,
  onChange,
  fieldPrefix,
}: {
  title: string
  value: AdminPricingCampaignRequest['pushTitle']
  onChange: (next: AdminPricingCampaignRequest['pushTitle']) => void
  fieldPrefix: string
}) {
  const locales: { key: LocalizedKey; label: string }[] = [
    { key: 'az', label: 'AZ' },
    { key: 'ru', label: 'RU' },
    { key: 'en', label: 'EN' },
  ]
  return (
    <div className="space-y-3">
      <p className="text-[13px] font-semibold text-[#101828]">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {locales.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`${fieldPrefix}-${key}`} className="text-[12px] text-[#667085]">
              {label}
            </Label>
            <Input
              id={`${fieldPrefix}-${key}`}
              value={value[key] ?? ''}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PricingCampaignPanel({
  onNotify,
}: {
  onNotify: (message: string, type: 'success' | 'error') => void
}) {
  const t = useT()
  const p = t.campaign.pricingCampaign
  const { data: campaigns, isLoading, refetch } = usePricingCampaigns()
  const {
    createCampaign,
    updateCampaign,
    activateCampaign,
    disableCampaign,
    isCreating,
    isUpdating,
    isActivating,
    isDisabling,
  } = usePricingCampaignMutations()

  const [selectedId, setSelectedId] = useState<string | 'new'>('new')
  const [draft, setDraft] = useState<AdminPricingCampaignRequest>(emptyRequest)
  const [typeDisplay, setTypeDisplay] = useState('BLACK_FRIDAY')
  const [statusDisplay, setStatusDisplay] = useState<string | null>(null)

  const selectedCampaign = useMemo(
    () => campaigns?.find((c) => c.id === selectedId),
    [campaigns, selectedId],
  )

  const loadDraft = useCallback((c: AdminPricingCampaignResponse | undefined) => {
    if (!c) {
      setDraft(emptyRequest())
      setTypeDisplay('BLACK_FRIDAY')
      setStatusDisplay(null)
      return
    }
    setDraft(responseToRequest(c))
    setTypeDisplay(c.type)
    setStatusDisplay(c.status)
  }, [])

  useEffect(() => {
    if (selectedId === 'new') {
      loadDraft(undefined)
      return
    }
    loadDraft(selectedCampaign)
  }, [selectedId, selectedCampaign, loadDraft])

  useEffect(() => {
    if (!campaigns?.length) return
    if (selectedId === 'new') return
    if (!selectedCampaign) setSelectedId(campaigns[0].id)
  }, [campaigns, selectedId, selectedCampaign])

  async function handleSave() {
    try {
      if (selectedId === 'new') {
        const created = await createCampaign(draft)
        setSelectedId(created.id)
        loadDraft(created)
        onNotify(p.created, 'success')
      } else {
        const updated = await updateCampaign({ id: selectedId, payload: draft })
        loadDraft(updated)
        onNotify(p.saved, 'success')
      }
    } catch {
      onNotify(p.saveFailed, 'error')
    }
  }

  async function handleActivate() {
    if (selectedId === 'new') return
    try {
      const updated = await activateCampaign(selectedId)
      loadDraft(updated)
      onNotify(p.activated, 'success')
    } catch {
      onNotify(p.actionFailed, 'error')
    }
  }

  async function handleDisable() {
    if (selectedId === 'new') return
    try {
      const updated = await disableCampaign(selectedId)
      loadDraft(updated)
      onNotify(p.disabled, 'success')
    } catch {
      onNotify(p.actionFailed, 'error')
    }
  }

  if (isLoading) return <CoinTabLoader />

  const isBusy = isCreating || isUpdating
  const statusUpper = statusDisplay?.toUpperCase()

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <Label className="text-[13px] font-medium text-[#344054]">{p.selectCampaign}</Label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value as string | 'new')}
            className="h-10 w-full rounded-xl border border-[#ececed] bg-white px-3 text-[13px] text-[#101828]"
          >
            <option value="new">{p.newCampaign}</option>
            {(campaigns ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.status})
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-[#ececed] text-[13px]"
          onClick={() => void refetch()}
        >
          {p.refresh}
        </Button>
      </div>

      {(typeDisplay || statusDisplay) && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-[#f4f4f5] px-3 py-1.5 text-[12px] font-medium text-[#344054]">
            {p.type}: {typeDisplay}
          </span>
          {statusDisplay ? (
            <span
              className={cn(
                'rounded-lg px-3 py-1.5 text-[12px] font-semibold',
                statusUpper === 'ACTIVE'
                  ? 'bg-[#ecfdf3] text-[#027a48]'
                  : statusUpper === 'DISABLED'
                    ? 'bg-[#fef3f2] text-[#b42318]'
                    : 'bg-[#f4f4f5] text-[#344054]',
              )}
            >
              {p.status}: {statusDisplay}
            </span>
          ) : null}
        </div>
      )}

      <CoinSection title={p.coreSection}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[13px] font-medium text-[#344054]">{p.code}</Label>
            <Input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#344054]">{p.startsAt}</Label>
            <Input
              type="datetime-local"
              value={toDatetimeLocal(draft.startsAt)}
              onChange={(e) => setDraft({ ...draft, startsAt: fromDatetimeLocal(e.target.value) })}
              className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#344054]">{p.endsAt}</Label>
            <Input
              type="datetime-local"
              value={toDatetimeLocal(draft.endsAt)}
              onChange={(e) => setDraft({ ...draft, endsAt: fromDatetimeLocal(e.target.value) })}
              className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-[#344054]">{p.maxPercent}</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={draft.maxPercent}
              onChange={(e) => setDraft({ ...draft, maxPercent: Number(e.target.value) })}
              className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
            />
          </div>
        </div>
      </CoinSection>

      <CoinSection title={p.discountsSection}>
        <div className="grid gap-4 sm:grid-cols-3">
          {draft.discounts.map((tier, index) => (
            <div key={tier.months} className="space-y-1.5">
              <Label className="text-[13px] font-medium text-[#344054]">
                {p.monthsTier.replace('{months}', String(tier.months))}
              </Label>
              <Input
                type="number"
                min={0}
                max={draft.maxPercent}
                step="0.01"
                value={tier.percent}
                onChange={(e) => {
                  const discounts = [...draft.discounts]
                  discounts[index] = { ...tier, percent: Number(e.target.value) }
                  setDraft({ ...draft, discounts })
                }}
                className="h-10 rounded-xl border-[#ececed] bg-[#fafafa] text-[13px]"
              />
            </div>
          ))}
        </div>
      </CoinSection>

      <CoinSection title={p.pushSection}>
        <div className="flex flex-col gap-6">
          <LocalizedFields
            title={p.pushTitle}
            value={draft.pushTitle}
            onChange={(pushTitle) => setDraft({ ...draft, pushTitle })}
            fieldPrefix="push-title"
          />
          <LocalizedFields
            title={p.pushBody}
            value={draft.pushBody}
            onChange={(pushBody) => setDraft({ ...draft, pushBody })}
            fieldPrefix="push-body"
          />
          <LocalizedFields
            title={p.pushLast12hTitle}
            value={draft.pushLast12hTitle}
            onChange={(pushLast12hTitle) => setDraft({ ...draft, pushLast12hTitle })}
            fieldPrefix="push-last-title"
          />
          <LocalizedFields
            title={p.pushLast12hBody}
            value={draft.pushLast12hBody}
            onChange={(pushLast12hBody) => setDraft({ ...draft, pushLast12hBody })}
            fieldPrefix="push-last-body"
          />
        </div>
      </CoinSection>

      <CoinSaveBar
        onSave={() => void handleSave()}
        isSaving={isBusy}
        savingLabel={p.saving}
        saveLabel={selectedId === 'new' ? p.create : p.save}
        extra={
          selectedId !== 'new' ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={isActivating || statusUpper === 'ACTIVE'}
                onClick={() => void handleActivate()}
                className="h-10 rounded-xl bg-[#00B4CC] px-4 text-[13px] hover:bg-[#00B4CC]/90"
              >
                {isActivating ? p.activating : p.activate}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isDisabling || statusUpper === 'DISABLED'}
                onClick={() => void handleDisable()}
                className="h-10 rounded-xl border-[#ececed] text-[13px]"
              >
                {isDisabling ? p.disabling : p.disable}
              </Button>
            </div>
          ) : null
        }
      />
    </div>
  )
}
