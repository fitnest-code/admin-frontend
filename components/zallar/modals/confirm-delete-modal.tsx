'use client'

import { Trash2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({ name, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Zalı sil</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{name}</span> zalını silmək istədiyinizə əminsiniz?
            Bu əməliyyat geri qaytarıla bilməz.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Ləğv et
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
