'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { resetDeviceLimit } from '@/modules/customers/api/customers.service'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

interface ResetDeviceLimitModalProps {
  userId: string | number
  onClose: () => void
  onSuccess: () => void
}

export function ResetDeviceLimitModal({ userId, onClose, onSuccess }: ResetDeviceLimitModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '', type: 'success' as 'success' | 'error' })

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleConfirm() {
    setIsLoading(true)
    try {
      await resetDeviceLimit(Number(userId))
      setSuccessModal({ isOpen: true, message: 'Cihaz limiti uğurla sıfırlandı.', type: 'success' })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setSuccessModal({ isOpen: true, message: err.message || 'Cihaz limiti sıfırlanmadı.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={(e) => !isLoading && e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[548px] min-h-[170px] rounded-[12px] bg-white flex flex-col items-center justify-center p-10 gap-7 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
        <div className="text-[24px] font-medium text-[#131212] leading-[36px] text-center">
          Cihaz limitini sıfırlamaq istədiyinizdən əminsiniz?
        </div>
        
        <div className="w-full flex items-center justify-between gap-5">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50 disabled:opacity-55"
          >
            <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
          </button>
          
          <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span className="text-[16px] font-medium text-white leading-[24px]">Bəli</span>
              )}
            </div>
          </button>
        </div>
      </div>

      <SuccessAnimationModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        message={successModal.message}
        type={successModal.type}
      />
    </div>,
    document.body
  )
}
