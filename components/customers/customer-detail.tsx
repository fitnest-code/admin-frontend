'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ban, Bell, Mail, MessageSquare, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerProfile } from '@/modules/customers'
import { getCustomerStatusLabel, normalizeCustomerStatus, type UiCustomerStatus } from './list/customer-list-utils'
import { SubscriptionTab } from './tabs/subscription-tab'
import { PaymentsTab } from './tabs/payments-tab'
import { AccessTab } from './tabs/access-tab'

const CUSTOMER_TABS = [
  { key: 'profile', label: 'Profil məlumatları' },
  { key: 'subscription', label: 'Abunəlik məlumatları' },
  { key: 'payments', label: 'Ödəniş məlumatları' },
  { key: 'access', label: 'Giriş / QR scan tarixi' },
]

const STATUS_STYLES = {
  active: 'bg-green-600 text-white',
  inactive: 'bg-[#6B7280] text-white',
  blocked: 'bg-red-600 text-white',
} satisfies Record<UiCustomerStatus, string>

function formatValue(value: string | number | null | undefined, suffix?: string) {
  if (value === null || value === undefined || value === '') return 'Məlumat yoxdur'
  return suffix ? `${value} ${suffix}` : String(value)
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

function OpsBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
        danger
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-border text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC]',
      )}
    >
      <Icon size={14} className="shrink-0" /> {label}
    </button>
  )
}

export function CustomerDetail({ customer }: { customer: CustomerProfile }) {
  const router = useRouter()
  const [tab, setTab] = useState('profile')
  const status = normalizeCustomerStatus(customer.userStatus)
  const initials = `${customer.name?.[0] ?? ''}${customer.surname?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.push('/customers')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Geri qayıt
      </button>

      <div className="border-b border-border">
        <nav className="-mb-px flex overflow-x-auto">
          {CUSTOMER_TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                tab === item.key ? 'border-[#00B4CC] text-[#00B4CC]' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'profile' && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
          <div className="flex flex-1 flex-col gap-5">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#00B4CC26] text-xl font-bold text-[#00B4CC]">
                {initials || 'FN'}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-foreground">
                    {[customer.name, customer.surname].filter(Boolean).join(' ') || 'Adsız'}
                  </span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status])}>
                    {getCustomerStatusLabel(status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    User ID: <strong className="text-foreground">{customer.id}</strong>
                  </span>
                  <span>
                    Qeydiyyat tarixi: <strong className="text-foreground">{formatValue(customer.registeredAt)}</strong>
                  </span>
                  <span>
                    Platforma: <strong className="text-foreground">{formatValue(customer.platform)}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Şəxsi məlumatlar</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Telefon nömrəsi:" value={formatValue(customer.phoneNumber)} />
                <InfoRow label="Email:" value={formatValue(customer.email)} />
                <InfoRow label="Doğum tarixi:" value={formatValue(customer.birthDate)} />
                <InfoRow label="Hədəf:" value={formatValue(customer.goal)} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Bədən göstəriciləri</h3>
              <div className="flex flex-col gap-3">
                <InfoRow label="Boy:" value={formatValue(customer.height, 'cm')} />
                <InfoRow label="Çəki:" value={formatValue(customer.weight, 'kg')} />
                <InfoRow label="BMI indeksi:" value={formatValue(customer.bmi)} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-56 shrink-0 lg:self-stretch">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Əməliyyatlar</h3>
              <div className="flex flex-col gap-2">
                <OpsBtn icon={Bell} label="Push bildiriş göndər" onClick={() => {}} />
                <OpsBtn icon={MessageSquare} label="SMS göndər" onClick={() => {}} />
                <OpsBtn icon={Mail} label="Email göndər" onClick={() => {}} />
                <OpsBtn icon={Upload} label="Export" onClick={() => {}} />
                <OpsBtn icon={Ban} label="Block" onClick={() => {}} danger />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'subscription' && (
        <SubscriptionTab userId={String(customer.id)} />
      )}
      {tab === 'payments' && (
        <PaymentsTab userId={String(customer.id)} />
      )}
      {tab === 'access' && (
        <AccessTab userId={String(customer.id)} />
      )}
    </div>
  )
}
