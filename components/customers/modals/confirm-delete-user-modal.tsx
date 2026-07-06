'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useT } from '@/lib/i18n'

interface ConfirmDeleteUserModalProps {
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDeleteUserModal({ onConfirm, onCancel, isLoading }: ConfirmDeleteUserModalProps) {
  const [mounted, setMounted] = useState(false)
  const t = useT()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={(e) => !isLoading && e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[548px] min-h-[170px] rounded-[12px] bg-white flex flex-col items-center justify-center p-10 gap-7 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
        <div className="text-[26px] font-medium text-[#131212] leading-[40px] text-center">
          {t.lists.deleteUserConfirmTitle || 'İstifadəçini silmək istədiyinizdən əminsiniz?'}
        </div>
        
        <div className="w-full flex items-center justify-between gap-5">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="text-[16px] font-medium text-black leading-[24px]">{t.lessonHours.deleteConfirmCancel || 'Xeyr'}</span>
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span className="text-[16px] font-medium text-white leading-[24px]">{t.lessonHours.deleteConfirmYes || 'Bəli'}</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
