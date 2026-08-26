'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, UserCog, RefreshCw, Ban, Trash2, ShieldCheck, Bell, MessageSquare, Mail, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerProfile } from '@/modules/customers'
import { resetDeviceLimit } from '@/modules/customers/api/customers.service'
import { getCustomerStatusLabel, normalizeCustomerStatus, type UiCustomerStatus } from '../customers/list/customer-list-utils'
import { PushModal, SmsModal, EmailModal, BlockModal } from '../customers/list/customer-message-modals'
import { ChangeRoleModal } from '../customers/modals/change-role-modal'
import { ConfirmDeleteSubscriptionModal } from '../customers/modals/confirm-delete-subscription-modal'
import { AssignSubscriptionModal } from '../customers/modals/assign-subscription-modal'
import { ResetPasswordModal } from '../partners/reset-password-modal'
import { ResetDeviceLimitModal } from '../customers/modals/reset-device-limit-modal'
import { ConfirmDeleteUserModal } from '../customers/modals/confirm-delete-user-modal'
import { useHardDeleteUserMutation } from '@/modules/customers'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n'
import { SubscriptionTab } from '../customers/tabs/subscription-tab'
import { PaymentsTab } from '../customers/tabs/payments-tab'
import { AccessTab } from '../customers/tabs/access-tab'

const STATUS_STYLES = {
  active: 'bg-[#166728] text-white',
  inactive: 'bg-[#6B7280] text-white',
  blocked: 'bg-red-600 text-white',
  pending_registration: 'bg-amber-600 text-white',
} satisfies Record<UiCustomerStatus, string>

const CUSTOMER_TABS = [
  { key: 'profile', labelKey: 'tabProfile' },
  { key: 'subscription', labelKey: 'tabSubscription' },
  { key: 'payments', labelKey: 'tabPayments' },
  { key: 'access', labelKey: 'tabAccess' },
] as const

function formatValue(value: string | number | null | undefined, fallback: string, suffix?: string) {
  if (value === null || value === undefined || value === '') return fallback
  return suffix ? `${value} ${suffix}` : String(value)
}

function formatDateTimeClean(val: string | null | undefined, fallback: string) {
  if (!val) return fallback
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
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
        danger
          ? 'border-red-200 bg-red-50/40 text-red-600 hover:bg-red-50 hover:border-red-300'
          : 'border-border bg-white text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs',
        disabled && 'opacity-55 cursor-not-allowed active:scale-100',
      )}
    >
      <Icon size={18} className={cn('shrink-0', danger ? 'text-red-500' : 'text-[#00B4CC]')} /> 
      <span>{label}</span>
    </button>
  )
}

export function AdminDetail({ customer: initialCustomer }: { customer: CustomerProfile }) {
  const router = useRouter()
  const t = useT()
  const [customer, setCustomer] = useState(initialCustomer)
  const [tab, setTab] = useState('profile')
  const [pushOpen, setPushOpen] = useState(false)
  const [smsOpen, setSmsOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [deleteSubOpen, setDeleteSubOpen] = useState(false)
  const [assignSubOpen, setAssignSubOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [resetDeviceLimitOpen, setResetDeviceLimitOpen] = useState(false)
  const [deleteUserOpen, setDeleteUserOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  })

  const deleteUserMutation = useHardDeleteUserMutation()

  function handleResetDeviceLimit() {
    setResetDeviceLimitOpen(true)
  }

  const status = normalizeCustomerStatus(customer.userStatus)
  const initials = `${customer.name?.[0] ?? ''}${customer.surname?.[0] ?? ''}`.toUpperCase()
  const fullName = customer.fullName || [customer.name, customer.surname].filter(Boolean).join(' ') || 'Adsız'

  const isSuper = customer.role === 'ROLE_SUPER_ADMIN' || customer.role === 'ROLE_GYM_SUPER_ADMIN'
  const roleLabel = isSuper ? 'Super admin' : (customer.role === 'ROLE_ADMIN' ? 'Sistem admini' : 'Admin')
  const roleIcon = isSuper ? '/superAdmin.svg' : '/admin.svg'

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(customer.role === 'ROLE_FITNEST_STAFF' ? '/fitnest-staff' : '/admins')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> {t.details.goBack}
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
                <span>
                  {status === 'active' 
                    ? t.details.activeStatus 
                    : status === 'inactive' 
                      ? t.details.inactiveStatus 
                      : t.details.blockedStatus}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {t.details.role}: <span className="text-[#00B4CC] font-medium">{roleLabel}</span>
            </span>
          </div>
        </div>

        {/* Right Metadata Flex Grid */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 bg-[#FAFAFA] px-5 py-3 rounded-lg border border-border/60 shadow-2xs shrink-0">
          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">{t.details.userId}</span>
            <strong className="text-sm font-medium text-foreground">{customer.id}</strong>
          </div>

          <div className="h-8 w-[1px] bg-border shrink-0 self-center" />

          <div className="flex flex-col gap-0.5 text-left">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">{t.details.registrationDate}</span>
            <strong className="text-sm font-medium text-foreground">{formatDateTimeClean(customer.registeredAt, t.details.noData)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex overflow-x-auto gap-2">
          {CUSTOMER_TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                'shrink-0 border-b-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200',
                tab === item.key 
                  ? 'border-[#00B4CC] text-[#00B4CC]' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border/60',
              )}
            >
              {t.details[item.labelKey]}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Layout */}
      {tab === 'profile' && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        {/* Left Column: Personal info & Reset Password */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Personal Info Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">{t.details.personalInfo}</h2>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40">
                <span className="text-sm font-medium text-muted-foreground shrink-0">{t.details.role}:</span>
                <div className="flex items-center gap-1.5 rounded-full bg-[#00B4CC]/10 px-2.5 py-0.5 text-xs font-semibold text-[#00B4CC]">
                  <Image src={roleIcon} width={12} height={12} alt="" className="shrink-0" />
                  <span>{roleLabel}</span>
                </div>
              </div>
              <InfoRow label={t.details.phoneNumber} value={formatValue(customer.phoneNumber, t.details.noData)} />
              <InfoRow label={t.details.email} value={formatValue(customer.email, t.details.noData)} />
            </div>
          </div>

          {/* Reset Password Card */}
          <div className="rounded-xl bg-white border border-border p-5 shadow-xs flex flex-col gap-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">{t.details.passwordSecurity}</h2>
            </div>
            <button 
              onClick={() => setResetPwdOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#00B4CC] bg-white px-4 py-2.5 text-sm font-semibold text-[#00B4CC] hover:bg-[#00B4CC]/5 active:scale-[0.98] transition-all duration-200"
            >
              <Image src="/resetPassword.svg" width={16} height={16} alt="" />
              <span>{t.details.resetPassword}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Operations Panel */}
        <div className="w-full lg:w-[411px] shrink-0">
          <div className="flex flex-col rounded-xl bg-white border border-border p-5 shadow-xs gap-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-[16px] font-bold text-foreground tracking-tight">{t.details.operations}</h2>
            </div>
            <div className="flex flex-col gap-3">
              <OpsBtn icon={Bell} label={t.details.sendPush} onClick={() => setPushOpen(true)} />
              <OpsBtn icon={MessageSquare} label={t.details.sendSms} onClick={() => setSmsOpen(true)} />
              <OpsBtn icon={Mail} label={t.details.sendEmail} onClick={() => setEmailOpen(true)} />
              <OpsBtn icon={Upload} label={t.details.export} onClick={() => {}} />
              <OpsBtn icon={UserCog} label={t.details.changeRole} onClick={() => setRoleOpen(true)} />
              <OpsBtn icon={RefreshCw} label={t.details.resetDeviceLimit} onClick={handleResetDeviceLimit} />
              <div className="pt-2 border-t border-border/60 flex flex-col gap-3">
                <OpsBtn icon={ShieldCheck} label={t.modals.assignSubscriptionTitle || 'Abunəlik təyin et'} onClick={() => setAssignSubOpen(true)} />
                <OpsBtn icon={Trash2} label={t.details.deleteSubscription} onClick={() => setDeleteSubOpen(true)} danger />
                <OpsBtn icon={Trash2} label={t.details.deleteUser} onClick={() => setDeleteUserOpen(true)} danger />
                <OpsBtn 
                  icon={Ban} 
                  label={status === 'blocked' ? t.details.unblock : t.details.block} 
                  onClick={() => setBlockOpen(true)} 
                  danger 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {tab === 'subscription' && <SubscriptionTab userId={String(customer.id)} />}
      {tab === 'payments' && <PaymentsTab userId={String(customer.id)} />}
      {tab === 'access' && <AccessTab userId={String(customer.id)} />}

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
      {emailOpen && (
        <EmailModal 
          selectedUsers={[{ id: customer.id, fullName: fullName, email: customer.email, phoneNumber: customer.phoneNumber }]} 
          onClose={() => setEmailOpen(false)} 
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
      {assignSubOpen && (
        <AssignSubscriptionModal
          userId={customer.id}
          onClose={() => setAssignSubOpen(false)}
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
      {blockOpen && (
        <BlockModal 
          selectedUsers={[{ id: customer.id, fullName: fullName, email: customer.email, phoneNumber: customer.phoneNumber, userStatus: customer.userStatus }]} 
          mode={status === 'blocked' ? 'unblock' : 'block'}
          onClose={() => setBlockOpen(false)} 
          onSuccess={() => {
            if (status === 'blocked') {
              setCustomer(prev => ({ ...prev, userStatus: 'ACTIVE' }))
            } else {
              setCustomer(prev => ({ ...prev, userStatus: 'DELETED' }))
            }
          }}
        />
      )}
      {deleteUserOpen && (
        <ConfirmDeleteUserModal
          isLoading={deleteUserMutation.isPending}
          onConfirm={() => {
            deleteUserMutation.mutate(customer.id, {
              onSuccess: () => {
                setDeleteUserOpen(false)
                setModalConfig({ isOpen: true, message: t.details.userDeleted, type: "success" })
                const redirectPath = customer.role === 'ROLE_FITNEST_STAFF' ? '/fitnest-staff' : '/admins'
                setTimeout(() => {
                  router.push(redirectPath)
                }, 1000)
              },
              onError: (err: any) => {
                setModalConfig({ isOpen: true, message: err?.message || t.details.userDeleteFailed, type: "error" })
              }
            })
          }}
          onCancel={() => setDeleteUserOpen(false)}
        />
      )}
      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )
}
