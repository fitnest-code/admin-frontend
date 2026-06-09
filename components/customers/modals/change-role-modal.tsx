'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
      setModalConfig({ isOpen: true, message: 'İstifadəçi rolu uğurla dəyişdirildi.', type: 'success' })
      setTimeout(() => {
        onSuccess(selectedRole)
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setModalConfig({ isOpen: true, message: err.message || 'Rol dəyişdirilərkən xəta baş verdi.', type: 'error' })
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
        <form onSubmit={handleSave} className="flex flex-col gap-5 font-sans">
          <div className="border-b border-border pb-3">
            <h3 className="text-lg font-bold text-foreground">Rolun dəyişdirilməsi</h3>
            <p className="text-xs text-muted-foreground mt-1">İstifadəçi ID: {userId}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">Yeni rol seçin</label>
            {loadingRoles ? (
              <div className="text-sm text-muted-foreground animate-pulse py-2">Rollar yüklənir...</div>
            ) : (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-[#00B4CC] focus:ring-1 focus:ring-[#00B4CC] transition-all"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={loading || loadingRoles || selectedRole === currentRole}
              className="rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00B4CC]/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Yüklənir...' : 'Yadda saxla'}
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
