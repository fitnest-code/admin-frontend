'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Plus, ChevronDown, Trash2, Check, MoreVertical, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SORT_OPTIONS } from '@/lib/gyms-data'
import { useAdminGymsQuery, useToggleGymStatus, type AdminGymListItem, type AdminGymSort } from '@/modules/gyms'
import { getAdminGyms, getGymAdminDetails } from '@/modules/gyms/api/gyms.service'
import { GymStatusToggle } from './gym-status-toggle'
import { ConfirmDeleteModal } from './modals/confirm-delete-modal'
import { ExportGymsModal, type ExportFormat, type ExportScope } from './modals/export-gyms-modal'
import { useDeleteGym } from '@/lib/query/gym-query'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
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

function extractGymCategories(g: AdminGymListItem, details?: any) {
  let mainCat = '-'
  let subCatsStr = '-'

  if (details) {
    if (details.mainCategories && details.mainCategories.length > 0) {
      mainCat = details.mainCategories.map((c: any) => c.name).join(', ')
    } else if (details.category?.name) {
      mainCat = details.category.name
    } else if (details.categoryName) {
      mainCat = details.categoryName
    } else if (details.categories && details.categories.length > 0) {
      mainCat = details.categories[0].name
    } else if (details.descriptions && details.descriptions.length > 0) {
      mainCat = details.descriptions[0].categoryName
    }

    if (details.subCategories && details.subCategories.length > 0) {
      subCatsStr = details.subCategories.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ')
    } else if (details.subCategory?.name) {
      subCatsStr = details.subCategory.name
    } else if (details.categories && details.categories.length > 1) {
      subCatsStr = details.categories.slice(1).map((c: any) => c.name).join(', ')
    } else if (details.descriptions && details.descriptions.length > 1) {
      subCatsStr = details.descriptions.slice(1).map((d: any) => d.categoryName).filter(Boolean).join(', ')
    }
  }

  if (mainCat === '-' || !mainCat) {
    mainCat = (g as any).mainCategoryName || (g as any).categoryName || '-'
  }
  if (subCatsStr === '-' || !subCatsStr) {
    if ((g as any).subCategoryName) {
      subCatsStr = (g as any).subCategoryName
    } else if (Array.isArray((g as any).subCategories) && (g as any).subCategories.length > 0) {
      subCatsStr = (g as any).subCategories.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ')
    }
  }

  return {
    mainCat: mainCat || '-',
    subCats: subCatsStr || '-',
  }
}

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

  // Selection states
  const [selected, setSelected] = useState<Map<number, AdminGymListItem>>(new Map())
  const [isSelectingAll, setIsSelectingAll] = useState(false)

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  })

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

  // Clear selections when page or search/sort filters change
  useEffect(() => {
    setSelected(new Map())
  }, [currentPage, debouncedQuery, sortValue])

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

  const allOnPage = gyms.length > 0 && gyms.every((gym) => selected.has(gym.id))
  const selectedList = Array.from(selected.values())

  async function toggleAll() {
    if (allOnPage) {
      setSelected((prev) => {
        const next = new Map(prev)
        gyms.forEach((gym) => next.delete(gym.id))
        return next
      })
    } else {
      setIsSelectingAll(true)
      try {
        const res = await getAdminGyms({
          query: debouncedQuery || undefined,
          sort: sortValue,
          page: 1,
          pageSize: 100000,
        })
        const allItems = res?.items ?? []
        setSelected((prev) => {
          const next = new Map(prev)
          allItems.forEach((gym) => {
            next.set(gym.id, gym)
          })
          return next
        })
      } catch (err) {
        console.error('Failed to select all gyms:', err)
      } finally {
        setIsSelectingAll(false)
      }
    }
  }

  function toggleOne(gym: AdminGymListItem) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(gym.id)) {
        next.delete(gym.id)
      } else {
        next.set(gym.id, gym)
      }
      return next
    })
  }

  const { colWidths, tableRef, handleMouseDown } = useResizableColumns(
    [200, 250, 200, 120],
    [120, 150, 120, 90]
  )

  function handleToggle(id: number, currentEnabled: boolean) {
    toggleStatus.mutate(
      { id: String(id), enabled: !currentEnabled },
      {
        onSuccess: () => {
          setModalConfig({ isOpen: true, message: t.gyms.statusUpdated, type: 'success' })
        },
        onError: () => {
          setModalConfig({ isOpen: true, message: t.gyms.statusUpdateFailed, type: 'error' })
        },
      }
    )
  }

  function handleDelete() {
    if (!deleteId) return
    deleteGym.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        setModalConfig({ isOpen: true, message: t.gyms.deleted, type: 'success' })
      },
      onError: (error: any) => {
        let msg = error?.message || t.gyms.deleteFailed
        if (error?.response?.data?.error?.details?.dependencies?.length) {
          const deps = error.response.data.error.details.dependencies.map((d: any) => d.reason).join(', ')
          msg = `${t.gyms.cannotDeletePrefix}${deps}`
        } else if (error?.response?.data?.error?.message) {
          msg = error.response.data.error.message
        }
        setModalConfig({ isOpen: true, message: msg, type: 'error' })
      },
    })
  }

  const getSortLabel = (val: string) => {
    switch (val) {
      case 'newest':
        return t.gyms.sortNewest
      case 'name_asc':
        return t.gyms.sortNameAsc
      case 'name_desc':
        return t.gyms.sortNameDesc
      case 'deactivated':
        return t.gyms.sortDeactivated
      case 'address_asc':
        return t.gyms.sortAddressAsc
      default:
        return val
    }
  }

  async function handleExecuteExport(format: ExportFormat, scope: ExportScope) {
    let exportItems: AdminGymListItem[] = []
    if (scope === 'selected') {
      exportItems = selectedList
    } else {
      if (total > 0 && gyms.length === total) {
        exportItems = gyms
      } else {
        const res = await getAdminGyms({
          query: debouncedQuery || undefined,
          sort: sortValue,
          page: 1,
          pageSize: 100000,
        })
        exportItems = res?.items ?? gyms
      }
    }

    if (exportItems.length === 0) return

    // Fetch detailed info for each gym to populate categories, subcategories, contact info
    const detailedGyms = await Promise.all(
      exportItems.map(async (g) => {
        try {
          const details = await getGymAdminDetails(g.id)
          return { g, details }
        } catch {
          return { g, details: null }
        }
      })
    )

    const dateStr = new Date().toISOString().slice(0, 10)

    if (format === 'csv') {
      const headers = ['ID', 'Zal adı', 'Ana kateqoriya', 'Alt kateqoriyalar', 'Ünvan', 'Telefon', 'Email', 'Məsul şəxs', 'Status']
      const rows = detailedGyms.map(({ g, details }) => {
        const { mainCat, subCats } = extractGymCategories(g, details)
        return [
          g.id,
          g.name || details?.name || '',
          mainCat,
          subCats,
          g.fullAddress || details?.address || '',
          details?.phone || '',
          details?.email || '',
          g.ownerName || '',
          g.status === 'ACTIVE' ? 'Aktiv' : 'Deaktiv',
        ]
      })
      const csvContent = [headers, ...rows]
        .map((row) => row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `gyms_${dateStr}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      const exportData = detailedGyms.map(({ g, details }) => {
        const { mainCat, subCats } = extractGymCategories(g, details)
        return {
          id: g.id,
          name: g.name || details?.name,
          mainCategory: mainCat,
          subCategories: subCats,
          address: g.fullAddress || details?.address,
          phone: details?.phone || '',
          email: details?.email || '',
          owner: g.ownerName,
          status: g.status,
        }
      })
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `gyms_${dateStr}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      const formattedDate = new Date().toLocaleDateString('az-AZ')
      const rowsHtml = detailedGyms
        .map(({ g, details }, idx) => {
          const { mainCat, subCats } = extractGymCategories(g, details)
          return `
          <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 12px; font-size: 12px; color: #111827;">${g.id}</td>
            <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #111827;">${escapeHtml(g.name || details?.name)}</td>
            <td style="padding: 10px 12px; font-size: 12px; color: #008799; font-weight: 500;">${escapeHtml(mainCat)}</td>
            <td style="padding: 10px 12px; font-size: 12px; color: #4b5563;">${escapeHtml(subCats)}</td>
            <td style="padding: 10px 12px; font-size: 12px; color: #374151;">${escapeHtml(g.fullAddress || details?.address)}</td>
            <td style="padding: 10px 12px; font-size: 12px; color: #374151;">${escapeHtml(g.ownerName || '-')}</td>
            <td style="padding: 10px 12px; font-size: 12px; text-align: center;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; ${
                g.status === 'ACTIVE'
                  ? 'background-color: #dcfce7; color: #166534;'
                  : 'background-color: #f3f4f6; color: #4b5563;'
              }">
                ${g.status === 'ACTIVE' ? 'Aktiv' : 'Deaktiv'}
              </span>
            </td>
          </tr>
        `
        })
        .join('')

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>FitNest - Zallar Hesabatı</title>
            <meta charset="utf-8" />
            <style>
              @page { size: A4 landscape; margin: 12mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 16px; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00B4CC; padding-bottom: 14px; margin-bottom: 20px; }
              .logo { font-size: 24px; font-weight: 800; color: #00B4CC; letter-spacing: -0.5px; }
              .title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }
              .meta { font-size: 12px; color: #6b7280; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              th { background-color: rgba(0, 180, 204, 0.12); color: #008799; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #00B4CC; }
              .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">FitNest Admin</div>
                <div class="meta">Tarix: ${formattedDate} | Ümumi zal sayı: ${exportItems.length}</div>
              </div>
              <div>
                <h1 class="title">Zallar Hesabatı (Kateqoriyalarla)</h1>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 45px;">ID</th>
                  <th>Zal Adı</th>
                  <th>Ana Kateqoriya</th>
                  <th>Alt Kateqoriyalar</th>
                  <th>Ünvan</th>
                  <th>Məsul Şəxs</th>
                  <th style="text-align: center; width: 80px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <div class="footer">
              <span>Məxfilik: Yalnız Daxili İstifadə Üçün</span>
              <span>FitNest Admin Panel</span>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  function escapeHtml(str: string) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
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
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder={t.gyms.searchToolbarPlaceholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div ref={sortRef} className="relative">
          <button
            onClick={() => setSortOpen((p) => !p)}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-[#00B4CC] hover:text-[#00B4CC]',
              sortOpen && 'border-[#00B4CC] text-[#00B4CC]'
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
                  onClick={() => {
                    setSortValue(opt.value as AdminGymSort)
                    setSortOpen(false)
                    setCurrentPage(1)
                  }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                    opt.value === sortValue
                      ? 'bg-[#00B4CC26] text-[#00B4CC] font-medium'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {getSortLabel(opt.value)}
                  {opt.value === sortValue && <Check size={13} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New Gym Button */}
        <button
          onClick={() => {
            useGymStore.getState().resetGym()
            router.push('/gyms/new')
          }}
          className="flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors cursor-pointer"
        >
          <Plus size={15} />
          {t.gyms.newGym}
        </button>
      </div>

      {/* Selected Items Bulk Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full transition-all duration-300 bg-white/50 p-2 rounded-lg border border-dashed border-[#00B4CC]/20">
        <div className="flex items-center px-2">
          <span className="text-[14px] font-medium text-foreground">
            {t.modals?.selectedCount ? t.modals.selectedCount.replace('{count}', String(selected.size)) : `${selected.size} zal seçildi`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[13.4px]">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex h-[40px] min-w-[110px] w-fit items-center justify-center gap-2 rounded-lg border border-[#00B4CC]/40 bg-white text-foreground hover:bg-[#00B4CC]/5 hover:border-[#00B4CC] px-4 text-sm font-medium transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Image src="/export-icon.svg" width={18} height={18} alt="" className="shrink-0" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table ref={tableRef} className="w-full border-separate border-spacing-0" style={{ tableLayout: 'fixed', minWidth: '750px' }}>
          <colgroup>
            <col style={{ width: '48px' }} /> {/* Checkbox column */}
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col style={{ width: `${colWidths[3]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00B4CC]/[0.15] dark:bg-[#00B4CC]/10 text-left">
              {/* Header Checkbox */}
              <th className="px-4 py-3">
                <div className="flex justify-center">
                  {isSelectingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={allOnPage}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
                    />
                  )}
                </div>
              </th>
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
                <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                  {t.common.loading}
                </td>
              </tr>
            ) : gyms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <p className="text-sm font-semibold text-foreground mb-4">{t.common.noData}</p>
                  <button
                    onClick={() => {
                      useGymStore.getState().resetGym()
                      router.push('/gyms/new')
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors mx-auto cursor-pointer"
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
                  isSelected={selected.has(gym.id)}
                  onToggleSelect={() => toggleOne(gym)}
                  onView={() => router.push(`/gyms/${gym.id}`)}
                  onDelete={() => setDeleteId(gym.id)}
                  onToggleStatus={() => handleToggle(gym.id, gym.status === 'ACTIVE')}
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
                  'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  p === currentPage ? 'bg-[#00B4CC] text-white' : 'text-foreground hover:bg-secondary'
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

      <ExportGymsModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        selectedGyms={selectedList}
        totalGymsCount={total}
        onExecuteExport={handleExecuteExport}
      />

      {gymsQuery.isError && <p className="text-sm text-red-500">{t.gyms.loadFailed}</p>}

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
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
  onToggleStatus,
}: {
  gym: AdminGymListItem
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const t = useT()

  return (
    <tr
      onClick={onView}
      className={cn(
        'hover:bg-secondary/40 border-b border-border transition-all duration-200 cursor-pointer',
        isSelected && 'bg-[#f0fdff] dark:bg-[#00B4CC]/5'
      )}
    >
      {/* Row Checkbox */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 accent-[#00B4CC] cursor-pointer rounded"
          />
        </div>
      </td>

      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.name}>
          {gym.name}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.fullAddress}>
          {gym.fullAddress}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-normal text-black overflow-hidden">
        <span className="truncate block" title={gym.ownerName || ''}>
          {gym.ownerName || ''}
        </span>
      </td>
      <td className="px-4 py-3 text-center overflow-hidden">
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <GymStatusToggle active={gym.status === 'ACTIVE'} onToggle={onToggleStatus} />
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        {/* Action menu */}
        <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 outline-none cursor-pointer"
                aria-label={t.gyms.more}
              >
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-[180px] flex flex-col gap-3 rounded-[12px] border border-[#ECECED] bg-white p-3 shadow-lg"
            >
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
