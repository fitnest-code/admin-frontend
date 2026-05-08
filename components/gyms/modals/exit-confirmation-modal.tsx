'use client'

import { X, AlertTriangle } from 'lucide-react'

interface ExitConfirmationModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function ExitConfirmationModal({ onConfirm, onCancel }: ExitConfirmationModalProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Diqqət</h2>
          </div>
          <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex flex-col gap-6 p-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hörmətli istifadəçi, davam edən qeydiyyat prosesini tərk etmək istədiyinizdən əminsiniz?
            <br /><br />
            Bildiririk ki, çıxış etdiyiniz təqdirdə daxil edilmiş bütün məlumatlar silinəcəkdir.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel} 
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Geri qayıt
            </button>
            <button 
              onClick={onConfirm} 
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors shadow-sm"
            >
              Təsdiqlə və çıx
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
