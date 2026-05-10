'use client'

import { X, Info } from 'lucide-react'

interface StepNavigationWarningModalProps {
  onClose: () => void
}

export function StepNavigationWarningModal({ onClose }: StepNavigationWarningModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#00B4CC]" />
            <h2 className="text-sm font-bold text-foreground">Diqqət</h2>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex flex-col gap-6 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Geri qayıda bilməzsiniz. Zəhmət olmasa zalın yaradılmasını tamamlayın və sonra məlumatları zalın detallarından redaktə edin.
          </p>
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#00B4CC] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#009DB3] transition-colors shadow-sm"
            >
              Anladım
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
