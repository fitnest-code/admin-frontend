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
import { useGymStore } from '@/lib/store/gym-store'

import { useT } from '@/lib/i18n'
import { useResizableColumns } from '@/hooks/use-resizable-columns'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const PER_PAGE = 10

export function GymsList() {
  const t = useT()
  const router = useRouter()
  const deleteGym = useDeleteGym()
  const toggleStatus = useToggleGymStatus()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortValue, setSortValue] = useState<AdminGymSort>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const gyms = gymsQuery.data?.items ?? []
  const total = gymsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const { colWidths, tableRef, handleMouseDown } = useResizableColumns(
    [200, 250, 200, 120],
    [120, 150, 120, 90]
  )

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  })

  function handleToggle(id: number, currentEnabled: boolean) {
    toggleStatus.mutate(
      { id: String(id), enabled: !currentEnabled },
      {
        onSuccess: () => {
          setModalConfig({ isOpen: true, message: t.gyms.statusUpdated, type: "success" })
        },
        onError: () => {
          setModalConfig({ isOpen: true, message: t.gyms.statusUpdateFailed, type: "error" })
        },
      }
    )
  }

  function handleDelete() {
    if (!deleteId) return
    deleteGym.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        setModalConfig({ isOpen: true, message: t.gyms.deleted, type: "success" })
      },
      onError: (error: any) => {
        let msg = error?.message || t.gyms.deleteFailed
        if (error?.response?.data?.error?.details?.dependencies?.length) {
          const deps = error.response.data.error.details.dependencies.map((d: any) => d.reason).join(", ")
          msg = `${t.gyms.cannotDeletePrefix}${deps}`
        } else if (error?.response?.data?.error?.message) {
          msg = error.response.data.error.message
        }
        setModalConfig({ isOpen: true, message: msg, type: "error" })
      },
    })
  }

  const getSortLabel = (val: string) => {
    switch (val) {
      case 'newest': return t.gyms.sortNewest;
      case 'name_asc': return t.gyms.sortNameAsc;
      case 'name_desc': return t.gyms.sortNameDesc;
      case 'deactivated': return t.gyms.sortDeactivated;
      case 'address_asc': return t.gyms.sortAddressAsc;
      default: return val;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-foreground">{t.gyms.title}</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-55 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
            placeholder={t.gyms.searchToolbarPlaceholder}
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
            {t.gyms.sort}
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
                  {getSortLabel(opt.value)}
                  {opt.value === sortValue && <Check size={13} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => {
            useGymStore.getState().resetGym()
            router.push('/gyms/new')
          }}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
        >
          <Plus size={15} />
          {t.gyms.newGym}
        </button>
      </div>

      {/* Table - removed overflow-hidden to prevent dropdown clipping */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: "fixed", minWidth: "750px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col style={{ width: `${colWidths[3]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 text-left">
              <th className="px-4 py-3 text-xs font-bold uppercase text-foreground/80 relative">
                {t.gyms.gymName}
                <div
                  onMouseDown={(e) => handleMouseDown(0, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-foreground/80 relative">
                {t.gyms.address}
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-foreground/80 relative">
                {t.gyms.owner}
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-foreground/80 text-center relative">
                {t.gyms.status}
                <div
                  onMouseDown={(e) => handleMouseDown(3, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase text-foreground/80 text-center">{t.gyms.more}</th>
            </tr>
          </thead>
          <tbody>
            {gymsQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">{t.common.loading}</td>
              </tr>
            ) : gyms.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-sm font-semibold text-foreground mb-4">{t.common.noData}</p>
                  <button
                    onClick={() => {
                      useGymStore.getState().resetGym()
                      router.push('/gyms/new')
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors mx-auto"
                  >
                    <Plus size={15} />
                    {t.gyms.addNewGym}
                  </button>
                </td>
              </tr>
            ) : (
              gyms.map((gym) => (
                <GymRow
                  key={gym.id}
                  gym={gym}
                  onView={() => router.push(`/gyms/${gym.id}`)}
                  onDelete={() => setDeleteId(gym.id)}
                  onToggle={() => handleToggle(gym.id, gym.status === 'ACTIVE')}
                />
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && !gymsQuery.isLoading && (
          <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4 bg-card">
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
        <p className="text-sm text-red-500">{t.gyms.loadFailed}</p>
      )}

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function GymRow({
  gym,
  onView,
  onDelete,
  onToggle,
}: {
  gym: AdminGymListItem
  onView: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const t = useT()

  return (
    <tr 
      onClick={onView}
      className="hover:bg-secondary/40 border-b border-border transition-all duration-200 cursor-pointer"
    >
      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.name}>{gym.name}</span>
      </td>
      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.fullAddress}>{gym.fullAddress}</span>
      </td>
      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.ownerName || ''}>{gym.ownerName || ''}</span>
      </td>
      <td className="px-4 py-3 text-center overflow-hidden">
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <GymStatusToggle active={gym.status === 'ACTIVE'} onToggle={onToggle} />
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {/* Action menu */}
        <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 outline-none"
                aria-label={t.gyms.more}
              >
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[180px] flex flex-col gap-3 rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg">
              <DropdownMenuItem
                onClick={onDelete}
                className="flex w-full items-center gap-2 text-base font-normal text-[#F10303] hover:opacity-70 transition-opacity cursor-pointer focus:bg-transparent px-0 py-0"
              >
                <Trash2 size={16} />
                <span className="leading-none">{t.common.delete}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  )
}
