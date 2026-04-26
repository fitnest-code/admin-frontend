'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ZAL_TABS, type Zal } from '@/lib/zallar-data'
import { ZalMelumatlarTab } from './tabs/zal-melumatlar-tab'
import { MesqcilerTab } from './tabs/mesqciler-tab'
import { GirisQrTab } from './tabs/giris-qr-tab'
import { ZalAdminiTab } from './tabs/zal-admini-tab'

interface ZalDetailProps {
  zal: Zal
  isNew?: boolean
}

const STATUS_STYLES = {
  aktiv:   'bg-green-100 text-green-700',
  deaktiv: 'bg-red-100 text-red-500',
}

export function ZalDetail({ zal, isNew = false }: ZalDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(ZAL_TABS[0].key)

  function renderTab() {
    switch (activeTab) {
      case 'melumatlar': return <ZalMelumatlarTab zal={zal} isNew={isNew} />
      case 'mesqciler':  return <MesqcilerTab mesqciler={zal.mesqciler} zalName={zal.name} />
      case 'qr':         return <GirisQrTab zalName={zal.name} />
      case 'admin':      return <ZalAdminiTab admins={zal.admins} />
      case 'abunelik':
      case 'reyting':
        return (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
            Bu bölmə tezliklə əlavə ediləcək.
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <button
        onClick={() => router.push('/zallar')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} aria-hidden />
        Geri qayıt
      </button>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">{isNew ? 'Yeni Zal' : zal.name}</h1>
        {!isNew && (
          <>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[zal.status])}>
              {zal.status === 'aktiv' ? 'Aktiv' : 'Deaktiv'}
            </span>
            <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
              Ödəniş
              <ChevronDown size={12} />
            </button>
            <button className="ml-1 text-red-400 hover:text-red-600 transition-colors text-xs font-medium">
              — Sil
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Zal bölmələri">
          {ZAL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-[#00B4CC] text-[#00B4CC]'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  )
}
