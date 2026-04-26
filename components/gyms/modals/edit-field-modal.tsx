'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface EditFieldModalProps {
  label: string
  value: string
  multiline?: boolean
  onSave: (value: string) => void
  onClose: () => void
}

export function EditFieldModal({
  label,
  value,
  multiline = false,
  onSave,
  onClose,
}: EditFieldModalProps) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    // Place cursor at end
    const len = draft.length
    inputRef.current?.setSelectionRange(len, len)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(draft.trim())
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${label} redaktə et`}
    >
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{label} redaktə et</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Bağla"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            {multiline ? (
              <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors leading-relaxed"
                placeholder={`${label} daxil edin...`}
              />
            ) : (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#00B4CC] transition-colors"
                placeholder={`${label} daxil edin...`}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#00B4CC] px-5 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
            >
              Yadda saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
