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
import { AnalitikaTab } from './tabs/analitika-tab'

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
  const [activeTab, setActiveTab] = useState(ZAL_TABS[0].key) // 'analitika' is now the first tab

  function renderTab() {
    switch (activeTab) {
      case 'analitika':  return <AnalitikaTab />
      case 'melumatlar': return <ZalMelumatlarTab zal={zal} isNew={isNew} />
      case 'mesqciler':  return <MesqcilerTab mesqciler={zal.mesqciler} zalName={zal.name} />
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
    <div className="flex flex-col gap-6">
      {/* Sub-header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Super admin- Zal Detail - Analitika
        </span>
      </div>

      {/* Title row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{isNew ? 'Yeni Zal' : zal.name}</h1>
          {!isNew && (
            <span className="flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-green-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Aktiv
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-8 overflow-x-auto" aria-label="Zal bölmələri">
          {ZAL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 border-b-2 pb-4 text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-[#00B4CC] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
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
