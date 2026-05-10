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
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isNew])

  const [activeTab, setActiveTab] = useState(currentTab || (isNew ? 'info' : 'analitika'))
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [currentTab])

  const handleConfirmExit = () => {
    resetGym()
    router.push('/gyms')
  }

  const renderTab = () => {
    if (isNew) {
      switch (activeTab) {
        case 'info':
          return <StepInfo />
        case 'trainers':
          return <StepTrainers />
        case 'workingHours':
          return <StepWorkingHours />
        case 'address':
          return <StepAddress />
        case 'images':
          return <StepImages />
        case 'plans':
          return <StepPlans />
        case 'admins':
          return <StepAdmins />
        default:
          return <StepInfo />
      }
    }

    switch (activeTab) {
      case 'analitika':
        return <AnalitikaTab gymId={gym.id} />
      case 'info':
        return <InfoTab gymId={gym.id} />
      case 'trainers':
        return <TrainersTab />
      case 'plans':
        return <PlansTab />
      case 'reviews':
        return <ReviewsTab />
      case 'reservations':
        return <ReservationsTab />
      case 'customers':
        return <CustomersTab />
      case 'admins':
        return <AdminsTab />
      default:
        return <AnalitikaTab gymId={gym.id} />
    }
  }

  if (isNew) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={10} />
              Zallar
            </button>
            <span className="text-[10px] text-muted-foreground">/</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Yeni Zal Əlavə Et</span>
          </div>
        </div>

        <div className="w-full border-b border-border">
          <nav className="-mb-px flex w-full gap-0 overflow-x-auto no-scrollbar" aria-label="Zal yaratma mərhələləri">
            {WIZARD_TABS.map((tab, index) => (
              <button
                key={tab.key}
                disabled={true}
                className={cn(
                  'flex-1 min-w-[120px] border-b-2 pb-4 text-sm font-semibold transition-all duration-200 whitespace-nowrap opacity-100 text-center',
                  activeTab === tab.key
                    ? 'border-[#00B4CC] text-foreground'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                {index + 1}. {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[400px] w-full">{renderTab()}</div>

        {showWarning && <StepNavigationWarningModal onClose={() => setShowWarning(false)} />}
        {showExitConfirm && <ExitConfirmationModal onConfirm={handleConfirmExit} onCancel={() => setShowExitConfirm(false)} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/gyms')}
            className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Geri qayıt
          </button>
        </div>
      </div>

      {/* Header with Status */}
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-6">
        <div className="flex flex-col gap-1">
           <h1 className="text-[28px] font-bold text-[#101828] tracking-tight">{gym.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          {(gym.status?.toUpperCase() === 'ACTIVE' || !gym.status) && (
            <div className="h-[28px] rounded-full bg-[#166728] flex items-center px-4 gap-2 shadow-sm border border-green-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Aktiv</span>
            </div>
          )}
          {gym.status?.toUpperCase() === 'INACTIVE' && (
            <div className="h-[28px] rounded-full bg-[#c9373a] flex items-center px-4 gap-2 shadow-sm border border-red-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Deaktiv</span>
            </div>
          )}
          {gym.status?.toUpperCase() === 'DRAFT' && (
            <div className="h-[28px] rounded-full bg-slate-400 flex items-center px-4 gap-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Qaralama</span>
            </div>
          )}
        </div>
      </div>

      {/* STRETCHED TABS */}
      <div className="w-full border-b border-[#ececed]">
        <nav className="-mb-px flex w-full overflow-x-auto no-scrollbar" aria-label="Zal bölmələri">
          {GYM_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 min-w-[150px] border-b-[3px] pb-5 text-[15px] font-bold transition-all duration-200 whitespace-nowrap tracking-wide text-center',
                activeTab === tab.key
                  ? 'border-[#00B4CC] text-[#101828]'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200',
              )}
              aria-current={activeTab === tab.key ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB CONTENT (BOX) */}
      <div className="w-full min-h-[500px]">{renderTab()}</div>
    </div>
  )
}