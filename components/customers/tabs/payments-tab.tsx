'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Copy, Download, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomerPaymentsQuery } from '@/modules/customers/hooks/use-customers-query'
import type { UserPaymentHistoryItem } from '@/modules/customers/types/customer.types'
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

  const [colWidths, setColWidths] = useState<number[]>([160, 160, 160, 100, 160, 130]);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const activeColIndexRef = useRef<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerWidthRef = useRef<number>(0);

  const mouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const mouseUpRef = useRef<() => void>(null);

  const minWidths = [120, 120, 120, 90, 140, 120];

  mouseMoveRef.current = (e: MouseEvent) => {
    if (activeColIndexRef.current === -1) return;
    const deltaX = e.clientX - startXRef.current;
    const minW = minWidths[activeColIndexRef.current] || 100;

    const sumOthers = colWidths.reduce((acc, w, idx) => {
      return idx !== activeColIndexRef.current ? acc + w : acc;
    }, 0);

    const maxW = Math.max(minW, containerWidthRef.current - sumOthers - 80);
    const newWidth = Math.min(maxW, Math.max(minW, startWidthRef.current + deltaX));
    setColWidths((prev) => {
      const copy = [...prev];
      copy[activeColIndexRef.current] = newWidth;
      return copy;
    });
  };

  mouseUpRef.current = () => {
    activeColIndexRef.current = -1;
    if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeColIndexRef.current = index;
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[index];

    if (tableRef.current) {
      containerWidthRef.current = tableRef.current.getBoundingClientRect().width;
    } else {
      containerWidthRef.current = 800;
    }

    if (mouseMoveRef.current) document.addEventListener("mousemove", mouseMoveRef.current);
    if (mouseUpRef.current) document.addEventListener("mouseup", mouseUpRef.current);
  };

  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) document.removeEventListener("mousemove", mouseMoveRef.current);
      if (mouseUpRef.current) document.removeEventListener("mouseup", mouseUpRef.current);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const rows = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

      {/* Responsive Table Tracks Wrapper */}
      <div className="w-full overflow-x-auto pb-2">
        <table ref={tableRef} className="w-full border-separate border-spacing-0 border border-[#cecfd2] rounded-xl text-sm" style={{ tableLayout: "fixed", minWidth: "900px" }}>
          <colgroup>
            <col style={{ width: `${colWidths[0]}px` }} />
            <col style={{ width: `${colWidths[1]}px` }} />
            <col style={{ width: `${colWidths[2]}px` }} />
            <col style={{ width: `${colWidths[3]}px` }} />
            <col style={{ width: `${colWidths[4]}px` }} />
            <col style={{ width: `${colWidths[5]}px` }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#00b4cc]/15 text-left text-[14px] font-medium text-[#4a5565]">
              <th className="px-4 py-3 font-semibold text-foreground relative pl-6 border-b border-[#cecfd2]">
                Tranzaksiya ID
                <div
                  onMouseDown={(e) => handleMouseDown(0, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground relative border-b border-[#cecfd2]">
                Sifariş ID
                <div
                  onMouseDown={(e) => handleMouseDown(1, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground text-center relative border-b border-[#cecfd2]">
                Tarix
                <div
                  onMouseDown={(e) => handleMouseDown(2, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground text-center relative border-b border-[#cecfd2]">
                Məbləğ
                <div
                  onMouseDown={(e) => handleMouseDown(3, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground text-center relative border-b border-[#cecfd2]">
                Ödəniş metodu
                <div
                  onMouseDown={(e) => handleMouseDown(4, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground text-center relative border-b border-[#cecfd2]">
                Status
                <div
                  onMouseDown={(e) => handleMouseDown(5, e)}
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#00B4CC]/30 group/handle flex items-center justify-center transition-colors z-10"
                >
                  <div className="w-[2px] h-4 bg-[#cecfd2] group-hover/handle:bg-[#00B4CC] transition-colors rounded" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-foreground text-center border-b border-[#cecfd2]">Ətraflı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cecfd2] bg-white">
            {isLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                  </td>
                </tr>
              ))
            )}
            
            {isError && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-red-500">
                  Ödəniş məlumatları yüklənmədi.
                </td>
              </tr>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground italic">
                  Bu müştəri üçün heç bir ödəniş əməliyyatı tapılmadı.
                </td>
              </tr>
            )}

            {!isLoading && !isError && rows.map((row, idx) => {
              const pill = getStatusPillConfig(row.status)
              const formattedDate = row.dateTime ? row.dateTime.replace('T', ' / ').slice(0, 16) : '20.08.26 / 13:00'
              
              return (
                <tr 
                  key={row.transactionId || idx} 
                  className="hover:bg-[#fafafa] transition-colors duration-150"
                >
                  {/* Transaction ID */}
                  <td className="px-4 py-3 text-left pl-6 text-xs font-medium text-black overflow-hidden">
                    <span className="truncate block" title={row.transactionId}>{row.transactionId || '—'}</span>
                  </td>

                  {/* Order ID */}
                  <td className="px-4 py-3 text-left text-xs font-medium text-black overflow-hidden">
                    <span className="truncate block" title={row.orderId}>{row.orderId || '—'}</span>
                  </td>

                  {/* Date Time */}
                  <td className="px-4 py-3 text-center text-sm font-medium text-black overflow-hidden">
                    <span className="whitespace-nowrap truncate block" title={formattedDate}>{formattedDate}</span>
                  </td>

                  {/* Amount Value */}
                  <td className="px-4 py-3 text-center text-sm font-medium text-black overflow-hidden">
                    <span className="whitespace-nowrap truncate block">
                      {row.amount ? (row.amount.includes('AZN') ? row.amount : `${row.amount} AZN`) : ''}
                    </span>
                  </td>

                  {/* Payment Method component */}
                  <td className="px-4 py-3 text-center overflow-hidden">
                    <div className="flex items-center justify-center truncate">
                      <PaymentMethodBadge method={row.paymentMethod} />
                    </div>
                  </td>

                  {/* Status Badging Strip */}
                  <td className="px-4 py-3 text-center overflow-hidden">
                    <div className="flex items-center justify-center">
                      <div className={cn(
                        "h-6.5 rounded-[20px] flex items-center justify-center px-3.5 py-1 gap-1.5 text-[12px] font-medium text-white shadow-2xs tracking-wide w-fit truncate",
                        pill.bg
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                        <span className="leading-[18px] font-medium">{pill.label}</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions column using exact requested Image visual token */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary/80 transition-all cursor-pointer outline-none"
                            aria-label="Ətraflı"
                          >
                            <Image src="/more.png" width={24} height={24} alt="Ətraflı" className="object-contain" />
                          </button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end" className="w-[200px] rounded-[12px] bg-white border border-[#ececed] p-3 flex flex-col gap-3 shadow-2xl font-sans text-black">
                          {/* Item 1: Bax */}
                          <DropdownMenuItem
                            onClick={() => openDetail(row)}
                            className="w-full text-left text-[16px] leading-[24px] text-black hover:text-[#00b4cc] focus:text-[#00b4cc] transition-colors font-medium cursor-pointer block border-b border-[#00b4cc] pb-2 rounded-none focus:bg-transparent px-0 py-0"
                          >
                            Bax
                          </DropdownMenuItem>

                          {/* Item 2: Tranzaksiya ID- ni kopyala */}
                          <DropdownMenuItem
                            onClick={() => copyTx(row.transactionId)}
                            className="w-full text-left text-[16px] leading-[24px] text-black hover:text-[#00b4cc] focus:text-[#00b4cc] transition-colors font-medium cursor-pointer flex items-center justify-between border-b border-[#ececed] pb-2 rounded-none focus:bg-transparent px-0 py-0"
                          >
                            <span>Tranzaksiya ID-ni kopyala</span>
                            {copiedTx && <Check size={14} className="text-[#00b4cc] shrink-0 ml-1" />}
                          </DropdownMenuItem>

                          {/* Item 2b: Sifariş ID-ni kopyala */}
                          {row.orderId && (
                            <DropdownMenuItem
                              onClick={() => copyOrder(row.orderId!)}
                              className="w-full text-left text-[16px] leading-[24px] text-black hover:text-[#00b4cc] focus:text-[#00b4cc] transition-colors font-medium cursor-pointer flex items-center justify-between border-b border-[#ececed] pb-2 rounded-none focus:bg-transparent px-0 py-0"
                            >
                              <span>Sifariş ID-ni kopyala</span>
                              {copiedOrder && <Check size={14} className="text-[#00b4cc] shrink-0 ml-1" />}
                            </DropdownMenuItem>
                          )}

                          {/* Item 3: Qəbzi yüklə */}
                          <DropdownMenuItem
                            onClick={() => downloadDirectReceipt(row)}
                            className="w-full text-left text-[16px] leading-[24px] text-black hover:text-[#00b4cc] focus:text-[#00b4cc] transition-colors font-medium cursor-pointer block pt-0.5 focus:bg-transparent px-0 py-0"
                          >
                            Qəbzi yüklə
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
      res.push(1, 2, 3, 4)
      res.push('...')
      res.push(totalPages) 
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
