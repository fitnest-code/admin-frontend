'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { deleteUserSubscriptions } from '@/modules/customers/api/customers.service'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDeleteSubscriptionModalProps {
  userId: string | number
  onClose: () => void
  onSuccess: () => void
}

export function ConfirmDeleteSubscriptionModal({ userId, onClose, onSuccess }: ConfirmDeleteSubscriptionModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, message: string, type: 'success'|'error'}>({ isOpen: false, message: '', type: 'success' })

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteUserSubscriptions(userId)
      setModalConfig({ isOpen: true, message: 'İstifadəçinin abunəliyi uğurla silindi.', type: 'success' })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setModalConfig({ isOpen: true, message: err.message || 'Abunəlik silinərkən xəta baş verdi.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[440px] rounded-xl border border-border bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 font-sans">
          <div className="flex items-start gap-3 border-b border-border pb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Abunəliyin silinməsi</h3>
              <p className="text-xs text-muted-foreground mt-0.5">İstifadəçi ID: {userId}</p>
            </div>
          </div>

          <div className="text-sm text-foreground leading-relaxed">
            Bu istifadəçinin bütün abunəliklərini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-55"
            >
              Ləğv et
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-55"
            >
              {loading ? 'Silinir...' : 'Bəli, sil'}
            </button>
          </div>
        </div>
      </div>

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}
