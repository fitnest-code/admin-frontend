'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { getAllRoles, changeUserRole, type UserRoleDto } from '@/modules/customers/api/customers.service'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

interface ChangeRoleModalProps {
  userId: number
  currentRole: string | null
  onClose: () => void
  onSuccess: (newRole: string) => void
}

export function ChangeRoleModal({ userId, currentRole, onClose, onSuccess }: ChangeRoleModalProps) {
  const [mounted, setMounted] = useState(false)
  const t = useT()
  const [roles, setRoles] = useState<UserRoleDto[]>([])
  const [selectedRole, setSelectedRole] = useState(currentRole || 'ROLE_USER')
  const [loading, setLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, message: string, type: 'success'|'error'}>({ isOpen: false, message: '', type: 'success' })

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'

    async function fetchRoles() {
      try {
        const data = await getAllRoles()
        setRoles(data)
      } catch (err) {
        console.error('Failed to load roles:', err)
        // Fallback roles if API fails or mock isn't fully ready
        setRoles([
          { id: 'ROLE_ADMIN', name: 'Sistem admini' },
          { id: 'ROLE_FITNEST_STAFF', name: 'Fitnest Komandası' },
          { id: 'ROLE_GYM_SUPER_ADMIN', name: 'Zal Super Admini' },
          { id: 'ROLE_GYM_ADMIN', name: 'Zal Admini' },
          { id: 'ROLE_USER', name: 'Müştəri' },
        ])
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()

    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    try {
      await changeUserRole(userId, selectedRole)
      setModalConfig({ isOpen: true, message: t.modals.roleUpdateSuccess, type: 'success' })
      setTimeout(() => {
        onSuccess(selectedRole)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setModalConfig({ isOpen: true, message: err.message || t.modals.roleUpdateError, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function getRoleLabel(roleId: string, defaultName: string) {
    const key = `role_${roleId}` as keyof typeof t.modals
    if (t.modals[key]) return t.modals[key] as string
    return defaultName
  }

  if (!mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[548px] rounded-[12px] bg-white flex flex-col p-8 gap-6 shadow-2xl animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6 w-full">
          <div className="border-b border-border pb-3 text-left">
            <h3 className="text-[24px] font-bold text-[#131212] leading-[36px]">{t.modals.changeRoleTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.modals.userIdLabel} <span className="font-semibold text-foreground">{userId}</span></p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-foreground text-left">{t.modals.selectNewRole}</label>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-[#00B4CC]" />
                <span>{t.modals.rolesLoading}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {roles.map((r) => {
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all duration-200 outline-none cursor-pointer",
                        isSelected 
                          ? "border-[#00B4CC] bg-[#00B4CC]/5 text-[#00B4CC] font-semibold"
                          : "border-[#cecfd2]/60 bg-white text-foreground hover:bg-slate-50"
                      )}
                    >
                      <span className="text-sm font-medium">{getRoleLabel(r.id, r.name)}</span>
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                        isSelected ? "border-[#00B4CC] bg-[#00B4CC]" : "border-[#cecfd2]"
                      )}>
                        {isSelected && <Check size={10} className="text-white font-bold" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50 disabled:opacity-55 cursor-pointer text-[16px] font-medium text-black"
            >
              {t.modals.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || loadingRoles || selectedRole === currentRole}
              className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-[16px] font-medium text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{t.modals.loading}</span>
                </div>
              ) : (
                t.modals.save
              )}
            </button>
          </div>
        </form>
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
