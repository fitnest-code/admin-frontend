'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { FileText, FileCode, Code2, Download, X, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import type { AdminGymListItem } from '@/modules/gyms'

export type ExportFormat = 'csv' | 'pdf' | 'json'
export type ExportScope = 'selected' | 'all'

interface ExportGymsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGyms: AdminGymListItem[]
  totalGymsCount: number
  onExecuteExport: (format: ExportFormat, scope: ExportScope) => Promise<void> | void
}

export function ExportGymsModal({
  isOpen,
  onClose,
  selectedGyms,
  totalGymsCount,
  onExecuteExport,
}: ExportGymsModalProps) {
  const t = useT()
  const [mounted, setMounted] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [scope, setScope] = useState<ExportScope>(selectedGyms.length > 0 ? 'selected' : 'all')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedGyms.length > 0) {
      setScope('selected')
    } else {
      setScope('all')
    }
  }, [selectedGyms.length])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  async function handleExport() {
    setIsExporting(true)
    try {
      await onExecuteExport(format, scope)
      onClose()
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportCount = scope === 'selected' ? selectedGyms.length : totalGymsCount

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={(e) => !isExporting && e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[480px] rounded-[12px] bg-white border border-[#ececed] p-6 shadow-2xl animate-in zoom-in-95 duration-200 font-sans flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B4CC]/10 text-[#00B4CC] shrink-0">
              <Image src="/export-icon.svg" width={20} height={20} alt="" className="shrink-0" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {t.gyms.exportModalTitle || 'Zalları İxrac Et'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t.gyms.exportModalSubtitle || 'Zal məlumatlarını yükləmək üçün format seçin.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scope Selection */}
        {selectedGyms.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
              İxrac Əhatəsi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('selected')}
                className={cn(
                  'flex items-center justify-center gap-2 h-10 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none',
                  scope === 'selected'
                    ? 'border-[#00B4CC] bg-[#00B4CC]/10 text-[#008799] shadow-2xs'
                    : 'border-border bg-card text-foreground hover:bg-secondary'
                )}
              >
                <span>Seçilmiş ({selectedGyms.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={cn(
                  'flex items-center justify-center gap-2 h-10 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none',
                  scope === 'all'
                    ? 'border-[#00B4CC] bg-[#00B4CC]/10 text-[#008799] shadow-2xs'
                    : 'border-border bg-card text-foreground hover:bg-secondary'
                )}
              >
                <span>Bütün Zallar ({totalGymsCount})</span>
              </button>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
            Fayl Formatı
          </label>
          <div className="flex flex-col gap-2.5">
            {/* CSV Option */}
            <div
              onClick={() => setFormat('csv')}
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                format === 'csv'
                  ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-foreground shadow-xs'
                  : 'border-border bg-card hover:bg-secondary text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                    format === 'csv' ? 'bg-[#00B4CC] text-white' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  <FileText size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">CSV Formatı (.csv)</span>
                  <span className="text-xs text-muted-foreground">Excel və cədvəl proqramları üçün</span>
                </div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                  format === 'csv' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-border'
                )}
              >
                {format === 'csv' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>

            {/* PDF Option */}
            <div
              onClick={() => setFormat('pdf')}
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                format === 'pdf'
                  ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-foreground shadow-xs'
                  : 'border-border bg-card hover:bg-secondary text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                    format === 'pdf' ? 'bg-[#00B4CC] text-white' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  <FileCode size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">PDF Sənədi (.pdf)</span>
                  <span className="text-xs text-muted-foreground">Çap etmək və oxumaq üçün formatlanmış fayl</span>
                </div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                  format === 'pdf' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-border'
                )}
              >
                {format === 'pdf' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>

            {/* JSON Option */}
            <div
              onClick={() => setFormat('json')}
              className={cn(
                'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                format === 'json'
                  ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-foreground shadow-xs'
                  : 'border-border bg-card hover:bg-secondary text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                    format === 'json' ? 'bg-[#00B4CC] text-white' : 'bg-secondary text-muted-foreground'
                  )}
                >
                  <Code2 size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">JSON Formatı (.json)</span>
                  <span className="text-xs text-muted-foreground">Strukturlaşdırılmış məlumatlar üçün</span>
                </div>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                  format === 'json' ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-border'
                )}
              >
                {format === 'json' && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="h-10 px-5 rounded-lg border border-[#00B4CC] bg-white text-sm font-medium text-black hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Ləğv et
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="h-10 px-6 rounded-lg bg-[#00B4CC] text-sm font-semibold text-white hover:bg-[#008799] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-70 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Download size={16} />
            )}
            <span>İxrac et ({exportCount})</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
