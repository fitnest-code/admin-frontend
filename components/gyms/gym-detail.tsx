'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GYM_TABS, type Gym } from '@/lib/gyms-data'
import { GymInfoTab }       from './tabs/gym-info-tab'
import { TrainersTab }      from './tabs/trainers-tab'
import { PlansTab }         from './tabs/plans-tab'
import { GymAdminsTab }     from './tabs/gym-admins-tab'
import { ReviewsTab }       from './tabs/reviews-tab'
import { GymCustomersTab }  from './tabs/gym-customers-tab'

interface GymDetailProps {
  gym: Gym
  isNew?: boolean
}

const STATUS_STYLES = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-500',
}

export function GymDetail({ gym, isNew = false }: GymDetailProps) {
  const router     = useRouter()
  const [tab, setTab] = useState(GYM_TABS[0].key)

  function renderTab() {
    switch (tab) {
      case 'info':      return <GymInfoTab gym={gym} gymId={gym.id} isNew={isNew} />
      case 'trainers':  return <TrainersTab gymId={gym.id} trainers={gym.trainers} gymName={gym.name} isNew={isNew} />
      case 'admins':    return <GymAdminsTab admins={gym.admins} />
      case 'plans':     return <PlansTab subscriptionTiers={gym.subscriptionTiers} services={gym.services} />
      case 'reviews':   return <ReviewsTab gymId={gym.id} />
      case 'customers': return <GymCustomersTab />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Back */}
      <button
        onClick={() => router.push('/gyms')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} aria-hidden />
        Geri qayıt
      </button>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">{isNew ? 'Yeni Zal' : gym.name}</h1>
        {!isNew && (
          <>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[gym.status])}>
              {gym.status === 'active' ? 'Aktiv' : 'Deaktiv'}
            </span>
            <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[#00B4CC] transition-colors">
              Ödəniş <ChevronDown size={12} />
            </button>
            <button className="ml-1 text-red-400 hover:text-red-600 transition-colors text-xs font-medium">
              — Sil
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex overflow-x-auto" aria-label="Zal bölmələri">
          {GYM_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'border-[#00B4CC] text-[#00B4CC]'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              aria-current={tab === t.key ? 'page' : undefined}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>{renderTab()}</div>
    </div>
  )
}
