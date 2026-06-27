'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ZAL_TABS, type Zal } from '@/lib/zallar-data'
import { ZalMelumatlarTab } from './tabs/zal-melumatlar-tab'
import { MesqcilerTab } from './tabs/mesqciler-tab'
import { ZalAdminiTab } from './tabs/zal-admini-tab'
import { AnalitikaTab } from './tabs/analitika-tab'
import { ZalWorkHoursTab } from './tabs/zal-work-hours-tab'
import { ZalAbunelikTab } from './tabs/zal-abunelik-tab'
import { GymInfoAdminResponseV2 } from '@/lib/types/gym'

interface ZalDetailProps {
  gymId: string
  gymDetails?: GymInfoAdminResponseV2
  zal?: Zal
  isNew?: boolean
}

export function ZalDetail({ gymId, gymDetails, zal, isNew = false }: ZalDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTabState] = useState(tabParam || ZAL_TABS[0].key)

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam)
    }
  }, [tabParam])

  const setActiveTab = (tabKey: string) => {
    setActiveTabState(tabKey)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabKey)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const gymName = gymDetails?.name || zal?.name || 'Zal'

  function renderTab() {
    switch (activeTab) {
      case 'analitika':  return <AnalitikaTab gymId={gymId} />
      case 'melumatlar': return <ZalMelumatlarTab gymId={gymId} gymDetails={gymDetails} zal={zal} isNew={isNew} />
      case 'work-hours': return <ZalWorkHoursTab gymId={gymDetails?.id || Number(gymId)} />
      case 'mesqciler':  return <MesqcilerTab gymId={gymId} zalName={gymName} />
      case 'admin':      return <ZalAdminiTab admins={zal?.admins || []} />
      case 'abunelik':   return <ZalAbunelikTab gymId={gymId} />
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
          Super admin- Zal Detail - {activeTab.toUpperCase()}
        </span>
      </div>

      {/* Title row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{isNew ? 'Yeni Zal' : gymName}</h1>
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
