'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, ChevronDown, Eye, Trash2, Check, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SORT_OPTIONS } from '@/lib/gyms-data'
import { useAdminGymsQuery, useToggleGymStatus, type AdminGymListItem, type AdminGymSort } from '@/modules/gyms'
import { GymStatusToggle } from './gym-status-toggle'
import { ConfirmDeleteModal } from './modals/confirm-delete-modal'
import { useDeleteGym } from '@/lib/query/gym-query'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { toast } from 'sonner'

const PER_PAGE = 10

export function GymsList() {
  const router = useRouter()
  const deleteGym = useDeleteGym()
  const toggleStatus = useToggleGymStatus()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortValue, setSortValue] = useState<AdminGymSort>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const gymsQuery = useAdminGymsQuery({
    query: debouncedQuery || undefined,
    sort: sortValue,
    page: currentPage,
    pageSize: PER_PAGE,
  })

  const sortRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const gyms = gymsQuery.data?.items ?? []
  const total = gymsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  function handleToggle(id: number, currentEnabled: boolean) {
    toggleStatus.mutate(
      { id: String(id), enabled: !currentEnabled },
      {
        onSuccess: () => {
          setShowSuccessModal(true)
        },
        onError: () => {
          toast.error("Statusu yeniləmək mümkün olmadı")
        }
      }
    )
  }

  function handleDelete() {
    if (!deleteId) return
    deleteGym.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        setShowSuccessModal(true)
      },
      onError: (error: any) => {
        toast.error(error?.message || "Zalı silmək mümkün olmadı")
      }
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">Zallar</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-55 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
            placeholder="Zal adı, Şəhər, Ünvan axtar..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((p) => !p)}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-[#00B4CC] hover:text-[#00B4CC]',
              sortOpen && 'border-[#00B4CC] text-[#00B4CC]',
            )}
          >
            Sırala
            <ChevronDown size={14} className={cn('transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <ul className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {SORT_OPTIONS.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => { setSortValue(opt.value as AdminGymSort); setSortOpen(false); setCurrentPage(1) }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                    opt.value === sortValue
                      ? 'bg-[#00B4CC26] text-[#00B4CC] font-medium'
                      : 'text-foreground hover:bg-secondary',
                  )}
                >
                  {opt.label}
                  {opt.value === sortValue && <Check size={13} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => router.push('/gyms/new')}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={15} />
          Yeni zal
        </button>
      </div>

      {/* Table - removed overflow-hidden to prevent dropdown clipping */}
      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_1fr_1fr_6rem_5rem] items-center gap-4 border-b border-border bg-[#00B4CC14] px-4 py-3 rounded-t-xl">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Zal adı</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Ünvan</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Məsul şəxs</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-center">Status</span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider text-right">Ətraflı</span>
        </div>

        {gymsQuery.isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Yüklənir...</div>
        ) : gyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <p className="text-sm font-semibold text-foreground">Məlumat yoxdur</p>
            <button
              onClick={() => router.push('/gyms/new')}
              className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
            >
              <Plus size={15} />
              Yeni Zal Əlavə et
            </button>
          </div>
        ) : (
          <>
            {gyms.map((gym) => (
              <GymRow
                key={gym.id}
                gym={gym}
                openMenuId={openMenuId}
                menuRef={menuRef}
                onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                onView={() => router.push(`/gyms/${gym.id}`)}
                onDelete={() => { setDeleteId(gym.id); setOpenMenuId(null) }}
                onToggle={() => handleToggle(gym.id, gym.status === 'ACTIVE')}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4">
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                      p === currentPage ? 'bg-[#00B4CC] text-white' : 'text-foreground hover:bg-secondary',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {deleteId !== null && (
        <ConfirmDeleteModal
          name={gyms.find((g) => g.id === deleteId)?.name ?? ''}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          isLoading={deleteGym.isPending}
        />
      )}


      {gymsQuery.isError && (
        <p className="text-sm text-red-500">Zal siyahısı yüklənmədi. Yenidən cəhd edin.</p>
      )}

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Status uğurla yeniləndi!"
      />
    </div>
  )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function GymRow({
  gym,
  openMenuId,
  menuRef,
  onToggleMenu,
  onView,
  onDelete,
  onToggle,
}: {
  gym: AdminGymListItem
  openMenuId: number | null
  menuRef: React.RefObject<HTMLDivElement | null>
  onToggleMenu: (id: number) => void
  onView: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const isMenuOpen = openMenuId === gym.id

  return (
    <div 
      className={cn(
        "grid grid-cols-[1fr_1fr_1fr_6rem_5rem] items-center gap-4 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/40 transition-colors relative",
        isMenuOpen ? "z-50 shadow-sm" : "z-0"
      )}
    >
      <span className="text-sm font-medium text-foreground truncate">{gym.name}</span>
      <span className="text-sm text-muted-foreground truncate">{gym.fullAddress || '-'}</span>
      <span className="text-sm text-muted-foreground truncate">{gym.ownerName === 'N/A' ? '-' : gym.ownerName}</span>
      <div className="flex justify-center">
        <GymStatusToggle active={gym.status === 'ACTIVE'} onToggle={onToggle} />
      </div>
      
      {/* Action menu */}
      <div className="relative flex justify-end" ref={isMenuOpen ? menuRef : undefined}>
        <button
          onClick={() => onToggleMenu(gym.id)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
            isMenuOpen ? "bg-secondary text-[#00B4CC]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          aria-label="Ətraflı seçimlər"
          aria-haspopup="true"
          aria-expanded={isMenuOpen}
        >
          <MoreVertical size={20} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-11 z-50 w-[180px] flex flex-col gap-3 rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={onView}
              className="flex w-full items-center gap-2 border-b border-[#ECECED] pb-3 text-base font-normal text-black hover:opacity-70 transition-opacity"
            >
              <Eye size={16} className="text-[#333333]" />
              <span className="leading-none">Detallı bax</span>
            </button>
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 text-base font-normal text-[#F10303] hover:opacity-70 transition-opacity"
            >
              <Trash2 size={16} />
              <span className="leading-none">Sil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
