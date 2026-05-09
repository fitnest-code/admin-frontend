'use client'

import { useState, useRef, useEffect } from 'react'
import { Trash2, Check, X, ChevronDown, Search, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGymReviewsQuery } from '@/modules/gyms'
import { MOCK_REVIEWS, type Review, type ReviewStatus } from '@/lib/gyms-data'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending:  'Gözləmədir',
  approved: 'Təsdiq edildi',
  rejected: 'Rədd edildi',
}

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending:  'bg-amber-50  text-amber-600  border border-amber-200',
  approved: 'bg-green-50  text-green-700  border border-green-200',
  rejected: 'bg-red-50    text-red-500    border border-red-200',
}

const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Tarixa (yeni → köhnə)' },
  { value: 'date-asc',    label: 'Tarix (Köhnə → yeni)' },
  { value: 'rating-desc', label: 'Reytinq (yüksək → aşağı)' },
  { value: 'rating-asc',  label: 'Reytinq (aşağı → yüksək)' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all',      label: 'Bütün statuslar', color: '#4B5563' },
  { value: 'approved', label: 'Təsdiq edilmiş',  color: '#16a34a' },
  { value: 'pending',  label: 'Gözləmə',         color: '#d97706' },
  { value: 'rejected', label: 'Rədd edilmiş',    color: '#ef4444' },
]

interface Props {
  /** When provided, only shows reviews for this gym. When absent, shows all reviews (global page). */
  gymId?: string
}

export function ReviewsTab({ gymId }: Props) {
  const isGlobal = !gymId
  const gymReviewsQuery = useGymReviewsQuery(gymId ?? '', { page: 1, page_size: 50 })
  const initial  = gymId
    ? MOCK_REVIEWS.filter((r) => r.gymId === gymId)
    : MOCK_REVIEWS

  const [reviews, setReviews]       = useState<Review[]>(initial)
  const [query, setQuery]           = useState('')
  const [statusFilter, setStatus]   = useState<string>('all')
  const [sortBy, setSortBy]         = useState<string>('date-desc')
  const [selected, setSelected]     = useState<Review | null>(null)
  const [showSort, setShowSort]     = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const sortRef   = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current   && !sortRef.current.contains(e.target as Node))   setShowSort(false)
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatus(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!gymId || !gymReviewsQuery.data?.items) return
    setReviews(gymReviewsQuery.data.items)
  }, [gymId, gymReviewsQuery.data?.items])

  function approve(id: string) {
    setReviews((p) => p.map((r) => r.id === id ? { ...r, status: 'approved' } : r))
    if (selected?.id === id) setSelected((p) => p ? { ...p, status: 'approved' } : p)
  }

  function reject(id: string) {
    setReviews((p) => p.map((r) => r.id === id ? { ...r, status: 'rejected' } : r))
    if (selected?.id === id) setSelected((p) => p ? { ...p, status: 'rejected' } : p)
  }

  function remove(id: string) {
    setReviews((p) => p.filter((r) => r.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = reviews
    .filter((r) => {
      const matchQuery  = r.userName.toLowerCase().includes(query.toLowerCase())
        || r.comment.toLowerCase().includes(query.toLowerCase())
        || (isGlobal && r.gymName.toLowerCase().includes(query.toLowerCase()))
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchQuery && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc')   return b.date.localeCompare(a.date)
      if (sortBy === 'date-asc')    return a.date.localeCompare(b.date)
      if (sortBy === 'rating-desc') return b.rating - a.rating
      if (sortBy === 'rating-asc')  return a.rating - b.rating
      return 0
    })

  const activeStatusLabel = STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'Bütün statuslar'
  const activeSortLabel   = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sırala'

  // grid template: global = user | gym | date | rating | status | actions
  //               per-gym = user | date | rating | status | actions
  const gridCols = isGlobal
    ? 'grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_0.5fr]'
    : 'grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr]'

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isGlobal ? 'Ad/Soyad, Zal adı, şərh...' : 'Ad/Soyad, şərh...'}
            className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors"
          />
        </div>

        {/* Status filter */}
        <div ref={statusRef} className="relative">
          <button
            onClick={() => { setShowStatus((p) => !p); setShowSort(false) }}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
          >
            <span className="max-w-[140px] truncate">{activeStatusLabel}</span>
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
          {showStatus && (
            <div className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[180px] rounded-xl border border-border bg-card shadow-lg py-1">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatus(opt.value); setShowStatus(false) }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-4 py-2 text-sm hover:bg-secondary transition-colors',
                    statusFilter === opt.value ? 'text-[#00B4CC] font-medium' : 'text-foreground',
                  )}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: opt.color }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => { setShowSort((p) => !p); setShowStatus(false) }}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-[#00B4CC] transition-colors"
          >
            <span className="max-w-[180px] truncate">{activeSortLabel}</span>
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
          {showSort && (
            <div className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[220px] rounded-xl border border-border bg-card shadow-lg py-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-secondary transition-colors',
                    sortBy === opt.value ? 'text-[#00B4CC] font-medium' : 'text-foreground',
                  )}
                >
                  {opt.label}
                  {sortBy === opt.value && <Check size={13} className="text-[#00B4CC]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className={cn('grid items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3', gridCols)}>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">İstifadəçi</span>
          {isGlobal && <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Zal adı</span>}
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Tarix</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Reytinq</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Status</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-right">Detallı</span>
        </div>

        {gymId && gymReviewsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            Reytinqlər yüklənir...
          </div>
        ) : gymId && gymReviewsQuery.isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-red-500">
            Reytinqlər yüklənmədi
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Star size={28} className="opacity-30" />
            Reytinq tapılmadı
          </div>
        ) : (
          filtered.map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              isGlobal={isGlobal}
              gridCols={gridCols}
              onSelect={setSelected}
              onApprove={approve}
              onReject={reject}
              onDelete={remove}
            />
          ))
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <ReviewDetailModal
          review={selected}
          onClose={() => setSelected(null)}
          onApprove={() => approve(selected.id)}
          onReject={() => reject(selected.id)}
        />
      )}
    </div>
  )
}

/* ── Review row ──────────────────────────────────────────────────────────── */
function ReviewRow({
  review, isGlobal, gridCols, onSelect, onApprove, onReject, onDelete,
}: {
  review: Review
  isGlobal: boolean
  gridCols: string
  onSelect:  (r: Review) => void
  onApprove: (id: string) => void
  onReject:  (id: string) => void
  onDelete:  (id: string) => void
}) {
  return (
    <div
      className={cn('grid items-center gap-4 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/30 transition-colors')}
    >
      {/* User */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B4CC26] text-xs font-bold text-[#00B4CC]">
          {review.userName[0]}
        </div>
        <span className="text-sm font-medium text-foreground truncate">{review.userName}</span>
      </div>

      {/* Gym name (global only) */}
      {isGlobal && (
        <span className="text-sm text-foreground truncate">{review.gymName}</span>
      )}

      {/* Date */}
      <span className="text-sm text-muted-foreground">{review.date}</span>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Status badge */}
      <div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight', STATUS_STYLES[review.status])}>
          {STATUS_LABELS[review.status]}
        </span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onSelect(review)}
          className="p-1.5 text-muted-foreground hover:text-[#00B4CC] transition-colors"
          title="Detallı bax"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={() => onDelete(review.id)}
          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
          title="Sil"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

/* ── Star rating ─────────────────────────────────────────────────────────── */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'}
        />
      ))}
    </div>
  )
}

/* ── Detail modal ────────────────────────────────────────────────────────── */
function ReviewDetailModal({
  review, onClose, onApprove, onReject,
}: {
  review: Review
  onClose:   () => void
  onApprove: () => void
  onReject:  () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00B4CC26] text-sm font-bold text-[#00B4CC]">
              {review.userName[0]}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{review.userName}</span>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size={13} />
                <span className="text-xs text-muted-foreground">{review.gymName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Bağla"
          >
            <X size={16} />
          </button>
        </div>

        {/* Status */}
        <div className="px-5 pb-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[review.status])}>
            {STATUS_LABELS[review.status]}
          </span>
        </div>

        {/* Comment */}
        <div className="px-5 pb-5">
          <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            onClick={() => { onReject(); onClose() }}
            className="rounded-lg border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Rədd et
          </button>
          <button
            onClick={() => { onApprove(); onClose() }}
            className="rounded-lg bg-[#00B4CC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  )
}
