'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserCog, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerProfile } from '@/modules/customers'
import { blockUser, unblockUser, resetDeviceLimit } from '@/modules/customers/api/customers.service'
import { getCustomerStatusLabel, normalizeCustomerStatus, type UiCustomerStatus } from '../customers/list/customer-list-utils'
import { PushModal, SmsModal } from '../customers/list/customer-message-modals'
import { ChangeRoleModal } from '../customers/modals/change-role-modal'
import { ConfirmDeleteSubscriptionModal } from '../customers/modals/confirm-delete-subscription-modal'
import { ResetPasswordModal } from '../partners/reset-password-modal'
import { ResetDeviceLimitModal } from '../customers/modals/reset-device-limit-modal'

const STATUS_STYLES = {
  active: 'bg-[#166728] text-white',
  inactive: 'bg-[#6B7280] text-white',
  blocked: 'bg-red-600 text-white',
} satisfies Record<UiCustomerStatus, string>

function formatValue(value: string | number | null | undefined, suffix?: string) {
  if (value === null || value === undefined || value === '') return 'Məlumat yoxdur'
  return suffix ? `${value} ${suffix}` : String(value)
}

function formatDateTimeClean(val?: string | null) {
  if (!val) return 'Məlumat yoxdur'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) {
      return val.split('.')[0].replace('T', ' / ')
    }
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(-2)
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${dd}.${mm}.${yy} / ${hh}:${min}`
  } catch {
    return val
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40 last:border-0 first:pt-0 last:pb-0">
      <span className="text-sm font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  )
}

function OpsBtn({
  src,
  label,
  onClick,
}: {
  src: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs transition-all duration-200 active:scale-[0.98]"
    >
      <Image src={src} width={18} height={18} alt="" className="shrink-0" />
      <span>{label}</span>
    </button>
  )
}

export function AdminDetail({ customer: initialCustomer }: { customer: CustomerProfile }) {
  const router = useRouter()
  const [customer, setCustomer] = useState(initialCustomer)
  const [pushOpen, setPushOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [deleteSubOpen, setDeleteSubOpen] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [resetDeviceLimitOpen, setResetDeviceLimitOpen] = useState(false)

  function handleResetDeviceLimit() {
    setResetDeviceLimitOpen(true)
  }

  const status = normalizeCustomerStatus(customer.userStatus)
  const initials = `${customer.name?.[0] ?? ''}${customer.surname?.[0] ?? ''}`.toUpperCase()
  const fullName = customer.fullName || [customer.name, customer.surname].filter(Boolean).join(' ') || 'Adsız'

  const isSuper = customer.role === 'ROLE_SUPER_ADMIN' || customer.role === 'ROLE_GYM_SUPER_ADMIN'
  const roleLabel = isSuper ? 'Super admin' : (customer.role === 'ROLE_ADMIN' ? 'Sistem admini' : 'Admin')
  const roleIcon = isSuper ? '/superAdmin.svg' : '/admin.svg'

  async function handleBlockToggle() {
    setBlockLoading(true)
    try {
      if (status === 'blocked') {
        await unblockUser(customer.id)
        setCustomer(prev => ({ ...prev, userStatus: 'ACTIVE' }))
      } else {
        await blockUser(customer.id)
        setCustomer(prev => ({ ...prev, userStatus: 'DELETED' }))
      }
    } catch (err) {
      console.error('Failed to toggle block status:', err)
    } finally {
      setBlockLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admins')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Geri qayıt
        </button>
      </div>

      {/* Top Profile Card Header */}
      <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-6">
          <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-[#00B4CC]/10 font-bold text-2xl text-[#00B4CC] ring-4 ring-[#00B4CC]/5">
            {initials || 'A'}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[20px] font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase shadow-2xs', STATUS_STYLES[status])}>
                <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                <span>{getCustomerStatusLabel(status)}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Rol: <span className="text-[#00B4CC] font-medium">{roleLabel}</span>
            </span>
          </div>
        </div>

        {/* Right Metadata Flex Grid */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 bg-[#FAFAFA] px-5 py-3 rounded-lg border border-border/60 shadow-2xs shrink-0">
          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">User ID</span>
            <strong className="text-sm font-medium text-foreground">{customer.id}</strong>
          </div>

          <div className="h-8 w-[1px] bg-border shrink-0 self-center" />

          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">Qeydiyyat tarixi</span>
            <strong className="text-sm font-medium text-foreground">{formatDateTimeClean(customer.registeredAt)}</strong>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        {/* Left Column: Personal info & Reset Password */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Personal Info Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Şəxsi məlumatlar</h2>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40">
                <span className="text-sm font-medium text-muted-foreground shrink-0">Rol:</span>
                <div className="flex items-center gap-1.5 rounded-full bg-[#00B4CC]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00B4CC]">
                  <Image src={roleIcon} width={12} height={12} alt="" className="shrink-0" />
                  <span>{roleLabel}</span>
                </div>
              </div>
              <InfoRow label="Telefon nömrəsi:" value={formatValue(customer.phoneNumber)} />
              <InfoRow label="Email:" value={formatValue(customer.email)} />
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Şifrə təhlükəsizliyi</h2>
            </div>
            <button 
              onClick={() => setResetPwdOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#00B4CC] bg-white px-4 py-2.5 text-sm font-semibold text-[#00B4CC] hover:bg-[#00B4CC]/5 active:scale-[0.98] transition-all duration-200"
            >
              <Image src="/resetPassword.svg" width={16} height={16} alt="" />
              <span>Şifrəni yenilə</span>
            </button>
          </div>
        </div>

        {/* Right Column: Operations Panel */}
        <div className="w-full lg:w-[411px] shrink-0">
          <div className="flex flex-col rounded-xl bg-white border border-border p-5 shadow-xs gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Əməliyyatlar</h2>
            </div>
            <div className="flex flex-col gap-3">
              <OpsBtn src="/push-notification.svg" label="Push bildiriş göndər" onClick={() => setPushOpen(true)} />
              <OpsBtn src="/sms-icon.svg" label="SMS göndər" onClick={() => setSmsOpen(true)} />
              <OpsBtn src="/mail-icon.svg" label="Email göndər" onClick={() => {}} />
              <OpsBtn src="/export-icon.svg" label="Export" onClick={() => {}} />
              <button
                onClick={() => setRoleOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs transition-all duration-200 active:scale-[0.98]"
              >
                <UserCog size={18} className="shrink-0 text-[#00B4CC]" />
                <span>Rolunu dəyiş</span>
              </button>
              <button
                onClick={handleResetDeviceLimit}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs transition-all duration-200 active:scale-[0.98]"
              >
                <RefreshCw size={18} className="shrink-0 text-[#00B4CC]" />
                <span>Cihaz limitini sıfırla</span>
              </button>
              <div className="pt-2 border-t border-border/60 flex flex-col gap-3">
                <button
                  onClick={() => setDeleteSubOpen(true)}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50/40 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  <span>Abunəliyi sil</span>
                </button>
                <button
                  onClick={handleBlockToggle}
                  disabled={blockLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50/40 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-55"
                >
                  <span>{status === 'blocked' ? "Bloku aç" : "Block"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {pushOpen && (
        <PushModal 
          selectedUsers={[{ id: customer.id, fullName: fullName, email: customer.email, phoneNumber: customer.phoneNumber }]} 
          onClose={() => setPushOpen(false)} 
        />
      )}
      {smsOpen && (
        <SmsModal 
          selectedUsers={[{ id: customer.id, fullName: fullName, email: customer.email, phoneNumber: customer.phoneNumber }]} 
          onClose={() => setSmsOpen(false)} 
        />
      )}
      {resetPwdOpen && (
        <ResetPasswordModal 
          userId={customer.id} 
          onClose={() => setResetPwdOpen(false)} 
        />
      )}
      {roleOpen && (
        <ChangeRoleModal
          userId={customer.id}
          currentRole={customer.role ?? null}
          onClose={() => setRoleOpen(false)}
          onSuccess={(newRole) => setCustomer(prev => ({ ...prev, role: newRole }))}
        />
      )}
      {deleteSubOpen && (
        <ConfirmDeleteSubscriptionModal
          userId={customer.id}
          onClose={() => setDeleteSubOpen(false)}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
      {resetDeviceLimitOpen && (
        <ResetDeviceLimitModal
          userId={customer.id}
          onClose={() => setResetDeviceLimitOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
