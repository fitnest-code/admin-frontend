'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Search, Plus, X, Users, TicketPercent, CalendarDays } from 'lucide-react'
import { useSubscriptionPackages } from '@/lib/query/use-subscription-packages'
import {
  type PromoCampaignStatus,
  useCreatePromoCampaign,
  usePromoCampaigns,
  usePromoCampaignSummary,
} from '@/lib/query/use-promo-campaigns'

const statusLabels: Record<PromoCampaignStatus, string> = {
  DRAFT: 'Qaralama', SCHEDULED: 'Planlaşdırılmış', ACTIVE: 'Aktiv',
  PAUSED: 'Dayandırılıb', ENDED: 'Bitib', EXPIRED: 'Müddəti bitib',
}

const statusStyle: Record<PromoCampaignStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', SCHEDULED: 'bg-blue-50 text-blue-700', ACTIVE: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700', ENDED: 'bg-slate-100 text-slate-600', EXPIRED: 'bg-rose-50 text-rose-700',
}

function number(value?: number | null) {
  return new Intl.NumberFormat('az-AZ').format(value ?? 0)
}

function date(value: string) {
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

export function PromoCodesTab({ createRequested = false, onCreateOpenChange }: { createRequested?: boolean; onCreateOpenChange?: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PromoCampaignStatus | undefined>()
  const [showCreate, setShowCreate] = useState(false)
  const { data: summary, isLoading: summaryLoading } = usePromoCampaignSummary()
  const { data, isLoading } = usePromoCampaigns(search, status)
  const campaigns = data?.content ?? []

  useEffect(() => {
    if (createRequested) setShowCreate(true)
  }, [createRequested])

  function setCreate(open: boolean) {
    setShowCreate(open)
    onCreateOpenChange?.(open)
  }

  return <>
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Aktiv kampaniyalar" value={summary?.activeCampaigns} loading={summaryLoading} icon={<TicketPercent size={20} />} hint="Hazırda aktiv olanlar" />
        <Metric title="Uyğun istifadəçilər" value={summary?.eligibleNumbers} loading={summaryLoading} icon={<Users size={20} />} hint="Bütün aktiv kampaniyalar" />
        <Metric title="İstifadə olunan kodlar" value={summary?.redeemedLast30Days} loading={summaryLoading} icon={<TicketPercent size={20} />} hint="Son 30 gün" />
        <Metric title="Verilən endirim" value={`${number(summary?.discountGivenLast30Days)} ₼`} loading={summaryLoading} icon={<CalendarDays size={20} />} hint="Son 30 gün" />
      </section>

      <section className="rounded-xl border border-[#ECECED] bg-white p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md"><Search className="absolute left-3 top-3 text-[#94979C]" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kampaniya adı və ya promo kod üzrə axtar" className="h-11 w-full rounded-lg border border-[#ECECED] pl-10 pr-3 text-sm outline-none focus:border-[#00B4CC]" /></div>
          <div className="flex flex-wrap gap-2">
            <select value={status ?? ''} onChange={(e) => setStatus((e.target.value || undefined) as PromoCampaignStatus | undefined)} className="h-11 rounded-lg border border-[#ECECED] bg-white px-3 text-sm"><option value="">Bütün statuslar</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
            <button type="button" onClick={() => { setSearch(''); setStatus(undefined) }} className="h-11 rounded-lg border border-[#ECECED] px-4 text-sm">Təmizlə</button>
            <button type="button" onClick={() => setCreate(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00B4CC] px-4 text-sm font-medium text-white"><Plus size={18} />Yeni kampaniya</button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-y border-[#ECECED] text-[#667085]"><tr><th className="py-3 font-medium">Kampaniya</th><th className="py-3 font-medium">Promo kod</th><th className="py-3 font-medium">Tarix</th><th className="py-3 font-medium">Auditoriya</th><th className="py-3 font-medium">İstifadə</th><th className="py-3 font-medium">Status</th></tr></thead><tbody>
          {isLoading && <tr><td colSpan={6} className="py-10 text-center text-[#667085]">Yüklənir…</td></tr>}
          {!isLoading && campaigns.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[#667085]">Kampaniya tapılmadı.</td></tr>}
          {campaigns.map((campaign) => <tr key={campaign.id} className="border-b border-[#F2F4F7]"><td className="py-4 font-medium text-[#101828]"><div>{campaign.name}</div><div className="mt-1 text-xs font-normal text-[#667085]">{campaign.partnerName ?? 'FitNest'}</div></td><td className="py-4"><span className="rounded bg-[#E6F8FA] px-2 py-1 font-mono text-xs font-semibold text-[#007E91]">{campaign.code}</span><div className="mt-1 text-xs text-[#667085]">{campaign.discountType === 'PERCENT' ? `${campaign.discountValue}% endirim` : `${campaign.discountValue} ₼ endirim`}</div></td><td className="py-4 text-[#475467]">{date(campaign.startsAt)}<span className="mx-1">—</span>{date(campaign.endsAt)}</td><td className="py-4 text-[#475467]">{campaign.audienceType === 'ALL_USERS' ? 'Bütün istifadəçilər' : campaign.audienceType === 'NEW_USERS' ? 'Yeni istifadəçilər' : 'Yüklənmiş siyahı'}</td><td className="py-4 text-[#475467]">{number(campaign.redeemedCount)} / {campaign.totalLimit ? number(campaign.totalLimit) : '∞'}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[campaign.status] ?? statusStyle.DRAFT}`}>{statusLabels[campaign.status] ?? campaign.status}</span></td></tr>)}
        </tbody></table></div>
      </section>
    </div>
    {showCreate && <CreatePromoCampaignModal onClose={() => setCreate(false)} />}
  </>
}

function Metric({ title, value, hint, icon, loading }: { title: string; value?: number | string | null; hint: string; icon: React.ReactNode; loading: boolean }) {
  return <div className="rounded-xl border border-[#ECECED] bg-white p-4"><div className="flex items-center justify-between text-sm font-medium text-[#344054]"><span>{title}</span><span className="rounded-lg bg-[#E6F8FA] p-2 text-[#00B4CC]">{icon}</span></div><div className="mt-3 text-2xl font-bold text-[#101828]">{loading ? '—' : typeof value === 'number' ? number(value) : value ?? '0'}</div><p className="mt-1 text-xs text-[#667085]">{hint}</p></div>
}

function CreatePromoCampaignModal({ onClose }: { onClose: () => void }) {
  const { data: plans = [] } = useSubscriptionPackages()
  const create = useCreatePromoCampaign()
  const [error, setError] = useState('')
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', code: '', discountType: 'PERCENT' as const, discountValue: '20', audienceType: 'ALL_USERS' as const, startsAt: '', endsAt: '', totalLimit: '', popupTitle: '', popupBody: '', imageUrl: '' })
  const valid = form.name.trim().length >= 3 && form.code.trim().length >= 4 && selectedPlans.length > 0 && form.startsAt && form.endsAt && form.popupTitle.trim() && form.popupBody.trim() && form.imageUrl.trim()
  const togglePlan = (id: string) => setSelectedPlans((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!valid) { setError('Zəhmət olmasa, bütün məcburi sahələri doldurun.'); return }; setError(''); try { await create.mutateAsync({ name: form.name.trim(), code: form.code.trim().toUpperCase(), discountType: form.discountType, discountValue: Number(form.discountValue), audienceType: form.audienceType, planIds: selectedPlans, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(), usesPerUser: 1, totalLimit: form.totalLimit ? Number(form.totalLimit) : undefined, firstPaymentOnly: true, allowFitcoin: true, allowInstallments: true, includeExistingUsers: true, translations: [{ locale: 'az', popupTitle: form.popupTitle, popupBody: form.popupBody, ctaLabel: 'Planlara bax' }], popup: { ctaTarget: 'PLANS', imageUrl: form.imageUrl, durationSec: 7 } }); onClose() } catch (e) { setError(e instanceof Error ? e.message : 'Kampaniya yaradılmadı.') } }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Yeni promo kampaniya</h2><p className="mt-1 text-sm text-[#667085]">Kampaniya əvvəlcə qaralama kimi yaradılır; yoxladıqdan sonra yayımlayın.</p></div><button type="button" onClick={onClose} aria-label="Bağla" className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Kampaniya adı *"><input value={form.name} onChange={(e) => update('name', e.target.value)} maxLength={120} placeholder="Bakcell 20%" /></Field><Field label="Promo kod *"><input value={form.code} onChange={(e) => update('code', e.target.value.replace(/[^a-z0-9]/gi, ''))} maxLength={16} placeholder="BAKCELL20" /></Field><Field label="Endirim növü *"><select value={form.discountType} onChange={(e) => update('discountType', e.target.value)}><option value="PERCENT">Faiz (%)</option><option value="FIXED">Sabit məbləğ (₼)</option></select></Field><Field label="Endirim dəyəri *"><input type="number" min="1" max={form.discountType === 'PERCENT' ? 100 : undefined} value={form.discountValue} onChange={(e) => update('discountValue', e.target.value)} /></Field><Field label="Başlama tarixi *"><input type="datetime-local" value={form.startsAt} onChange={(e) => update('startsAt', e.target.value)} /></Field><Field label="Bitmə tarixi *"><input type="datetime-local" value={form.endsAt} onChange={(e) => update('endsAt', e.target.value)} /></Field><Field label="Auditoriya *"><select value={form.audienceType} onChange={(e) => update('audienceType', e.target.value)}><option value="ALL_USERS">Bütün istifadəçilər</option><option value="NEW_USERS">Yeni istifadəçilər</option><option value="UPLOADED_LIST">Yüklənmiş siyahı</option></select></Field><Field label="Ümumi istifadə limiti"><input type="number" min="1" value={form.totalLimit} onChange={(e) => update('totalLimit', e.target.value)} placeholder="Limitsiz" /></Field></div><div className="mt-5"><p className="mb-2 text-sm font-medium text-[#344054]">Tətbiq ediləcək planlar *</p><div className="grid gap-2 sm:grid-cols-3">{plans.map((plan) => <label key={plan.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#ECECED] p-3 text-sm"><input type="checkbox" checked={selectedPlans.includes(String(plan.id))} onChange={() => togglePlan(String(plan.id))} />{plan.name}</label>)}</div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="AZ popup başlığı *"><input value={form.popupTitle} onChange={(e) => update('popupTitle', e.target.value)} maxLength={40} placeholder="Bakcell-ə özəl 20%" /></Field><Field label="Banner/popup şəkil URL-i *"><input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} placeholder="https://..." /></Field><div className="sm:col-span-2"><Field label="AZ popup mətni *"><textarea value={form.popupBody} onChange={(e) => update('popupBody', e.target.value)} maxLength={180} placeholder="Ödənişdə sənə özəl promokodu seç..." /></Field></div></div>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="h-11 rounded-lg border border-[#D0D5DD] px-5 text-sm">Ləğv et</button><button disabled={create.isPending} type="submit" className="h-11 rounded-lg bg-[#00B4CC] px-5 text-sm font-medium text-white disabled:opacity-50">{create.isPending ? 'Yaradılır…' : 'Qaralama yarat'}</button></div></form></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-[#344054]"><span className="mb-1.5 block">{label}</span><div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#D0D5DD] [&_input]:px-3 [&_input]:text-sm [&_select]:h-11 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-[#D0D5DD] [&_select]:bg-white [&_select]:px-3 [&_textarea]:min-h-20 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#D0D5DD] [&_textarea]:p-3 [&_textarea]:text-sm">{children}</div></label> }
