'use client'

import { useState, useRef } from 'react'
import {
  User, Bell, CreditCard, Shield, Building2,
  Eye, EyeOff, Plus, Trash2, ChevronDown, Check,
  Camera, Upload, Globe, GripVertical, Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'profile',       label: 'Profil',            icon: User       },
  { key: 'website',       label: 'Sayt məzmunu',       icon: Globe      },
  { key: 'company',       label: 'Şirkət məlumatları', icon: Building2  },
  { key: 'notifications', label: 'Bildirişlər',        icon: Bell       },
  { key: 'payment',       label: 'Ödəniş',             icon: CreditCard },
  { key: 'roles',         label: 'Rollar',             icon: Shield     },
] as const

type TabKey = typeof TABS[number]['key']

// ─── Roles data ───────────────────────────────────────────────────────────────

const PERMISSIONS = [
  'Müştərilər',
  'Zallar',
  'Ödənişlər',
  'Abunəlik',
  'Hesabatlar',
  'Reytinqlər',
  'Mağazalar',
  'Tənzimləmələr',
] as const

const INITIAL_ROLES = [
  { id: 'r1', name: 'Super Admin', perms: new Set(PERMISSIONS)                                              },
  { id: 'r2', name: 'Admin',       perms: new Set(['Müştərilər','Zallar','Ödənişlər','Abunəlik','Hesabatlar','Reytinqlər','Mağazalar'] as const) },
  { id: 'r3', name: 'Mühasib',     perms: new Set(['Ödənişlər','Hesabatlar'] as const)                      },
  { id: 'r4', name: 'Dəstək',      perms: new Set(['Müştərilər','Reytinqlər'] as const)                     },
]

type PermName = typeof PERMISSIONS[number]

interface Role { id: string; name: string; perms: Set<PermName> }

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  return (
    <div className="flex flex-col gap-5 pb-10">
      <h1 className="text-xl font-bold text-foreground">Tənzimləmələr</h1>

      <div className="flex gap-6">
        {/* Left tab list */}
        <nav className="flex w-52 shrink-0 flex-col gap-1" aria-label="Tənzimləmələr bölmələri">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-left transition-colors',
                  active
                    ? 'bg-[#00B4CC] text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} className="shrink-0" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile'       && <ProfileTab />}
          {activeTab === 'website'       && <WebsiteTab />}
          {activeTab === 'company'       && <CompanyTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'payment'       && <PaymentTab />}
          {activeTab === 'roles'         && <RolesTab />}
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
      {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
    />
  )
}

function SaveButton({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
      >
        Yadda saxla
      </button>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
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

// ─── 1. Profile tab ───────────────────────────────────────────────────────────

function ProfileTab() {
  const [name,        setName]        = useState('Admin Sahibi')
  const [email,       setEmail]       = useState('admin@fitnest.az')
  const [phone,       setPhone]       = useState('+994 50 000 00 00')
  const [avatar,      setAvatar]      = useState<string | null>(null)
  const [oldPass,     setOldPass]     = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showOld,     setShowOld]     = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConf,    setShowConf]    = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-4">
      <Section title="Şəxsi məlumatlar">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-secondary flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                : <span className="text-lg font-bold text-[#00B4CC]">AS</span>}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#00B4CC] text-white hover:bg-[#008799] transition-colors"
              aria-label="Avatar dəyiş"
            >
              <Camera size={10} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatar(URL.createObjectURL(f)) }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ad Soyad">
            <TextInput value={name} onChange={setName} placeholder="Ad Soyad" />
          </Field>
          <Field label="Telefon">
            <TextInput value={phone} onChange={setPhone} placeholder="+994 00 000 00 00" />
          </Field>
        </div>
        <Field label="Email">
          <TextInput value={email} onChange={setEmail} placeholder="email@domain.com" type="email" />
        </Field>
        <SaveButton />
      </Section>

      <Section title="Şifrə dəyiş">
        <Field label="Köhnə şifrə">
          <div className="relative">
            <input type={showOld ? 'text' : 'password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00B4CC] transition-colors" />
            <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showOld ? 'Gizlət' : 'Göstər'}>
              {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Yeni şifrə">
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00B4CC] transition-colors" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Təkrar şifrə">
            <div className="relative">
              <input type={showConf ? 'text' : 'password'} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00B4CC] transition-colors" />
              <button onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
        </div>
        <SaveButton />
      </Section>
    </div>
  )
}

// ─── 2b. Website content tab ─────────────────────────────────────────────────

type MediaType = 'image' | 'video' | 'gif'

interface HeroMedia { type: MediaType; url: string }

interface HowSection {
  id: string
  title: string
  body: string
  imageUrl: string | null
}

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'image', label: 'Şəkil (JPG/PNG)' },
  { value: 'video', label: 'Video (MP4)'      },
  { value: 'gif',   label: 'GIF'              },
]

function WebsiteTab() {
  const [heroMedia,    setHeroMedia]    = useState<HeroMedia | null>(null)
  const [mediaType,    setMediaType]    = useState<MediaType>('video')
  const [heroTitle,    setHeroTitle]    = useState('Sağlamlığa gedən yol — FitNest')
  const [heroSubtitle, setHeroSubtitle] = useState('FitNest istifadəçilərə yaxınlıqdakı fitness mərkəzlərini tapmaq, uyğun abunə seçmək və QR sistemi ilə məşqə başlamaq imkanı yaradır.')
  const [sections,     setSections]     = useState<HowSection[]>([
    { id: 's1', title: 'QR kodu oxudun və məşqə başlayın.', body: 'Zallarımızda yerləşdirilmiş xüsusi QR kodları Fitnest mobil tətbiqindən oxudaraq gediş\'inizi təsdiqləyin.', imageUrl: null },
  ])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const heroFileRef = useRef<HTMLInputElement>(null)
  const logoRef     = useRef<HTMLInputElement>(null)

  function handleHeroFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroMedia({ type: mediaType, url: URL.createObjectURL(file) })
    e.target.value = ''
  }

  function addSection() {
    setSections((p) => [...p, { id: `s${Date.now()}`, title: '', body: '', imageUrl: null }])
  }

  function removeSection(id: string) {
    setSections((p) => p.filter((s) => s.id !== id))
  }

  function updateSection(id: string, field: keyof Omit<HowSection, 'id'>, value: string | null) {
    setSections((p) => p.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  function handleSectionImage(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    updateSection(id, 'imageUrl', URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Logo ── */}
      <Section title="Logo">
        <input ref={logoRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoUrl(URL.createObjectURL(f)) }} />
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-32 items-center justify-center rounded-xl border border-border bg-secondary overflow-hidden">
            {logoUrl
              ? <img src={logoUrl} alt="Logo önizləmə" className="max-h-full max-w-full object-contain p-2" />
              : <span className="text-xs text-muted-foreground">Logo yoxdur</span>}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => logoRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-[#00B4CC] hover:text-[#00B4CC] transition-colors">
              <Upload size={14} /> Logo yüklə
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl(null)} className="text-xs text-red-500 hover:text-red-600 transition-colors">
                Sil
              </button>
            )}
          </div>
        </div>
        <SaveButton />
      </Section>

      {/* ── Hero section ── */}
      <Section title="Hero bölməsi (saytın yuxarı hissəsi)">

        {/* Media type selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Media növü</label>
          <div className="flex gap-2">
            {MEDIA_TYPES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMediaType(m.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  mediaType === m.value
                    ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-[#00B4CC]'
                    : 'border-border text-muted-foreground hover:border-[#00B4CC]/50',
                )}
              >
                <Film size={12} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Arxa fon {mediaType === 'video' ? 'video' : mediaType === 'gif' ? 'GIF' : 'şəkil'}
          </label>
          <input
            ref={heroFileRef}
            type="file"
            accept={mediaType === 'video' ? 'video/mp4,video/webm' : mediaType === 'gif' ? 'image/gif' : 'image/jpeg,image/png'}
            className="hidden"
            onChange={handleHeroFile}
          />

          {heroMedia ? (
            <div className="relative overflow-hidden rounded-xl border border-border bg-black" style={{ aspectRatio: '16/5' }}>
              {heroMedia.type === 'video'
                ? <video src={heroMedia.url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                : <img src={heroMedia.url} alt="Hero arxa fon" className="h-full w-full object-cover" />}
              <div className="absolute inset-0 bg-black/40 flex items-end p-4 gap-2">
                <button
                  onClick={() => heroFileRef.current?.click()}
                  className="rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30 transition-colors"
                >
                  Dəyiş
                </button>
                <button
                  onClick={() => setHeroMedia(null)}
                  className="rounded-lg bg-red-500/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600/80 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => heroFileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:border-[#00B4CC] hover:bg-[#00B4CC]/5 transition-colors"
              style={{ aspectRatio: '16/5' }}
            >
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {mediaType === 'video' ? 'MP4 / WebM yüklə' : mediaType === 'gif' ? 'GIF yüklə' : 'JPG / PNG yüklə'}
              </span>
              <span className="text-xs text-muted-foreground">Klikləyin və ya sürüşdürün</span>
            </button>
          )}
        </div>

        {/* Hero texts */}
        <Field label="Əsas başlıq">
          <TextInput value={heroTitle} onChange={setHeroTitle} placeholder="Sağlamlığa gedən yol — FitNest" />
        </Field>
        <Field label="Alt mətn">
          <textarea
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            rows={3}
            placeholder="Saytı təsvir edən qısa cümlə..."
            className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors leading-relaxed"
          />
        </Field>
        <SaveButton />
      </Section>

      {/* ── "Necə İşləyir" sections ── */}
      <Section title='"Necə İşləyir?" bölmələri'>
        <div className="flex flex-col gap-4">
          {sections.map((sec, idx) => (
            <HowSectionCard
              key={sec.id}
              section={sec}
              index={idx}
              onUpdate={updateSection}
              onRemove={removeSection}
              onImageUpload={handleSectionImage}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 self-start rounded-lg border border-dashed border-[#00B4CC] px-4 py-2 text-sm font-medium text-[#00B4CC] hover:bg-[#00B4CC]/5 transition-colors"
        >
          <Plus size={14} /> Yeni bölmə əlavə et
        </button>
        <SaveButton />
      </Section>
    </div>
  )
}

function HowSectionCard({
  section, index, onUpdate, onRemove, onImageUpload,
}: {
  section: HowSection
  index: number
  onUpdate: (id: string, field: keyof Omit<HowSection, 'id'>, value: string | null) => void
  onRemove: (id: string) => void
  onImageUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const imgRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex gap-4">
      {/* Drag handle + number */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <GripVertical size={14} className="text-muted-foreground cursor-grab" />
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00B4CC] text-[10px] font-bold text-white">
          {index + 1}
        </span>
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-3">
        <Field label="Başlıq">
          <TextInput
            value={section.title}
            onChange={(v) => onUpdate(section.id, 'title', v)}
            placeholder="QR kodu oxudun və məşqə başlayın."
          />
        </Field>
        <Field label="Mətn">
          <textarea
            value={section.body}
            onChange={(e) => onUpdate(section.id, 'body', e.target.value)}
            rows={3}
            placeholder="Bu bölmənin izahat mətni..."
            className="resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors leading-relaxed"
          />
        </Field>
      </div>

      {/* Image upload */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(section.id, e)} />
        <button
          type="button"
          onClick={() => imgRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-card hover:border-[#00B4CC] transition-colors group"
          aria-label="Bölmə şəkli yüklə"
        >
          {section.imageUrl ? (
            <img src={section.imageUrl} alt={`Bölmə ${index + 1} şəkli`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={16} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
              <span className="text-[9px] text-muted-foreground group-hover:text-[#00B4CC] transition-colors">Şəkil</span>
            </div>
          )}
        </button>
        {section.imageUrl && (
          <button
            type="button"
            onClick={() => onUpdate(section.id, 'imageUrl', null)}
            className="text-[10px] text-red-500 hover:text-red-600 transition-colors"
          >
            Sil
          </button>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(section.id)}
        className="self-start rounded-lg border border-border p-1.5 text-muted-foreground hover:border-red-400 hover:text-red-500 transition-colors"
        aria-label="Bölməni sil"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ─── 3. Company tab ───────────────────────────────────────────────────────────

function CompanyTab() {
  const [companyName, setCompanyName] = useState('FitNest')
  const [about,       setAbout]       = useState('FitNest — Azərbaycanın ən böyük fitnes idarəetmə platformasıdır.')
  const [address,     setAddress]     = useState('Bakı, Nərimanov r., Əliağa Vahid küç. 14')
  const [phone,       setPhone]       = useState('+994 12 000 00 00')
  const [email,       setEmail]       = useState('info@fitnest.az')
  const [website,     setWebsite]     = useState('https://fitnest.az')
  const [instagram,   setInstagram]   = useState('@fitnest.az')
  const [facebook,    setFacebook]    = useState('fitnest.az')

  return (
    <div className="flex flex-col gap-4">
      <Section title="Şirkət haqqında">
        <Field label="Şirkət adı">
          <TextInput value={companyName} onChange={setCompanyName} placeholder="FitNest" />
        </Field>
        <Field label="Haqqında mətni">
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4}
            placeholder="Şirkət haqqında qısa məlumat..."
            className="resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors leading-relaxed" />
        </Field>
        <SaveButton />
      </Section>

      <Section title="Əlaqə məlumatları">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ünvan">
            <TextInput value={address} onChange={setAddress} placeholder="Şəhər, küçə..." />
          </Field>
          <Field label="Telefon">
            <TextInput value={phone} onChange={setPhone} placeholder="+994 00 000 00 00" />
          </Field>
          <Field label="Email">
            <TextInput value={email} onChange={setEmail} placeholder="info@domain.com" type="email" />
          </Field>
          <Field label="Vebsayt">
            <TextInput value={website} onChange={setWebsite} placeholder="https://..." />
          </Field>
        </div>
        <SaveButton />
      </Section>

      <Section title="Sosial şəbəkələr">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Instagram">
            <TextInput value={instagram} onChange={setInstagram} placeholder="@username" />
          </Field>
          <Field label="Facebook">
            <TextInput value={facebook} onChange={setFacebook} placeholder="page-name" />
          </Field>
        </div>
        <SaveButton />
      </Section>
    </div>
  )
}

// ─── 4. Notifications tab ────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { key: 'new_customer',   label: 'Yeni müştəri qeydiyyatı',     group: 'Müştərilər'  },
  { key: 'customer_bday',  label: 'Müştəri ad günü',              group: 'Müştərilər'  },
  { key: 'payment_done',   label: 'Ödəniş uğurla tamamlandı',     group: 'Ödənişlər'   },
  { key: 'payment_fail',   label: 'Ödəniş uğursuz oldu',          group: 'Ödənişlər'   },
  { key: 'sub_expire',     label: 'Abunəlik bitmək üzrədir',      group: 'Abunəlik'    },
  { key: 'new_review',     label: 'Yeni reytinq/şərh daxil oldu', group: 'Reytinqlər'  },
  { key: 'low_rating',     label: 'Aşağı reytinq alındı',         group: 'Reytinqlər'  },
  { key: 'system_update',  label: 'Sistem yeniləməsi',            group: 'Sistem'      },
]

function NotificationsTab() {
  const [states, setStates] = useState<Record<string, { push: boolean; email: boolean }>>(
    Object.fromEntries(NOTIF_ITEMS.map((i) => [i.key, { push: true, email: false }])),
  )

  const groups = [...new Set(NOTIF_ITEMS.map((i) => i.group))]

  function toggle(key: string, channel: 'push' | 'email') {
    setStates((s) => ({ ...s, [key]: { ...s[key], [channel]: !s[key][channel] } }))
  }

  return (
    <Section title="Bildiriş parametrləri">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_80px_80px] border-b border-border bg-secondary px-4 py-2.5">
          <span className="text-xs font-semibold text-foreground">Bildiriş</span>
          <span className="text-center text-xs font-semibold text-foreground">Push</span>
          <span className="text-center text-xs font-semibold text-foreground">Email</span>
        </div>
        {groups.map((group) => (
          <div key={group}>
            <div className="bg-[#00B4CC]/5 px-4 py-1.5 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00B4CC]">{group}</span>
            </div>
            {NOTIF_ITEMS.filter((i) => i.group === group).map((item) => (
              <div key={item.key} className="grid grid-cols-[1fr_80px_80px] items-center border-b border-border px-4 py-3 last:border-0">
                <span className="text-sm text-foreground">{item.label}</span>
                <div className="flex justify-center">
                  <Toggle checked={states[item.key].push}  onChange={() => toggle(item.key, 'push')}  />
                </div>
                <div className="flex justify-center">
                  <Toggle checked={states[item.key].email} onChange={() => toggle(item.key, 'email')} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <SaveButton />
    </Section>
  )
}

// ─── 5. Payment tab ──────────────────────────────────────────────────────────

const CURRENCIES = ['AZN', 'USD', 'EUR', 'TRY', 'RUB']
const PAYMENT_METHODS = [
  { key: 'cash',    label: 'Nağd ödəniş'   },
  { key: 'card',    label: 'Bank kartı'     },
  { key: 'online',  label: 'Onlayn ödəniş' },
  { key: 'qr',      label: 'QR ödəniş'     },
  { key: 'wallet',  label: 'Elektron cüzdan'},
]

function PaymentTab() {
  const [currency,     setCurrency]     = useState('AZN')
  const [currOpen,     setCurrOpen]     = useState(false)
  const [taxRate,      setTaxRate]      = useState('18')
  const [methods,      setMethods]      = useState(new Set(['cash', 'card']))
  const [invoicePrefix, setInvoicePrefix] = useState('FN-')

  function toggleMethod(key: string) {
    setMethods((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Ödəniş parametrləri">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Valyuta">
            <div className="relative">
              <button
                onClick={() => setCurrOpen(!currOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
              >
                {currency}
                <ChevronDown size={14} className={cn('transition-transform', currOpen && 'rotate-180')} />
              </button>
              {currOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  {CURRENCIES.map((c) => (
                    <button key={c} onClick={() => { setCurrency(c); setCurrOpen(false) }}
                      className={cn('flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-secondary transition-colors',
                        currency === c ? 'text-[#00B4CC] font-semibold' : 'text-foreground')}>
                      {c}
                      {currency === c && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="ƏDV dərəcəsi (%)">
            <TextInput value={taxRate} onChange={setTaxRate} placeholder="18" type="number" />
          </Field>
        </div>
        <Field label="Faktura prefiksi">
          <TextInput value={invoicePrefix} onChange={setInvoicePrefix} placeholder="FN-" />
        </Field>
        <SaveButton />
      </Section>

      <Section title="Ödəniş metodları">
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((m) => (
            <label key={m.key}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors',
                methods.has(m.key) ? 'border-[#00B4CC] bg-[#00B4CC]/5' : 'border-border bg-card hover:border-[#00B4CC]/50',
              )}>
              <span className="text-sm font-medium text-foreground">{m.label}</span>
              <Toggle checked={methods.has(m.key)} onChange={() => toggleMethod(m.key)} />
            </label>
          ))}
        </div>
        <SaveButton />
      </Section>
    </div>
  )
}

// ─── 6. Roles tab ─────────────────────────────────────────────────────────────

function RolesTab() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [newRoleName, setNewRoleName] = useState('')

  function togglePerm(roleId: string, perm: PermName) {
    setRoles((prev) => prev.map((r) => {
      if (r.id !== roleId) return r
      const next = new Set(r.perms)
      next.has(perm) ? next.delete(perm) : next.add(perm)
      return { ...r, perms: next }
    }))
  }

  function addRole() {
    const name = newRoleName.trim()
    if (!name) return
    setRoles((prev) => [...prev, { id: `r${Date.now()}`, name, perms: new Set() }])
    setNewRoleName('')
  }

  function removeRole(id: string) {
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <Section title="Rol və icazə idarəsi">
      {/* Add role */}
      <div className="flex gap-2">
        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRole()}
          placeholder="Yeni rol adı..."
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
        />
        <button
          onClick={addRole}
          disabled={!newRoleName.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-40 transition-colors"
        >
          <Plus size={14} /> Əlavə et
        </button>
      </div>

      {/* Permission matrix */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground w-36">İcazə</th>
              {roles.map((r) => (
                <th key={r.id} className="px-3 py-2.5 text-center text-xs font-semibold text-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <span>{r.name}</span>
                    {r.name !== 'Super Admin' && (
                      <button onClick={() => removeRole(r.id)} className="text-red-400 hover:text-red-600 transition-colors" aria-label={`${r.name} rolunu sil`}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm, pi) => (
              <tr key={perm} className={cn('border-b border-border last:border-0', pi % 2 === 0 ? 'bg-card' : 'bg-secondary/40')}>
                <td className="px-4 py-2.5 text-xs font-medium text-foreground">{perm}</td>
                {roles.map((r) => (
                  <td key={r.id} className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => r.name !== 'Super Admin' && togglePerm(r.id, perm)}
                      disabled={r.name === 'Super Admin'}
                      aria-label={`${r.name} — ${perm}`}
                      aria-pressed={r.perms.has(perm)}
                      className={cn(
                        'mx-auto flex h-5 w-5 items-center justify-center rounded transition-colors',
                        r.perms.has(perm)
                          ? 'bg-[#00B4CC] text-white'
                          : 'border border-border bg-background text-transparent hover:border-[#00B4CC]',
                        r.name === 'Super Admin' && 'cursor-default',
                      )}
                    >
                      <Check size={11} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SaveButton />
    </Section>
  )
}
