'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Copy, Download, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomerPaymentsQuery } from '@/modules/customers/hooks/use-customers-query'
import type { UserPaymentHistoryItem } from '@/modules/customers/types/customer.types'

const PAGE_SIZE = 5

type ModalState = 'detail' | 'refund-confirm' | 'refund-success' | null

const STATUS_BADGE: Record<string, string> = {
  'Uğurlu':         'bg-green-600 text-white',
  'İcradadır':      'bg-orange-500 text-white',
  'Xata':           'bg-red-500 text-white',
  'Xəta':           'bg-red-500 text-white',
  'Geri qaytarıldı':'bg-purple-500 text-white',
}

function statusBadgeClass(status: string) {
  return STATUS_BADGE[status] ?? 'bg-secondary text-foreground'
}

function MethodIcon({ method }: { method: string }) {
  const lower = method.toLowerCase()
  if (lower.includes('apple'))
    return <span className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold tracking-tight">Pay</span>
  if (lower.includes('google'))
    return <span className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-blue-600">GPay</span>
  if (lower.includes('kapital'))
    return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">K</span>
  if (lower.includes('visa'))
    return <span className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-blue-700">VISA</span>
  if (lower.includes('master'))
    return <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">M</span>
  return null
}

export function PaymentsTab({ userId }: { userId: string }) {
  const [page, setPage]             = useState(1)
  const [selected, setSelected]     = useState<UserPaymentHistoryItem | null>(null)
  const [menuOpen, setMenuOpen]     = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [copied, setCopied]         = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data = [], isLoading, isError } = useCustomerPaymentsQuery(userId)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const rows = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openDetail(row: UserPaymentHistoryItem) {
    setSelected(row)
    setModalState('detail')
    setMenuOpen(null)
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
    setMenuOpen(null)
  }

  function closeModal() {
    setModalState(null)
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-foreground">Ödəniş məlumatları</h2>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#E8F9FB] text-left">
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Əməliyyat ID</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Tarix</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Məbləğ</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Ödəniş metodu</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Status</th>
              <th className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">Ətraflı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="bg-card">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Ödəniş məlumatları yüklənmədi.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Ödəniş tapılmadı.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.map((row) => (
              <tr key={row.transactionId} className="bg-card hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-foreground">{row.transactionId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.dateTime}</td>
                <td className="px-4 py-3 whitespace-nowrap text-foreground">{row.amount}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <MethodIcon method={row.paymentMethod} />
                    <span>{row.paymentMethod}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusBadgeClass(row.status))}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="relative inline-block" ref={menuOpen === row.transactionId ? menuRef : undefined}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === row.transactionId ? null : row.transactionId)}
                      className="flex items-center justify-center rounded p-1 hover:bg-secondary transition-colors"
                      aria-label="Ətraflı"
                    >
                      <MoreVertical size={16} className="text-muted-foreground" />
                    </button>
                    {menuOpen === row.transactionId && (
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                        <button
                          onClick={() => openDetail(row)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          Bax
                        </button>
                        <button
                          onClick={() => copyId(row.transactionId)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {copied ? <Check size={13} className="text-[#00B4CC]" /> : <Copy size={13} />}
                          Tranzaksiya ID-ni kopyala
                        </button>
                        <button
                          onClick={() => { setSelected(row); setMenuOpen(null) }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <Download size={13} /> Qəbzi yüklə
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

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
  function downloadReceipt() {
    const content = `Qəbz\nID: ${payment.transactionId}\nTarix: ${payment.dateTime}\nMəbləğ: ${payment.amount}\nMetod: ${payment.paymentMethod}\nStatus: ${payment.status}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `qebz-${payment.transactionId}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Ətraflı məlumat</h2>
          <button onClick={downloadReceipt} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Qəbzi yüklə">
            <Download size={16} />
          </button>
        </div>

        <DetailRow label="ID:"             value={payment.transactionId} mono />
        <DetailRow label="Tarix:"          value={payment.dateTime} />
        <DetailRow label="Məbləğ:"         value={payment.amount} bold />
        <DetailRow
          label="Ödəniş metodu:"
          value={payment.paymentMethod}
          prefix={<MethodIcon method={payment.paymentMethod} />}
        />
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">Status :</span>
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusBadgeClass(payment.status))}>
            {payment.status}
          </span>
        </div>

        {payment.status === 'Uğurlu' && (
          <button
            onClick={onRefund}
            className="w-full rounded-xl bg-[#00B4CC] py-3 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            Ödənişi geri qaytar
          </button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono, bold, prefix }: {
  label: string; value: string; mono?: boolean; bold?: boolean; prefix?: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-semibold text-foreground shrink-0">{label}</span>
      {prefix && <span className="shrink-0">{prefix}</span>}
      <span className={cn('text-sm text-foreground', mono && 'font-mono', bold && 'font-bold')}>{value}</span>
    </div>
  )
}

function ConfirmModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-2xl flex flex-col gap-5">
        <p className="text-center text-sm font-medium text-foreground">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Ləğv et</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">Göndər</button>
        </div>
      </div>
    </div>
  )
}

function ResultModal({ success, message, onClose }: { success: boolean; message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs rounded-2xl bg-card p-6 shadow-2xl flex flex-col items-center gap-5">
        <div className={cn('flex items-center gap-2 text-sm font-medium', success ? 'text-[#00B4CC]' : 'text-red-500')}>
          {success ? <Check size={18} /> : <RefreshCw size={18} />} {message}
        </div>
        <button onClick={onClose} className="rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-secondary transition-colors">Bağla</button>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  function pages(): (number | '...')[] {
    const result: (number | '...')[] = []
    if (totalPages <= 6) { for (let i = 1; i <= totalPages; i++) result.push(i) }
    else { result.push(1, 2, 3, 4); result.push('...'); result.push(totalPages) }
    return result
  }
  return (
    <div className="flex items-center justify-center gap-1">
      {pages().map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-1 text-muted-foreground">...</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)}
            className={cn('h-8 w-8 rounded-lg text-sm font-medium transition-colors', page === p ? 'bg-[#00B4CC] text-white' : 'text-foreground hover:bg-secondary')}>
            {p}
          </button>
        ),
      )}
    </div>
  )
}
