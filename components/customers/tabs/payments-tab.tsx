'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Copy, Download, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomerPaymentsQuery } from '@/modules/customers/hooks/use-customers-query'
import type { UserPaymentHistoryItem } from '@/modules/customers/types/customer.types'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const PAGE_SIZE = 5

type ModalState = 'detail' | 'refund-confirm' | 'refund-success' | null

function getStatusPillConfig(status: string) {
  const s = status.trim().toLowerCase()
  if (s === 'success' || s === 'completed' || s === 'uğurlu') {
    return { bg: 'bg-[#166728]', label: 'Uğurlu' }
  }
  if (s.includes('pending_user_action')) {
    return { bg: 'bg-[#94979c]', label: 'Gözlənilir' }
  }
  if (s.includes('pending') || s === 'processing' || s === 'icradadır') {
    return { bg: 'bg-[#ec972f]', label: 'Gözləmədə' }
  }
  if (s === 'failed' || s === 'error' || s === 'xəta' || s === 'xata' || s === 'uğursuz') {
    return { bg: 'bg-[#c9373a]', label: 'Uğursuz' }
  }
  if (s === 'refunded' || s === 'geri qaytarıldı') {
    return { bg: 'bg-[#8a38f5]', label: 'Geri qaytarıldı' }
  }
  return { bg: 'bg-[#94979c]', label: status || 'Naməlum' }
}

function PaymentMethodBadge({ method }: { method: string }) {
  const lower = method.toLowerCase()
  if (lower.includes('apple')) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="h-6 px-2 rounded bg-black text-white flex items-center justify-center font-bold text-[11px] tracking-tighter shrink-0">
           Pay
        </div>
        <span className="text-sm font-medium leading-none text-foreground whitespace-nowrap">Apple Pay</span>
      </div>
    )
  }
  if (lower.includes('google') || lower.includes('gpay')) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="h-6 px-2 rounded bg-white border border-gray-200 shadow-2xs text-gray-800 flex items-center justify-center font-bold text-[11px] tracking-tight shrink-0">
          <span className="text-blue-500">G</span>Pay
        </div>
        <span className="text-sm font-medium leading-none text-foreground whitespace-nowrap">Google Pay</span>
      </div>
    )
  }
  if (lower.includes('master') || lower.includes('kapital')) {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center shrink-0">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 -mr-1.5 mix-blend-multiply" />
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 mix-blend-multiply" />
        </div>
        <span className="text-sm font-medium leading-none text-foreground whitespace-nowrap">
          {lower.includes('kapital') ? 'Kapital Bank' : 'Mastercard'}
        </span>
      </div>
    )
  }
  if (lower === 'unknown') {
    return (
      <span className="text-sm font-medium leading-none text-muted-foreground whitespace-nowrap italic">
        Naməlum
      </span>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-5 px-1.5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
        VISA
      </div>
      <span className="text-sm font-medium leading-none text-foreground whitespace-nowrap">{method || 'Kredit Kartı'}</span>
    </div>
  )
}

export function PaymentsTab({ userId }: { userId: string }) {
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<UserPaymentHistoryItem | null>(null)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [copied, setCopied]         = useState(false)
  const [copiedTx, setCopiedTx]     = useState(false)
  const [copiedOrder, setCopiedOrder] = useState(false)

  const { data = [], isLoading, isError } = useCustomerPaymentsQuery(userId)

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const rows = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: AdminDataTableColumn<UserPaymentHistoryItem>[] = useMemo(
    () => [
      {
        id: 'transactionId',
        label: 'Tranzaksiya ID',
        defaultWidth: 150,
        minWidth: 120,
        maxWidth: 240,
        render: (row) => (
          <span className="block truncate" title={row.transactionId}>
            {row.transactionId || '—'}
          </span>
        ),
      },
      {
        id: 'orderId',
        label: 'Sifariş ID',
        defaultWidth: 150,
        minWidth: 120,
        maxWidth: 240,
        render: (row) => (
          <span className="block truncate" title={row.orderId}>
            {row.orderId || '—'}
          </span>
        ),
      },
      {
        id: 'date',
        label: 'Tarix',
        defaultWidth: 150,
        minWidth: 120,
        maxWidth: 200,
        render: (row) => {
          const formattedDate = row.dateTime ? row.dateTime.replace('T', ' / ').slice(0, 16) : '20.08.26 / 13:00'
          return (
            <span className="block truncate whitespace-nowrap" title={formattedDate}>
              {formattedDate}
            </span>
          )
        },
      },
      {
        id: 'amount',
        label: 'Məbləğ',
        defaultWidth: 110,
        minWidth: 90,
        maxWidth: 160,
        render: (row) => (
          <span className="block truncate whitespace-nowrap">
            {row.amount ? (row.amount.includes('AZN') ? row.amount : `${row.amount} AZN`) : ''}
          </span>
        ),
      },
      {
        id: 'method',
        label: 'Ödəniş metodu',
        defaultWidth: 170,
        minWidth: 130,
        maxWidth: 280,
        render: (row) => (
          <div className="flex justify-center truncate">
            <PaymentMethodBadge method={row.paymentMethod} />
          </div>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        defaultWidth: 130,
        minWidth: 110,
        maxWidth: 200,
        render: (row) => {
          const pill = getStatusPillConfig(row.status)
          return (
            <div className="flex justify-center">
              <div
                className={cn(
                  'flex h-6.5 w-fit items-center justify-center gap-1.5 rounded-[20px] px-3.5 py-1 text-[12px] font-medium text-white shadow-2xs tracking-wide truncate',
                  pill.bg,
                )}
              >
                <div className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-white" />
                <span>{pill.label}</span>
              </div>
            </div>
          )
        },
      },
      {
        id: 'actions',
        label: 'Ətraflı',
        defaultWidth: 72,
        minWidth: 64,
        maxWidth: 96,
        reorderable: false,
        hideable: false,
        render: (row) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full outline-none hover:bg-secondary/80"
                  aria-label="Ətraflı"
                >
                  <Image src="/more.png" width={24} height={24} alt="Ətraflı" className="object-contain" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex w-[200px] flex-col gap-3 rounded-[12px] border border-[#ececed] bg-white p-3 font-sans text-black shadow-2xl">
                <DropdownMenuItem
                  onClick={() => openDetail(row)}
                  className="block w-full cursor-pointer rounded-none border-b border-[#00b4cc] pb-2 text-left text-[16px] font-medium leading-[24px] text-black"
                >
                  Bax
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyTx(row.transactionId)}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-[#ececed] pb-2 text-left text-[16px] font-medium leading-[24px] text-black"
                >
                  <span>Tranzaksiya ID-ni kopyala</span>
                  {copiedTx && <Check size={14} className="ml-1 shrink-0 text-[#00b4cc]" />}
                </DropdownMenuItem>
                {row.orderId ? (
                  <DropdownMenuItem
                    onClick={() => copyOrder(row.orderId!)}
                    className="flex w-full cursor-pointer items-center justify-between border-b border-[#ececed] pb-2 text-left text-[16px] font-medium leading-[24px] text-black"
                  >
                    <span>Sifariş ID-ni kopyala</span>
                    {copiedOrder && <Check size={14} className="ml-1 shrink-0 text-[#00b4cc]" />}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() => downloadDirectReceipt(row)}
                  className="block w-full cursor-pointer pt-0.5 text-left text-[16px] font-medium leading-[24px] text-black"
                >
                  Qəbzi yüklə
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [copiedTx, copiedOrder],
  )

  function openDetail(row: UserPaymentHistoryItem) {
    setSelected(row)
    setModalState('detail')
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function copyTx(id: string) {
    if (!id) return
    navigator.clipboard.writeText(id).catch(() => {})
    setCopiedTx(true)
    setTimeout(() => setCopiedTx(false), 1500)
  }

  function copyOrder(id: string) {
    if (!id) return
    navigator.clipboard.writeText(id).catch(() => {})
    setCopiedOrder(true)
    setTimeout(() => setCopiedOrder(false), 1500)
  }

  function closeModal() {
    setModalState(null)
    setSelected(null)
  }

  function downloadDirectReceipt(row: UserPaymentHistoryItem) {
    const pill = getStatusPillConfig(row.status)
    const content = `FitNest Qəbz\n=========================\nƏməliyyat ID: ${row.transactionId}\nTarix: ${row.dateTime}\nMəbləğ: ${row.amount}\nÖdəniş Metodu: ${row.paymentMethod}\nStatus: ${pill.label}\n=========================`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `qebz-${row.transactionId}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white border border-border p-7 shadow-xs w-full animate-in fade-in-50 duration-300 font-sans text-black">
      {/* Container Header */}
      <div className="border-b border-border pb-3.5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-black tracking-tight">Ödəniş məlumatları</h2>
      </div>

      {isError ? (
        <p className="text-center text-sm text-red-500">Ödəniş məlumatları yüklənmədi.</p>
      ) : (
        <AdminDataTable
          storageKey="customer-payments"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.transactionId || row.orderId || row.dateTime}
          isLoading={isLoading}
          emptyTitle="Bu müştəri üçün heç bir ödəniş əməliyyatı tapılmadı."
          className="pb-2"
        />
      )}

      {/* Pagination Container Component */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Invoked State Modals */}
      {selected && modalState === 'detail' && (
        <PaymentDetailModal
          payment={selected}
          onClose={closeModal}
          onRefund={() => setModalState('refund-confirm')}
        />
      )}
      {selected && modalState === 'refund-confirm' && (
        <ConfirmModal
          message="Ödənişi geri qaytarmaq istədiyinizə əminsiniz?"
          onCancel={() => setModalState('detail')}
          onConfirm={() => setModalState('refund-success')}
        />
      )}
      {selected && modalState === 'refund-success' && (
        <ResultModal
          success
          message="Ödəniş uğurla geri qaytarıldı."
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function PaymentDetailModal({
  payment, onClose, onRefund,
}: {
  payment: UserPaymentHistoryItem; onClose: () => void; onRefund: () => void
}) {
  const pill = getStatusPillConfig(payment.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-50 duration-200 font-sans text-black" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-[12px] bg-white border border-[#ececed] p-5 shadow-2xl flex flex-col items-end gap-7 text-left text-[20px]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="w-full border-b border-[#ececed] pb-1 flex items-center justify-between gap-5">
          <div className="text-[20px] leading-[30px] font-medium text-black">Ətraflı məlumat</div>
          <button 
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer"
            aria-label="Bağla"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Outer Group wrapper */}
        <div className="w-full flex flex-col gap-10 text-[18px]">
          {/* Rows List Container */}
          <div className="w-full flex flex-col gap-5">
            {/* Row 1a: Tranzaksiya ID */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Tranzaksiya ID:</div>
              <span className="leading-[28px] text-black text-base font-medium">{payment.transactionId || '—'}</span>
            </div>

            {/* Row 1b: Sifariş ID */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Sifariş ID:</div>
              <span className="leading-[28px] text-black text-base font-medium">{payment.orderId || '—'}</span>
            </div>

            {/* Row 2: Tarix */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Tarix:</div>
              <span className="leading-[28px] text-black text-base font-medium">{payment.dateTime ? payment.dateTime.replace('T', ' / ') : '20/08/26- 18:00'}</span>
            </div>

            {/* Row 3: Məbləğ */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Məbləğ :</div>
              <span className="leading-[28px] text-[#00b4cc] text-base font-medium">{payment.amount ? (payment.amount.includes('AZN') || payment.amount.includes('Azn') ? payment.amount : `${payment.amount} Azn`) : '1000 Azn'}</span>
            </div>

            {/* Row 4: Ödəniş metodu */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Ödəniş metodu :</div>
              <div className="flex items-center justify-end">
                <PaymentMethodBadge method={payment.paymentMethod} />
              </div>
            </div>

            {/* Row 5: Status */}
            <div className="w-full h-[60px] flex items-center justify-between px-3 box-border gap-2.5 bg-[#fafafa]/50 rounded-lg border border-gray-100/60">
              <div className="leading-[28px] font-medium text-gray-500">Status :</div>
              <div className={cn("h-[26px] rounded-[20px] flex items-center justify-center px-3 py-1 box-border gap-1 text-[12px] text-white shadow-2xs font-medium", pill.bg)}>
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                <span className="leading-[18px] font-medium">{pill.label}</span>
              </div>
            </div>
          </div>

          {/* Action Button Wrapper */}
          {pill.label === 'Uğurlu' && (
            <div className="w-full px-3 text-center text-[16px] text-white box-border">
              <button
                type="button"
                onClick={onRefund}
                className="w-full h-[48px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 py-2 box-border hover:bg-[#008799] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <span className="leading-[24px] font-medium text-white">Ödənişi geri qaytar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-50 duration-200 font-sans text-black">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl flex flex-col gap-5 border border-border">
        <p className="text-center text-sm font-bold text-foreground leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors cursor-pointer">Ləğv et</button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors cursor-pointer shadow-2xs">Təsdiqlə</button>
        </div>
      </div>
    </div>
  )
}

function ResultModal({ success, message, onClose }: { success: boolean; message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-50 duration-200 font-sans text-black">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl flex flex-col items-center gap-5 border border-border">
        <div className={cn('flex items-center gap-2 text-base font-bold', success ? 'text-[#00B4CC]' : 'text-red-500')}>
          {success ? <Check size={20} className="stroke-[3]" /> : <RefreshCw size={20} />} {message}
        </div>
        <button type="button" onClick={onClose} className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer">Bağla</button>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  function getPages(): (number | '...')[] {
    const res: (number | '...')[] = []
    if (totalPages <= 6) { 
      for (let i = 1; i <= totalPages; i++) res.push(i) 
    } else {
      if (page <= 3) {
        res.push(1, 2, 3, 4)
        res.push('...')
        res.push(totalPages)
      } else if (page >= totalPages - 2) {
        res.push(1)
        res.push('...')
        res.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        res.push(1)
        res.push('...')
        res.push(page - 1, page, page + 1)
        res.push('...')
        res.push(totalPages)
      }
    }
    return res
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border/40 mt-auto font-sans">
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ell-${i}`} className="px-2 text-muted-foreground font-bold">...</span>
        ) : (
          <button 
            key={p} 
            type="button"
            onClick={() => onChange(p as number)}
            className={cn(
              'h-8 w-8 rounded-lg text-sm font-bold transition-all flex items-center justify-center cursor-pointer', 
              page === p ? 'bg-[#00B4CC] text-white shadow-2xs' : 'text-foreground hover:bg-secondary border border-border/40'
            )}
          >
            {p}
          </button>
        )
      )}
    </div>
  )
}
