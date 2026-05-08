'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GYM_TABS, type Gym } from '@/lib/gyms-data'
import { GymInfoTab }       from './tabs/gym-info-tab'
import { TrainersTab }      from './tabs/trainers-tab'
import { PlansTab }         from './tabs/plans-tab'
import { GymAdminsTab }     from './tabs/gym-admins-tab'
import { ReviewsTab }       from './tabs/reviews-tab'
import { GymCustomersTab }  from './tabs/gym-customers-tab'
import WorkingHoursPanel from './tabs/gym-working-hours-tab'
import { StepNavigationWarningModal } from './modals/step-navigation-warning-modal'
import { ExitConfirmationModal } from './modals/exit-confirmation-modal'
import { useGymStore } from '@/lib/store/gym-store'
import AddressTab from './tabs/gym-address-tab'
import GymImagesTab from './tabs/gym-images-tab'
import GymSubscriptionTab from './tabs/gym-subscription-tab'

interface GymDetailProps {
  gym: Gym
  isNew?: boolean
}

const STATUS_STYLES = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-500',
}


export function GymDetail({ gym, isNew = false }: GymDetailProps) {
  const router = useRouter()
  const { gymId, currentTab, setCurrentTab, resetGym } = useGymStore()

  const isCompletedRef = useRef(false)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNew && gymId && !isCompletedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    const handleUnload = () => {
      if (isNew && gymId && !isCompletedRef.current) {
        fetch(`/api/v1/admin/gyms/${gymId}`, { method: 'DELETE', keepalive: true }).catch(() => {})
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
    }
  }, [isNew, gymId])

  useEffect(() => {
    return () => {
      if (isNew && !isCompletedRef.current) {
        if (gymId) {
          fetch(`/api/v1/admin/gyms/${gymId}`, { method: 'DELETE', keepalive: true }).catch(() => {})
        }
        resetGym()
      }
    }
  }, [isNew, gymId, resetGym])

  const [tab, setTab] = useState(isNew && currentTab ? currentTab : GYM_TABS[0].key)

  useEffect(() => {
    if (isNew) {
      setCurrentTab(tab)
    }
  }, [tab, isNew, setCurrentTab])
  const [showWarning, setShowWarning] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const currentIndex = GYM_TABS.findIndex((t) => t.key === tab)

  function renderTab() {
    switch (tab) {
      case 'info':         return <GymInfoTab onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'trainers':     return <TrainersTab isNew={isNew} onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'workingHours': return <WorkingHoursPanel onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'address':      return <AddressTab onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'images':       return <GymImagesTab onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'plans':        return <GymSubscriptionTab onNext={() => setTab(GYM_TABS[currentIndex + 1].key)} />
      case 'admins':       return <GymAdminsTab admins={gym.admins} />
      case 'reviews':      return <ReviewsTab gymId={gym.id} />
      case 'customers':    return <GymCustomersTab />
      default: 
        return (
          <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p>Bu bölmə tezliklə əlavə ediləcək ({tab})</p>
          </div>
        )
    }
  }

  const handleStepClick = (key: string, index: number) => {
    if (isNew) {
      if (index < currentIndex) {
        setShowWarning(true)
        return
      }
      if (index > currentIndex) {
        return
      }
    }
    setTab(key)
  }

  const handleBackClick = () => {
    if (isNew && gymId) {
      setShowExitConfirm(true)
    } else {
      if (isNew) resetGym()
      router.push('/gyms')
    }
  }

  const handleConfirmExit = async () => {
    if (isNew && gymId) {
      isCompletedRef.current = true // Prevent unmount hook from firing duplicate delete
      try {
        await fetch(`/api/v1/admin/gyms/${gymId}`, { method: 'DELETE' })
      } catch (e) {}
    }
    resetGym()
    router.push('/gyms')
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleBackClick}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} aria-hidden />
        Geri qayıt
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">
          {isNew ? 'Yeni Zal' : gym.name}
        </h1>
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

      <div className="flex gap-6 items-start">
        <nav
          aria-label="Zal bölmələri"
          className="w-65 shrink-0 rounded-[12px] border border-border bg-card p-3 flex flex-col gap-1"
        >
          {GYM_TABS.map((t, index) => {
            const isActive    = tab === t.key
            const isCompleted = index < currentIndex
            const isFuture    = index > currentIndex

            return (
              <div key={t.key} className="flex flex-col">
                <button
                  onClick={() => handleStepClick(t.key, index)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors w-full',
                    isNew && isFuture && 'cursor-not-allowed'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold transition-colors',
                      isActive
                        ? 'bg-[#00B4CC] text-white'
                        : isCompleted
                          ? 'bg-[#00B4CC]/20 text-[#00B4CC]'
                          : 'bg-muted text-muted-foreground border border-border',
                    )}
                  >
                    {isCompleted ? <Check size={12} /> : index + 1}
                  </span>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        'text-[18px] font-medium text-[#C9C9C9]',
                        isActive ? 'text-[#000000]' : 'text-foreground',
                      )}
                    >
                      {t.label}
                    </span>
                   
                  </div>
                </button>

                {index < GYM_TABS.length - 1 && (
                  <div className="ml-7.5 w-1 h-4 bg-border" />
                )}
              </div>
            )
          })}
        </nav>

        <div className="flex-1 min-w-0">
          {renderTab()}
        </div>
      </div>

      {showWarning && (
        <StepNavigationWarningModal onClose={() => setShowWarning(false)} />
      )}

      {showExitConfirm && (
        <ExitConfirmationModal 
          onConfirm={handleConfirmExit} 
          onCancel={() => setShowExitConfirm(false)} 
        />
      )}
    </div>
  )
}