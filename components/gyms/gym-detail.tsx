'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'
import Image from 'next/image'
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
import ReservationsTab from './dashboard/reservations-tab'
import { CustomersTab } from './dashboard/customers-tab'
import LessonHoursTab from './dashboard/lesson-hours-tab'

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
  const { gymId, currentTab, setCurrentTab, resetGym, setGymId } = useGymStore()

  useEffect(() => {
    // Only update store gymId from props if it's an existing gym (not 'new')
    if (gym?.id && gym.id !== 'new' && gymId !== Number(gym.id)) {
      setGymId(Number(gym.id))
    }
  }, [gym?.id, gymId, setGymId])

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
  const goToNext = () => {
    const currentIndex = WIZARD_TABS.findIndex(t => t.key === activeTab)
    if (currentIndex < WIZARD_TABS.length - 1) {
      const nextTab = WIZARD_TABS[currentIndex + 1].key
      setActiveTab(nextTab)
      setCurrentTab(nextTab)
      window.scrollTo(0, 0)
    }
  }
  const renderTab = () => {
    if (isNew) {
      switch (activeTab) {
        case 'info':
          return <StepInfo onNext={goToNext} />
        case 'trainers':
          return <StepTrainers onNext={goToNext} />
        case 'workingHours':
          return <StepWorkingHours onNext={goToNext} />
        case 'address':
          return <StepAddress onNext={goToNext} />
        case 'images':
          return <StepImages onNext={goToNext} />
        case 'plans':
          return <StepPlans onNext={goToNext} />
        case 'admins':
          return <StepAdmins />
        default:
          return <StepInfo onNext={goToNext} />
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
        return <PlansTab gym={gym} />
      case 'reviews':
        return <ReviewsTab />
      case 'reservations':
        return <ReservationsTab />
      case 'lessonHours':
        return <LessonHoursTab />
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
      <div className="flex flex-col w-full font-sans">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between border-b border-[#ececed] pb-5">
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                 <button
                   onClick={() => setShowExitConfirm(true)}
                   className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-2"
                 >
                   <ArrowLeft size={14} strokeWidth={3} />
                   Geri qayıt
                 </button>
              </div>
              <h1 className="text-[24px] font-semibold text-[#101828] leading-[28px]">Yeni Zal</h1>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md">
                 <Image src="/Sidebar/X.svg" width={18} height={18} alt="Delete" className="opacity-40" />
              </button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Side: Vertical Stepper */}
          <aside className="w-full lg:w-[260px] shrink-0 bg-white rounded-[12px] p-4 shadow-sm border border-[#ececed]/50">
            <div className="flex flex-col items-start px-2">
              {WIZARD_TABS.map((tab, index) => {
                const isActive = activeTab === tab.key
                const isCompleted = WIZARD_TABS.findIndex(t => t.key === activeTab) > index

                return (
                  <div 
                    key={tab.key} 
                    className="w-full cursor-pointer group"
                    onClick={() => {
                      if (isCompleted) {
                        setShowWarning(true)
                      }
                    }}
                  >
                    {/* Step Row */}
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-semibold transition-all duration-300 shrink-0",
                        isActive 
                          ? "bg-[#00B4CC] text-white shadow-md scale-105" 
                          : isCompleted ? "bg-[#00B4CC] text-white group-hover:bg-[#009DB3]" : "bg-[#F3F4F6] text-[#9CA3AF]"
                      )}>
                        {isCompleted ? <Check size={20} strokeWidth={3} /> : index + 1}
                      </div>
                      <span className={cn(
                        "text-[18px] font-medium leading-[28px] transition-colors duration-300",
                        isActive ? "text-black" : "text-[#C9C9C9]"
                      )}>
                        {tab.label}
                      </span>
                    </div>

                    {/* Connector Line */}
                    {index < WIZARD_TABS.length - 1 && (
                      <div className="w-11 flex justify-center py-2">
                        <div className="w-[4px] h-[24px] bg-[#E8E8E8] rounded-full" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Right Side: Form Content */}
          <div className="flex-1 w-full bg-white rounded-[12px] border border-[#ececed] shadow-sm overflow-hidden p-6 md:p-8">
            {renderTab()}
          </div>
        </div>

        {showExitConfirm && <ExitConfirmationModal onConfirm={handleConfirmExit} onCancel={() => setShowExitConfirm(false)} />}
        {showWarning && <StepNavigationWarningModal onClose={() => setShowWarning(false)} />}
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