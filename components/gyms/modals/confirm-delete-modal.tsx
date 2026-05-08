'use client'

import { X } from 'lucide-react'

interface ConfirmDeleteModalProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({ name, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">İdman zalını silin</h2>
          <button onClick={onCancel} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{name}</span> zalını silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              Ləğv et
            </button>
            <button onClick={onConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors">
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
