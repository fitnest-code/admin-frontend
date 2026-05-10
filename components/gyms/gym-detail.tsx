'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GYM_TABS, type Gym } from '@/lib/gyms-data'
import { StepInfo } from './wizard/step-info'
import { StepTrainers } from './wizard/step-trainers'
import { StepAdmins } from './wizard/step-admins'
import { StepAddress } from './wizard/step-address'
import { StepImages } from './wizard/step-images'
import { StepPlans } from './wizard/step-plans'
import { StepWorkingHours } from './wizard/step-working-hours'

import { InfoTab } from './dashboard/info-tab'
import { TrainersTab } from './dashboard/trainers-tab'
import { AdminsTab } from './dashboard/admins-tab'
import { PlansTab } from './dashboard/plans-tab'
import { ReviewsTab } from './dashboard/reviews-tab'
import { ReservationsTab } from './dashboard/reservations-tab'
import { CustomersTab } from './dashboard/customers-tab'

import { AnalitikaTab } from '@/components/zallar/tabs/analitika-tab'
import { StepNavigationWarningModal } from './modals/step-navigation-warning-modal'
import { ExitConfirmationModal } from './modals/exit-confirmation-modal'
import { useGymStore } from '@/lib/store/gym-store'

const WIZARD_TABS = [
  { key: 'info', label: 'Zal məlumatları' },
  { key: 'trainers', label: 'Məşqçilər' },
  { key: 'workingHours', label: 'İş saatları' },
  { key: 'address', label: 'Ünvan' },
  { key: 'images', label: 'Şəkillər' },
  { key: 'plans', label: 'Abunəlik / Xidmətlər' },
  { key: 'admins', label: 'Zal Admini' },
]

interface GymDetailProps {
  gym: Gym
  isNew?: boolean
}

export function GymDetail({ gym, isNew = false }: GymDetailProps) {
  const router = useRouter()
  const { gymId, currentTab, setCurrentTab, resetGym } = useGymStore()

  const isCompletedRef = useRef(false)

  const gymIdRef = useRef(gymId)
  useEffect(() => {
    gymIdRef.current = gymId
  }, [gymId])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNew && gymIdRef.current && !isCompletedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handleUnload = () => {
      if (isNew && gymIdRef.current && !isCompletedRef.current) {
        fetch(`/api/v1/admin/gyms/${gymIdRef.current}`, { method: 'DELETE', keepalive: true }).catch(() => { })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('unload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('unload', handleUnload)
    }
  }, [isNew])

  useEffect(() => {
    return () => {
      if (isNew && !isCompletedRef.current) {
        if (gymIdRef.current) {
          fetch(`/api/v1/admin/gyms/${gymIdRef.current}`, { method: 'DELETE', keepalive: true }).catch(() => { })
        }
        resetGym()
      }
    }
  }, [isNew, resetGym])

  const [activeTab, setActiveTab] = useState(isNew && currentTab ? currentTab : (isNew ? WIZARD_TABS[0].key : 'analitika'))

  useEffect(() => {
    if (isNew) {
      setCurrentTab(activeTab)
    }
  }, [activeTab, isNew, setCurrentTab])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const currentIndex = WIZARD_TABS.findIndex((t) => t.key === activeTab)

  function renderTab() {
    if (isNew) {
      switch (activeTab) {
        case 'info': return <StepInfo onNext={() => setActiveTab('trainers')} />
        case 'trainers': return <StepTrainers onNext={() => setActiveTab('workingHours')} />
        case 'workingHours': return <StepWorkingHours onNext={() => setActiveTab('address')} />
        case 'address': return <StepAddress onNext={() => setActiveTab('images')} />
        case 'images': return <StepImages onNext={() => setActiveTab('plans')} />
        case 'plans': return <StepPlans onNext={() => setActiveTab('admins')} />
        case 'admins': return <StepAdmins />
        default: return null
      }
    }

    switch (activeTab) {
      case 'analitika': return <AnalitikaTab gymId={gym.id} />
      case 'info': return <InfoTab />
      case 'trainers': return <TrainersTab />
      case 'plans': return <PlansTab />
      case 'admins': return <AdminsTab />
      case 'reviews': return <ReviewsTab gymId={gym.id} />
      case 'reservations': return <ReservationsTab />
      case 'customers': return <CustomersTab />
      default: return null
    }
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
      isCompletedRef.current = true
      try {
        await fetch(`/api/v1/admin/gyms/${gymId}`, { method: 'DELETE' })
      } catch (e) { }
    }
    resetGym()
    router.push('/gyms')
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
    setActiveTab(key)
  }

  if (isNew) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={handleBackClick}
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} aria-hidden />
          Geri qayıt
        </button>

        <h1 className="text-xl font-bold text-foreground">Yeni Zal</h1>

        <div className="flex gap-6 items-start">
          <nav aria-label="Zal bölmələri" className="w-65 shrink-0 rounded-[12px] border border-border bg-card p-3 flex flex-col gap-1">
            {WIZARD_TABS.map((t, index) => {
              const isActive = activeTab === t.key
              const isCompleted = index < currentIndex
              const isFuture = index > currentIndex

              return (
                <div key={t.key} className="flex flex-col">
                  <button
                    onClick={() => handleStepClick(t.key, index)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors w-full',
                      isFuture && 'cursor-not-allowed'
                    )}
                  >
                    <span className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold transition-colors',
                      isActive ? 'bg-[#00B4CC] text-white' : isCompleted ? 'bg-[#00B4CC]/20 text-[#00B4CC]' : 'bg-muted text-muted-foreground border border-border'
                    )}>
                      {isCompleted ? <Check size={12} /> : index + 1}
                    </span>
                    <span className={cn('text-[18px] font-medium', isActive ? 'text-black' : 'text-muted-foreground')}>
                      {t.label}
                    </span>
                  </button>
                  {index < WIZARD_TABS.length - 1 && (
                    <div className="ml-7.5 w-1 h-4 bg-border" />
                  )}
                </div>
              )
            })}
          </nav>
          <div className="flex-1 min-w-0">{renderTab()}</div>
        </div>

        {showWarning && <StepNavigationWarningModal onClose={() => setShowWarning(false)} />}
        {showExitConfirm && <ExitConfirmationModal onConfirm={handleConfirmExit} onCancel={() => setShowExitConfirm(false)} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/gyms')}
            className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={10} />
            Zallar
          </button>
          <span className="text-[10px] text-muted-foreground">/</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {gym.name} - Detallı
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{gym.name}</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Aktiv
          </span>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex gap-8 overflow-x-auto" aria-label="Zal bölmələri">
          {GYM_TABS.map((tab) => (
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

      <div className="min-h-[400px]">{renderTab()}</div>

      {showExitConfirm && (
        <ExitConfirmationModal
          onConfirm={handleConfirmExit}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </div>
  )
}