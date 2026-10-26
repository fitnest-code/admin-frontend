'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Save, ChevronLeft } from 'lucide-react'
import { apiGet, apiPost, apiPut } from '@/lib/api/client'
import { useSubscriptionPackages } from '@/lib/query/use-subscription-packages'
import { useI18nStore } from '@/lib/i18n'

type Locale = 'az' | 'en' | 'ru'
type Content = { heading: string; subtitle: string; specialOffersTitle: string; bannerImageUrl: string; darkBannerImageUrl: string; iconUrl: string; darkIconUrl: string; imageAlt: string }
type Campaign = { id: string; code: string; name: string; enabled: boolean; startsAt: string | null; endsAt: string | null; packageIds: number[]; durationMonths: number[]; content: Partial<Record<Locale, Content>>; version: number }
const emptyContent: Content = { heading: '', subtitle: '', specialOffersTitle: '', bannerImageUrl: '', darkBannerImageUrl: '', iconUrl: '', darkIconUrl: '', imageAlt: '' }
const control = 'w-full rounded-lg border border-[#DDE2E3] bg-white px-3 py-2.5 text-sm text-[#273B3A] outline-none focus:border-[#00B4CC]'
const labels = {
  az: { title: 'Mobil plan bannerləri', description: 'Plan seçimi ekranı üçün məzmun. Yalnız hesabında 055 və ya 099 nömrəsi olan istifadəçilərə göstərilir.', edit: 'Məzmunu idarə et', enabled: 'Aktiv', disabled: 'Deaktiv', back: 'Bannerlərə qayıt', save: 'Yadda saxla', saved: 'Dəyişikliklər saxlanıldı.', saving: 'Saxlanılır…', unavailable: 'Bannerlər yüklənmədi.', retry: 'Yenidən yoxla', name: 'Kampaniya adı', starts: 'Başlama tarixi', ends: 'Bitmə tarixi', baku: 'Bakı vaxtı', heading: 'Təklif başlığı', subtitle: 'Təklif mətni', offers: 'Xüsusi təkliflər başlığı', alt: 'Şəkil təsviri', banner: 'Banner şəkli', darkBanner: 'Qaranlıq rejim banneri', icon: 'İkon', darkIcon: 'Qaranlıq rejim ikonu', upload: 'Şəkil yüklə', packages: 'Paketlər', all: 'Bütün paketlər', months: 'Tətbiq olunan aylar', visibility: 'Banneri göstər', note: 'Bu məzmun ödəniş qiymətini dəyişmir. Bannerin göstərilməsi üçün tarixləri və AZ məzmununu tamamlayın.', preview: 'Önizləmə', empty: 'Banner şəkli əlavə edin', imageError: 'Şəkil yüklənmədi. URL-i yoxlayın.', imageHint: 'PNG, JPEG və ya WebP, maksimum 8 MB. Banner üçün tövsiyə: 987 × 432.', invalidImage: 'PNG, JPEG və ya WebP seçin, maksimum 8 MB.', version: 'Məzmun versiyası' },
  en: { title: 'Mobile plan banners', description: 'Content for the plan selection screen. Visible only to accounts with a 055 or 099 phone number.', edit: 'Manage content', enabled: 'Enabled', disabled: 'Disabled', back: 'Back to banners', save: 'Save changes', saved: 'Changes saved.', saving: 'Saving…', unavailable: 'Could not load banners.', retry: 'Retry', name: 'Campaign name', starts: 'Starts at', ends: 'Ends at', baku: 'Baku time', heading: 'Offer heading', subtitle: 'Offer text', offers: 'Special offers heading', alt: 'Image description', banner: 'Banner image', darkBanner: 'Dark mode banner', icon: 'Icon', darkIcon: 'Dark mode icon', upload: 'Upload image', packages: 'Packages', all: 'All packages', months: 'Eligible durations', visibility: 'Show banner', note: 'This content does not change checkout prices. Set the dates and complete AZ content before enabling.', preview: 'Preview', empty: 'Add a banner image', imageError: 'Image could not load. Check the URL.', imageHint: 'PNG, JPEG or WebP, up to 8 MB. Recommended banner size: 987 × 432.', invalidImage: 'Choose PNG, JPEG or WebP, up to 8 MB.', version: 'Content version' },
  ru: { title: 'Баннеры выбора плана', description: 'Контент экрана выбора плана. Только для аккаунтов с номерами 055 или 099.', edit: 'Управлять контентом', enabled: 'Включён', disabled: 'Выключен', back: 'К баннерам', save: 'Сохранить', saved: 'Изменения сохранены.', saving: 'Сохранение…', unavailable: 'Не удалось загрузить баннеры.', retry: 'Повторить', name: 'Название кампании', starts: 'Начало', ends: 'Окончание', baku: 'Время Баку', heading: 'Заголовок предложения', subtitle: 'Текст предложения', offers: 'Заголовок специальных предложений', alt: 'Описание изображения', banner: 'Изображение баннера', darkBanner: 'Баннер тёмной темы', icon: 'Иконка', darkIcon: 'Иконка тёмной темы', upload: 'Загрузить изображение', packages: 'Пакеты', all: 'Все пакеты', months: 'Доступные сроки', visibility: 'Показать баннер', note: 'Этот контент не меняет цену оплаты. Перед включением задайте даты и заполните AZ контент.', preview: 'Предпросмотр', empty: 'Добавьте изображение баннера', imageError: 'Изображение не загрузилось. Проверьте URL.', imageHint: 'PNG, JPEG или WebP до 8 МБ. Рекомендуемый размер: 987 × 432.', invalidImage: 'Выберите PNG, JPEG или WebP до 8 МБ.', version: 'Версия контента' },
}

function wallTime(value: string | null) {
  if (!value) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value))
  const p = (type: string) => parts.find((part) => part.type === type)?.value
  return `${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}`
}

export function PlanCampaignPanel() {
  const locale = useI18nStore((state) => state.locale).toLowerCase() as Locale
  const t = labels[locale] ?? labels.az
  const query = useQuery({ queryKey: ['plan-campaigns-v2'], queryFn: () => apiGet<Campaign[]>('/api/v2/admin/plan-campaigns') })
  const [selected, setSelected] = useState<string | null>(null)
  const campaign = query.data?.find((item) => item.id === selected)
  if (query.isLoading) return <p className="py-12 text-center text-sm text-[#8A9694]">…</p>
  if (query.isError) return <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{t.unavailable}<button onClick={() => query.refetch()} className="ml-4 underline">{t.retry}</button></div>
  if (campaign) return <PlanCampaignForm key={campaign.id} campaign={campaign} t={t} onBack={() => setSelected(null)} />
  return <section className="rounded-xl border border-[#E4E7E7] bg-white p-6"><h2 className="text-lg font-medium">{t.title}</h2><p className="mt-2 text-sm text-[#8A9694]">{t.description}</p><div className="mt-6 space-y-3">{query.data?.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E4E7E7] p-5"><div><p className="font-medium text-[#273B3A]">{item.name}</p><p className="mt-1 text-xs text-[#8A9694]">{item.code} · {t.version} {item.version}</p></div><div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1 text-xs ${item.enabled ? 'bg-[#E7FAFD] text-[#00A6BC]' : 'bg-slate-100 text-slate-500'}`}>{item.enabled ? t.enabled : t.disabled}</span><button onClick={() => setSelected(item.id)} className="rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm text-white">{t.edit}</button></div></div>)}</div></section>
}

function PlanCampaignForm({ campaign, t, onBack }: { campaign: Campaign; t: typeof labels.az; onBack: () => void }) {
  const queryClient = useQueryClient()
  const packages = useSubscriptionPackages()
  const [form, setForm] = useState(campaign)
  const [startsAt, setStartsAt] = useState(wallTime(campaign.startsAt))
  const [endsAt, setEndsAt] = useState(wallTime(campaign.endsAt))
  const [language, setLanguage] = useState<Locale>('az')
  const [dark, setDark] = useState(false)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const content = { ...emptyContent, ...form.content[language] }
  function updateContent(key: keyof Content, value: string) {
    setMessage(''); setForm((old) => ({ ...old, content: { ...old.content, [language]: { ...emptyContent, ...old.content[language], [key]: value } } }))
  }
  async function upload(key: keyof Content, file?: File) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError(t.invalidImage); return }
    setError(''); setUploading(key)
    const body = new FormData(); body.append('file', file)
    try { const result = await apiPost<{ url: string }>('/api/v2/admin/plan-campaigns/images', body); updateContent(key, result.url) }
    catch (e) { setError(e instanceof Error ? e.message : t.imageError) }
    finally { setUploading(null) }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setPending(true)
    try {
      const result = await apiPut<Campaign>(`/api/v2/admin/plan-campaigns/${form.id}`, {
        version: form.version, name: form.name, enabled: form.enabled,
        startsAt: startsAt ? `${startsAt}:00+04:00` : null, endsAt: endsAt ? `${endsAt}:00+04:00` : null,
        packageIds: form.packageIds ?? [], durationMonths: form.durationMonths, content: form.content,
      })
      setForm(result); setMessage(t.saved); await queryClient.invalidateQueries({ queryKey: ['plan-campaigns-v2'] })
    } catch (e) { setError(e instanceof Error ? e.message : 'Error') }
    finally { setPending(false) }
  }
  const previewImage = dark ? content.darkBannerImageUrl || content.bannerImageUrl : content.bannerImageUrl
  return <div className="mx-auto w-full max-w-[1120px] text-[#273B3A]">
    <button onClick={onBack} className="mb-4 flex items-center gap-1 text-sm text-[#667085]"><ChevronLeft size={16} />{t.back}</button>
    <form onSubmit={save} className="rounded-xl border border-[#E4E7E7] bg-white p-6">
      <h2 className="text-lg font-medium">{form.name}</h2><p className="mt-2 text-sm text-[#8A9694]">{t.description}</p>
      <div className="mt-6 grid gap-5 border-t border-[#ECEFEF] pt-6 sm:grid-cols-2">
        <Field label={t.name}><input className={control} required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />{t.visibility} <span className="rounded bg-[#E7FAFD] px-2 py-1 text-xs text-[#00A6BC]">055 / 099</span></label>
        <Field label={`${t.starts} (${t.baku})`}><input className={control} type="datetime-local" required={form.enabled} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></Field>
        <Field label={`${t.ends} (${t.baku})`}><input className={control} type="datetime-local" required={form.enabled} min={startsAt} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></Field>
      </div>
      <div className="mt-6 border-t border-[#ECEFEF] pt-6"><Field label={t.packages}><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setForm({ ...form, packageIds: [] })} className={`rounded-md border px-3 py-2 text-xs ${!form.packageIds?.length ? 'border-[#78DEEB] bg-[#E7FAFD] text-[#00A6BC]' : ''}`}>{t.all}</button>{packages.data?.map((pkg) => <label key={pkg.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs"><input type="checkbox" checked={form.packageIds?.includes(pkg.id) ?? false} onChange={() => setForm({ ...form, packageIds: form.packageIds?.includes(pkg.id) ? form.packageIds.filter((id) => id !== pkg.id) : [...(form.packageIds ?? []), pkg.id] })} />{pkg.name}</label>)}</div></Field><div className="mt-5"><Field label={t.months}><div className="flex gap-2">{[1, 3, 6, 9, 12].map((months) => <label key={months} className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs"><input type="checkbox" checked={form.durationMonths.includes(months)} onChange={() => setForm({ ...form, durationMonths: form.durationMonths.includes(months) ? form.durationMonths.filter((value) => value !== months) : [...form.durationMonths, months] })} />{months}</label>)}</div></Field></div></div>
      <div className="mt-6 border-t border-[#ECEFEF] pt-6"><div className="mb-5 flex gap-2">{(['az', 'en', 'ru'] as const).map((locale) => <button type="button" key={locale} onClick={() => setLanguage(locale)} className={`rounded-md border px-4 py-2 text-sm ${language === locale ? 'border-[#78DEEB] bg-[#E7FAFD] text-[#00A6BC]' : 'border-[#DFE5E5] text-[#8A9694]'}`}>{locale.toUpperCase()}</button>)}</div>
        <div className="grid gap-5 sm:grid-cols-2"><Field label={t.heading}><input className={control} maxLength={160} value={content.heading} onChange={(e) => updateContent('heading', e.target.value)} /></Field><Field label={t.offers}><input className={control} maxLength={80} value={content.specialOffersTitle} onChange={(e) => updateContent('specialOffersTitle', e.target.value)} /></Field><Field label={t.subtitle}><textarea className={`${control} min-h-20`} maxLength={300} value={content.subtitle} onChange={(e) => updateContent('subtitle', e.target.value)} /></Field><Field label={t.alt}><input className={control} maxLength={240} value={content.imageAlt} onChange={(e) => updateContent('imageAlt', e.target.value)} /></Field></div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">{([['bannerImageUrl', t.banner], ['darkBannerImageUrl', t.darkBanner], ['iconUrl', t.icon], ['darkIconUrl', t.darkIcon]] as Array<[keyof Content, string]>).map(([key, label]) => <Field key={key} label={label}><input className={control} type="url" value={content[key] ?? ''} placeholder="https://…" onChange={(e) => updateContent(key, e.target.value)} /><label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-[#00A6BC]"><ImagePlus size={16} />{uploading === key ? '…' : t.upload}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploading)} onChange={(e) => { upload(key, e.target.files?.[0]); e.target.value = '' }} /></label></Field>)}</div>
        <p className="mt-3 text-xs text-[#8A9694]">{t.imageHint}</p>
      </div>
      <div className="mt-6 border-t border-[#ECEFEF] pt-6"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-medium">{t.preview}</h3><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />Dark</label></div><div className={`max-w-md rounded-2xl border p-4 ${dark ? 'border-slate-800 bg-[#030712] text-white' : 'border-[#ECECED] bg-[#F2F3F8]'}`}>
        {previewImage ? <img key={previewImage} src={previewImage} alt={content.imageAlt} className="aspect-[987/432] w-full rounded-xl object-cover" /> : <div className="flex aspect-[987/432] items-center justify-center rounded-xl border border-dashed text-sm text-[#8A9694]">{t.empty}</div>}
        <div className="mt-5 flex items-center gap-3">{(dark ? content.darkIconUrl || content.iconUrl : content.iconUrl) && <img src={dark ? content.darkIconUrl || content.iconUrl : content.iconUrl} alt="" className="h-8 w-8 object-contain" />}<div><p className="text-sm font-semibold">{content.heading}</p><p className="mt-1 text-xs opacity-60">{content.subtitle}</p></div></div><p className="mt-5 text-sm font-medium">{content.specialOffersTitle}</p>
      </div></div>
      <p className="mt-5 text-sm text-[#8A9694]">{t.note}</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-emerald-600">{message}</p>}
      <div className="mt-5 flex justify-end"><button disabled={pending || Boolean(uploading)} className="inline-flex items-center gap-2 rounded-lg bg-[#00B4CC] px-5 py-3 text-sm text-white disabled:opacity-50"><Save size={16} />{pending ? t.saving : t.save}</button></div>
    </form>
  </div>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div role="group" aria-label={label} className="block"><span className="mb-2 block text-sm font-medium">{label}</span>{children}</div> }
