'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Pencil, X, Plus, Trash2, ChevronDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymLocationQuery, useGymReservationRulesQuery } from '@/modules/gyms'
import type { Gym, WorkingHour, GenderType } from '@/lib/gyms-data'
import { EditFieldModal } from '../modals/edit-field-modal'

interface GymInfoTabProps {
  gym: Gym
  gymId: string
  isNew?: boolean
}

type Lang = 'Az' | 'Ru' | 'En'

// OpenStreetMap Nominatim (pulsuz) – Azərbaycan daxilində axtarış
interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const MAP_EMBED_BASE = 'https://www.openstreetmap.org/export/embed.html'

const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'mixed',       label: 'Ümumi zal'      },
  { value: 'men-only',    label: 'Yalnız kişilər'  },
  { value: 'women-only',  label: 'Yalnız qadınlar' },
]

const IMAGE_NAME_OPTIONS = [
  'SPA', 'Hovuz', 'Fitness', 'Sauna', 'Dərs zalı',
  'Kardio', 'Ştanq zalı', 'Duş otağı', 'Resepşn',
]

export function GymInfoTab({ gym, gymId, isNew = false }: GymInfoTabProps) {
  const [lang, setLang]               = useState<Lang>('Az')
  const [name, setName]               = useState(gym.name)
  const [about, setAbout]             = useState(gym.about)
  const [phone, setPhone]             = useState(gym.phone)
  const [email, setEmail]             = useState(gym.email)
  const [address, setAddress]         = useState(gym.address)
  const [location, setLocation]       = useState<{ lat: number; lon: number } | null>(null)
  const [searchQuery, setSearchQuery]  = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching]      = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const [genderType, setGenderType]   = useState<GenderType>(gym.genderType)
  const [hours, setHours]             = useState<WorkingHour[]>(gym.workingHours)
  const [activeDay, setActiveDay]     = useState(0)
  const [coverImage, setCoverImage]   = useState<string | null>(gym.coverImage ?? null)
  const [galleryImages, setGalleryImages] = useState<{ url: string; name: string }[]>(
    gym.images.slice(0, 9).map((url) => ({ url, name: '' })),
  )
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [editField, setEditField] = useState<{ key: string; label: string; value: string; multiline?: boolean } | null>(null)
  const locationQuery = useGymLocationQuery(gymId)
  const reservationRulesQuery = useGymReservationRulesQuery(gymId)

  const coverRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!locationQuery.data) return
    setAddress(locationQuery.data.addressText)
    setLocation({
      lat: locationQuery.data.latitude,
      lon: locationQuery.data.longitude,
    })
  }, [locationQuery.data])

  // Nominatim – yalnız Azərbaycan, rayon və ya ünvan (Nəsimi / Ali Mustafayev 55)
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        format: 'json',
        limit: '8',
        addressdetails: '0',
        countrycodes: 'az',
        viewbox: '44.7,41.9,50.6,38.4',
        bounded: '0',
      })
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { 'Accept-Language': 'az,en', 'User-Agent': 'FitNestAdmin/1.0 (Contact)' },
      })
      const data = (await res.json()) as NominatimResult[]
      setSearchResults(Array.isArray(data) ? data : [])
      setShowSuggestions(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(searchQuery)
      searchTimeoutRef.current = null
    }, 1200)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery, fetchSuggestions])

  function selectPlace(place: NominatimResult) {
    setAddress(place.display_name)
    setLocation({ lat: Number(place.lat), lon: Number(place.lon) })
    setSearchQuery('')
    setSearchResults([])
    setShowSuggestions(false)
  }

  const delta = 0.04
  const mapEmbedUrl = location
    ? `${MAP_EMBED_BASE}?bbox=${encodeURIComponent([location.lon - delta, location.lat - delta, location.lon + delta, location.lat + delta].join(','))}&layer=mapnik&marker=${encodeURIComponent([location.lat, location.lon].join(','))}`
    : 'https://www.openstreetmap.org/export/embed.html?bbox=49.7%2C40.35%2C50.0%2C40.45&layer=mapnik'

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImage(URL.createObjectURL(file))
  }

  function handleGalleryAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || galleryImages.length >= 9) return
    const url = URL.createObjectURL(file)
    setGalleryImages((prev) => [...prev, { url, name: '' }])
    e.target.value = ''
  }

  function handleRemoveGallery(idx: number) {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleGalleryRename(idx: number, name: string) {
    setGalleryImages((prev) => prev.map((item, i) => i === idx ? { ...item, name } : item))
  }

  function handleGalleryReplace(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setGalleryImages((prev) => prev.map((item, i) => i === idx ? { ...item, url } : item))
    e.target.value = ''
  }

  function handleEditSave(key: string, value: string) {
    if (key === 'name')  setName(value)
    if (key === 'about') setAbout(value)
    setEditField(null)
  }

  // ── Working hours helpers ──────────────────────────────────────────────────
  function updateSlot(dayIdx: number, slotId: string, field: 'open' | 'close', val: string) {
    setHours((prev) =>
      prev.map((h, i) =>
        i === dayIdx
          ? { ...h, slots: h.slots.map((s) => (s.id === slotId ? { ...s, [field]: val } : s)) }
          : h,
      ),
    )
  }

  function addSlot(dayIdx: number) {
    setHours((prev) =>
      prev.map((h, i) =>
        i === dayIdx
          ? { ...h, slots: [...h.slots, { id: String(h.slots.length + 1), open: '12:00', close: '18:00' }] }
          : h,
      ),
    )
  }

  function removeSlot(dayIdx: number, slotId: string) {
    setHours((prev) =>
      prev.map((h, i) =>
        i === dayIdx
          ? { ...h, slots: h.slots.filter((s) => s.id !== slotId) }
          : h,
      ),
    )
  }

  const activeDayData = hours[activeDay]

  return (
    <div className="flex flex-col gap-8 py-6">

      {/* ── Zal məlumatları ───────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Zal məlumatları</h2>
          {/* Language switcher */}
          <div className="flex items-center gap-1">
            {(['Az', 'Ru', 'En'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-semibold transition-colors',
                  lang === l
                    ? 'bg-[#00B4CC] text-white'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Zal adı */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Zal adı</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Zal adı"
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        {/* Haqqında */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Haqqında</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Haqqında"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>
      </section>

      {/* ── Zal şəkilləri ────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Zal şəkilləri</h2>

        {/* Cover image */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Cover Şəkil</label>
          <input ref={coverRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleCoverUpload} />
          {coverImage ? (
            <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-xl border border-border">
              <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
              <button
                onClick={() => setCoverImage(null)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => coverRef.current?.click()}
              className="flex h-40 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:border-[#00B4CC] transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Upload size={18} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground">Upload cover</span>
            </button>
          )}
          <span className="text-[10px] text-muted-foreground">JPG or PNG • Max size 2MB</span>
        </div>

        {/* Gallery: dynamic items + add button */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Digər şəkillər ({galleryImages.length}/9)
          </label>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleGalleryAdd}
          />
          <div className="flex flex-wrap gap-2">
            {galleryImages.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1" style={{ width: 100 }}>
                <GallerySlot
                  image={item.url}
                  index={idx}
                  onReplace={handleGalleryReplace}
                  onRemove={handleRemoveGallery}
                />
                <ImageNameDropdown
                  value={item.name}
                  onChange={(v) => handleGalleryRename(idx, v)}
                />
              </div>
            ))}
            {galleryImages.length < 9 && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex aspect-square w-[100px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-card hover:border-[#00B4CC] hover:bg-[#00B4CC]/5 transition-colors group"
                aria-label="Şəkil əlavə et"
              >
                <Plus size={20} className="text-muted-foreground group-hover:text-[#00B4CC] transition-colors" />
                <span className="text-[10px] text-muted-foreground group-hover:text-[#00B4CC] transition-colors">Əlavə et</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── İş saatları ──────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">İş saatları</h2>

        {/* Gender toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGenderType(opt.value)}
              className={cn(
                'rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
                genderType === opt.value
                  ? 'bg-[#00B4CC] border-[#00B4CC] text-white'
                  : 'border-border text-muted-foreground hover:border-[#00B4CC] hover:text-[#00B4CC]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Day chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {hours.map((h, i) => (
            <button
              key={h.day}
              onClick={() => setActiveDay(i)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                activeDay === i
                  ? 'border-[#00B4CC] bg-[#00B4CC]/10 text-[#00B4CC]'
                  : 'border-border text-muted-foreground hover:border-[#00B4CC] hover:text-[#00B4CC]',
              )}
            >
              {h.shortDay}
            </button>
          ))}
        </div>

        {/* Active day slots */}
        {activeDayData && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            {/* Day header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{activeDayData.day}</p>
                <p className="text-xs text-muted-foreground">
                  {activeDayData.slots.length} ayrı saat aralığı
                </p>
              </div>
              <button
                onClick={() => addSlot(activeDay)}
                className="flex items-center gap-1 rounded-lg bg-[#00B4CC] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#008799] transition-colors"
              >
                <Plus size={12} />
                Əlavə et
              </button>
            </div>

            {/* Time slot rows */}
            <div className="flex flex-col gap-2">
              {activeDayData.slots.map((slot, si) => (
                <div key={slot.id} className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                  <span className="w-6 text-xs font-medium text-muted-foreground shrink-0">{si + 1}</span>
                  <input
                    type="time"
                    value={slot.open}
                    onChange={(e) => updateSlot(activeDay, slot.id, 'open', e.target.value)}
                    className="w-24 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground outline-none focus:border-[#00B4CC] transition-colors"
                  />
                  <span className="text-muted-foreground text-sm">—</span>
                  <input
                    type="time"
                    value={slot.close}
                    onChange={(e) => updateSlot(activeDay, slot.id, 'close', e.target.value)}
                    className="w-24 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground outline-none focus:border-[#00B4CC] transition-colors"
                  />
                  <div className="flex-1" />
                  {activeDayData.slots.length > 1 && (
                    <button
                      onClick={() => removeSlot(activeDay, slot.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                      aria-label="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Əlaqə ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Əlaqə</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Telefon nömrəsi</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+994 00 000 00 00"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">E-Poçt</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asss@gmail.com"
              type="email"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* ── Ünvan + Xəritə (OpenStreetMap Nominatim – Azərbaycan, pulsuz) ─── */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Ünvan</label>
          <div className="relative">
            <input
              value={searchQuery || address}
              onChange={(e) => {
                const v = e.target.value
                setSearchQuery(v)
                if (!v) {
                  setShowSuggestions(false)
                  setAddress('')
                  setLocation(null)
                } else if (!searchResults.length) {
                  setAddress(v)
                }
              }}
              onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Rayon (Nəsimi) və ya ünvan (Nəsimi, Ali Mustafayev 55)"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-[#00B4CC] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {searching ? <span className="text-[10px]">...</span> : <MapPin size={14} aria-hidden />}
            </span>
            {showSuggestions && searchResults.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-lg"
              >
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectPlace(place)
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-foreground hover:bg-[#00B4CC]/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {place.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Yalnız Azərbaycan daxilində axtarış. Rayon (ümumi) və ya küçə/ünvan (xüsusi) yazıb seçə bilərsiniz. (OpenStreetMap – pulsuz)
          </p>
        </div>
        {location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-[#00B4CC]" />
            Xəritədə seçilmiş yer göstərilir
          </p>
        )}
        <div className="h-96 w-full overflow-hidden rounded-xl border border-border">
          <iframe
            key={mapEmbedUrl}
            src={mapEmbedUrl}
            className="h-full w-full"
            title="Ünvan xəritəsi"
            loading="lazy"
            sandbox="allow-scripts"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Rezervasiya qaydaları</h3>
          {reservationRulesQuery.isLoading ? (
            <p className="mt-2 text-xs text-muted-foreground">Qaydalar yüklənir...</p>
          ) : reservationRulesQuery.isError ? (
            <p className="mt-2 text-xs text-red-500">Qaydalar yüklənmədi.</p>
          ) : (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>
                Rezervasiya tələb olunur:{' '}
                <span className="font-medium text-foreground">
                  {reservationRulesQuery.data?.reservation_required ? 'Bəli' : 'Xeyr'}
                </span>
              </p>
              <p>
                Gündə max rezervasiya:{' '}
                <span className="font-medium text-foreground">
                  {reservationRulesQuery.data?.rules?.max_reservations_per_day ?? '-'}
                </span>
              </p>
              <p>
                Ləğv limiti (dəq):{' '}
                <span className="font-medium text-foreground">
                  {reservationRulesQuery.data?.rules?.cancel_before_minutes ?? '-'}
                </span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Yaradılma tarixi ─────────────────────────────────── */}
      {!isNew && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Yaradılma tarixi</span>
          <div className="rounded-lg border border-border bg-card px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">{gym.createdAt}</span>
          </div>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────���─────── */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Yadda saxla
        </button>
      </div>

      {/* Edit field modal */}
      {editField && (
        <EditFieldModal
          label={editField.label}
          value={editField.value}
          multiline={editField.multiline}
          onSave={(v) => handleEditSave(editField.key, v)}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  )
}

// ─── Gallery slot ─────────────────────────────────────────────────────────────

function GallerySlot({
  image, index, onReplace, onRemove,
}: {
  image: string
  index: number
  onReplace: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (idx: number) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => onReplace(index, e)} />
      <img src={image} alt={`Şəkil ${index + 1}`} className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity bg-black/30">
        <button onClick={() => fileRef.current?.click()} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-foreground hover:bg-white transition-colors">
          <Pencil size={10} />

        </button>
        <button onClick={() => onRemove(index)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors">
          <X size={10} />
        </button>
      </div>
    </div>
  )
}

// ─── Image name dropdown ──────────────────────────────────────────────────────

function ImageNameDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]     = useState(false)
  const [custom, setCustom] = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)

  // close on outside click
  useState(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  })

  function select(opt: string) {
    if (opt === '__custom__') {
      setCustom(true)
      setOpen(false)
    } else {
      onChange(opt)
      setCustom(false)
      setOpen(false)
    }
  }

  if (custom) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setCustom(false)}
        placeholder="Ad yaz..."
        className="w-full rounded border border-[#00B4CC] bg-card px-1.5 py-1 text-[9px] text-foreground outline-none"
      />
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded border border-border bg-card px-1.5 py-1 text-[9px] text-foreground hover:border-[#00B4CC] transition-colors"
      >
        <span className={cn('truncate', !value && 'text-muted-foreground')}>
          {value || 'Ad (mas: SPA)'}
        </span>
        <ChevronDown size={8} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-0.5 w-32 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
          {IMAGE_NAME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={cn(
                'block w-full px-2 py-1.5 text-left text-[10px] hover:bg-secondary transition-colors',
                value === opt ? 'text-[#00B4CC] font-semibold' : 'text-foreground',
              )}
            >
              {opt}
            </button>
          ))}
          <button
            type="button"
            onClick={() => select('__custom__')}
            className="block w-full border-t border-border px-2 py-1.5 text-left text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
          >
            + Digər...
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Editable display field ───────────────────────────────────────────────────

function EditableDisplayField({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="text-sm text-foreground truncate">{value}</span>
        <button onClick={onEdit} className="ml-2 shrink-0 text-muted-foreground hover:text-[#00B4CC] transition-colors" aria-label={`${label} redaktə et`}>
          <Pencil size={13} />
        </button>
      </div>
    </div>
  )
}
