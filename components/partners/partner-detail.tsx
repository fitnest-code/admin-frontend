'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Ban, Bell, Mail, MessageSquare, Upload, Lock, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerProfile } from '@/modules/customers'
import { blockUser, unblockUser, resetUserPassword } from '@/modules/customers/api/customers.service'
import { getCustomerStatusLabel, normalizeCustomerStatus, type UiCustomerStatus } from '../customers/list/customer-list-utils'
import { PushModal, SmsModal } from '../customers/list/customer-message-modals'

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
  icon: Icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        danger
          ? 'border-red-200 bg-red-50/40 text-red-600 hover:bg-red-50 hover:border-red-300'
          : 'border-border bg-white text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs',
      )}
    >
      <Icon size={18} className={cn('shrink-0', danger ? 'text-red-500' : 'text-[#00B4CC]')} /> 
      <span>{label}</span>
    </button>
  )
}

export function PartnerDetail({ customer: initialCustomer }: { customer: CustomerProfile }) {
  const router = useRouter()
  const [customer, setCustomer] = useState(initialCustomer)
  const [pushOpen, setPushOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [blockLoading, setBlockLoading] = useState(false)

  const status = normalizeCustomerStatus(customer.userStatus)
  const initials = `${customer.name?.[0] ?? ''}${customer.surname?.[0] ?? ''}`.toUpperCase()
  const fullName = customer.fullName || [customer.name, customer.surname].filter(Boolean).join(' ') || 'Adsız'

  const isSuper = customer.role === 'ROLE_GYM_SUPER_ADMIN'
  const roleLabel = isSuper ? 'Super admin' : 'Admin'

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword.trim()) return

    setPwdLoading(true)
    setPwdMsg(null)
    try {
      await resetUserPassword(customer.id, newPassword.trim())
      setPwdMsg({ text: 'Şifrə uğurla yeniləndi.', isError: false })
      setNewPassword('')
    } catch (err: any) {
      console.error(err)
      setPwdMsg({ text: err.message || 'Şifrə yenilənərkən xəta baş verdi.', isError: true })
    } finally {
      setPwdLoading(false)
    }
  }

  async function handleBlockToggle() {
    setBlockLoading(true)
    try {
      if (status === 'blocked') {
        await unblockUser(customer.id)
        setCustomer(prev => ({ ...prev, userStatus: 'ACTIVE' }))
      } else {
        await blockUser(customer.id)
        setCustomer(prev => ({ ...prev, userStatus: 'DELETED' })) // 'DELETED' maps to blocked in UI
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
          onClick={() => router.push('/partners')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Geri qayıt
        </button>
      </div>

      {/* Top Profile Card Header */}
      <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-6">
          <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-[#00B4CC]/10 font-bold text-2xl text-[#00B4CC] ring-4 ring-[#00B4CC]/5">
            {initials || 'P'}
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

          <div className="h-8 w-[1px] bg-border shrink-0 self-center" />

          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">Platforma</span>
            <strong className="text-sm font-medium text-foreground">{formatValue(customer.platform) || 'İOS'}</strong>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        {/* Left Area: Profile Information Categories */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Personal Data Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Profil məlumatları</h2>
            </div>
            <div className="flex flex-col">
              <InfoRow label="Rol:" value={roleLabel} />
              <InfoRow label="Telefon nömrəsi:" value={formatValue(customer.phoneNumber)} />
              <InfoRow label="Email:" value={formatValue(customer.email)} />
            </div>
          </div>

          {/* Password Reset Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Şifrəni yenilə</h2>
            </div>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Yeni Şifrə</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <input
                    type="password"
                    placeholder="Yeni şifrəni daxil edin"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-border outline-none focus:border-[#00B4CC] text-sm transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={pwdLoading || !newPassword.trim()}
                className="w-fit px-5 h-10 rounded-lg bg-[#00B4CC] hover:bg-[#009fb5] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                <span>Şifrəni yenilə</span>
              </button>
              {pwdMsg && (
                <p className={cn("text-xs font-semibold mt-1", pwdMsg.isError ? "text-red-500" : "text-green-600")}>
                  {pwdMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Area: Admin Actions Panel */}
        <div className="w-full lg:w-[411px] shrink-0">
          <div className="flex flex-col rounded-xl bg-white border border-border p-5 shadow-xs gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">Əməliyyatlar</h2>
            </div>
            <div className="flex flex-col gap-3">
              <OpsBtn icon={Bell} label="Push bildiriş göndər" onClick={() => setPushOpen(true)} />
              <OpsBtn icon={MessageSquare} label="SMS göndər" onClick={() => setSmsOpen(true)} />
              <OpsBtn icon={Mail} label="Email göndər" onClick={() => {}} />
              <OpsBtn icon={Upload} label="Export" onClick={() => {}} />
              <div className="pt-2 border-t border-border/60">
                <OpsBtn 
                  icon={Ban} 
                  label={status === 'blocked' ? "Bloku aç" : "Block"} 
                  onClick={handleBlockToggle} 
                  danger={status !== 'blocked'} 
                  disabled={blockLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Invoked Modals */}
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
    </div>
  )
}
