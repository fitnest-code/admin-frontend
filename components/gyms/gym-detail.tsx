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

import { useDeleteGym } from '@/lib/query/gym-query'

import { AnalitikaTab } from '@/components/zallar/tabs/analitika-tab'
import { ZalWorkHoursTab } from '@/components/zallar/tabs/zal-work-hours-tab'
import { StepNavigationWarningModal } from './modals/step-navigation-warning-modal'
import { ExitConfirmationModal } from './modals/exit-confirmation-modal'
import { useGymStore } from '@/lib/store/gym-store'
import { useT } from '@/lib/i18n'
import { useAuthStore } from '@/lib/store/auth-store'
import { apiGet } from '@/lib/api/client'
import styles from './gym-detail.module.css'

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

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
  const t = useT()
  const { gymId, currentTab, setCurrentTab, resetGym, setGymId, markStepCompleted, completedSteps } = useGymStore()
  const { mutate: deleteGymMutate } = useDeleteGym()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const roleUpper = user?.role?.toUpperCase()
  const isGymAdmin = roleUpper === 'ROLE_GYM_SUPER_ADMIN' || 
                     roleUpper === 'ROLE_GYM_ADMIN' || 
                     roleUpper === 'GYM_SUPER_ADMIN' || 
                     roleUpper === 'GYM_ADMIN'
  const isYogaOrPilates = gym?.categoryName ? [
    'Yoqa', 'Yoga', 'Йога', 'Pilates', 'Пилатес',
    'yoqa', 'yoga', 'йога', 'pilates', 'пилатес',
    'YOQA', 'YOGA', 'ЙОГА', 'PILATES', 'ПИЛАТЕС'
  ].includes(gym.categoryName.trim()) : false
  const visibleTabs = GYM_TABS.filter((tab) => {
    if (!isGymAdmin) return true;
    if (tab.key === 'analitika') return true;
    if (isYogaOrPilates && (tab.key === 'reservations' || tab.key === 'lessonHours')) {
      return true;
    }
    return false;
  });

  const [adminGyms, setAdminGyms] = useState<any[]>([])
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isQrModalOpen && gym?.id) {
      apiGet<{ qrCodeUrl: string }>(`/admin/gyms/${gym.id}/qr`)
        .then((res) => {
          setQrCodeUrl(res.qrCodeUrl)
        })
        .catch((err) => {
          console.error("Failed to load QR code", err)
        })
    }
  }, [isQrModalOpen, gym?.id])

  const handleExportQr = async () => {
    if (!qrCodeUrl) return;
    try {
      const fullUrl = getImageUrl(qrCodeUrl);
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${gym.name.replace(/\s+/g, '_')}_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to export QR code:", error);
    }
  }

  useEffect(() => {
    if (isGymAdmin) {
      apiGet<any>('/admin/gyms/list').then(res => {
        const items = res?.items || []
        setAdminGyms(items)
      }).catch(console.error)
    }
  }, [isGymAdmin])

  const getTabLabel = (key: string) => {
    switch (key) {
      case 'analitika': return t.gyms.tabAnalitika;
      case 'info': return t.gyms.tabInfo;
      case 'trainers': return t.gyms.tabTrainers;
      case 'plans': return t.gyms.tabPlans;
      case 'admins': return t.gyms.tabAdmins;
      case 'reviews': return t.gyms.tabReviews;
      case 'reservations': return t.gyms.tabReservations;
      case 'lessonHours': return t.gyms.tabLessonHours;
      case 'workingHours': return t.gyms.tabWorkingHours;
      case 'address': return t.gyms.tabAddress;
      case 'images': return t.gyms.tabImages;
      default: return key;
    }
  }

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
    return () => {
      // Cleanup: delete draft gym if user leaves the page/unmounts
      if (isNew && gymIdRef.current && !isCompletedRef.current) {
        deleteGymMutate(gymIdRef.current)
      }
    }
  }, [isNew, deleteGymMutate])

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

  useEffect(() => {
    if (isGymAdmin) {
      const allowed = isYogaOrPilates ? ['analitika', 'reservations', 'lessonHours'] : ['analitika']
      if (!allowed.includes(activeTab)) {
        setActiveTab('analitika')
      }
    }
  }, [isGymAdmin, activeTab, isYogaOrPilates])

  const handleConfirmExit = () => {
    if (isNew && gymId) {
      deleteGymMutate(gymId)
    }
    resetGym()
    router.push('/gyms')
  }
  const WIZARD_STEP_KEYS = WIZARD_TABS.map(t => t.key)

  const goToNext = () => {
    const currentIndex = WIZARD_TABS.findIndex(t => t.key === activeTab)
    // Mark current step as completed
    markStepCompleted(activeTab)
    if (currentIndex < WIZARD_TABS.length - 1) {
      const nextTab = WIZARD_TABS[currentIndex + 1].key
      setActiveTab(nextTab)
      setCurrentTab(nextTab)
      window.scrollTo(0, 0)
    }
  }

  const goToPrevious = () => {
    const currentIndex = WIZARD_TABS.findIndex(t => t.key === activeTab)
    if (currentIndex > 0) {
      const prevTab = WIZARD_TABS[currentIndex - 1].key
      setActiveTab(prevTab)
      setCurrentTab(prevTab)
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
          return <StepAdmins onComplete={() => { isCompletedRef.current = true; router.push('/gyms') }} />
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
      case 'workingHours':
        return <ZalWorkHoursTab gymId={gym.id} />
      case 'plans':
        return <PlansTab gym={gym} />
      case 'reviews':
        return <ReviewsTab gymName={gym.name} />
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
        <div className="mb-5 flex items-center justify-between border-b border-[#ececed] pb-4">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                 <button
                   onClick={() => activeTab === 'info' ? setShowExitConfirm(true) : goToPrevious()}
                   className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-1.5"
                 >
                   <ArrowLeft size={12} strokeWidth={3} />
                   {t.gyms.goBack}
                 </button>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md">
                 <Image src="/Sidebar/X.svg" width={18} height={18} alt="Delete" className="opacity-40" />
              </button>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Side: Vertical Stepper */}
          <aside className="w-full lg:w-[220px] shrink-0 bg-white rounded-xl p-4 shadow-sm border border-[#ececed]/50">
            <div className="flex flex-col items-start px-2">
              {WIZARD_TABS.map((tab, index) => {
                const isActive = activeTab === tab.key
                const isCompleted = completedSteps.includes(tab.key)
                const isAccessible = index === 0 || completedSteps.includes(WIZARD_TABS[index - 1].key)

                return (
                  <div 
                    key={tab.key} 
                    className={cn(
                      "w-full group",
                      isAccessible && !isActive ? "cursor-pointer" : "cursor-default"
                    )}
                    onClick={() => {
                      if (isAccessible && !isActive) {
                        setActiveTab(tab.key)
                        setCurrentTab(tab.key)
                      }
                    }}
                  >
                    {/* Step Row */}
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-300 shrink-0",
                        isActive 
                          ? "bg-[#00B4CC] text-white shadow-md scale-105" 
                          : isCompleted ? "bg-[#00B4CC] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"
                      )}>
                        {isCompleted && !isActive ? <Check size={16} strokeWidth={3} /> : index + 1}
                      </div>
                      <span className={cn(
                        "text-[15px] font-medium leading-6 transition-colors duration-300",
                        isActive ? "text-black" : isCompleted ? "text-black" : "text-[#C9C9C9]"
                      )}>
                        {getTabLabel(tab.key)}
                      </span>
                    </div>

                    {/* Connector Line */}
                    {index < WIZARD_TABS.length - 1 && (
                      <div className="w-9 flex justify-center py-1">
                        <div className={cn(
                          "w-[3px] h-[20px] rounded-full",
                          isCompleted ? "bg-[#00B4CC]" : "bg-[#E8E8E8]"
                        )} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Right Side: Form Content */}
          <div className="flex-1 w-full bg-white rounded-[12px] border border-[#ececed] shadow-sm overflow-hidden p-4 md:p-6">
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
      {!isGymAdmin && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/gyms')}
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} strokeWidth={3} />
              {t.gyms.goBack}
            </button>
          </div>
        </div>
      )}

      {/* Header with Status */}
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3 relative">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{gym.name}</h1>
            {!isGymAdmin && (
              <button onClick={() => setIsQrModalOpen(true)} className={styles.qrcodeParent} title="QR Kod">
                <Image src="/QrCode.svg" className={styles.qrcodeIcon} width={32} height={32} alt="QR" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isGymAdmin && adminGyms.length > 1 && (
            <div className="relative">
              <button 
                onClick={() => setIsSwitcherOpen(true)} 
                className="flex items-center justify-center p-1.5 hover:bg-slate-100 rounded-lg transition-colors outline-none cursor-pointer"
                title="Zalı dəyiş"
              >
                <Image src="/left-right-arrow.svg" width={24} height={24} alt="Switch gym" className="shrink-0" />
              </button>

              {isSwitcherOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsSwitcherOpen(false)}>
                  <div className="bg-[#fafafa] w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-8 duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="text-[16px] font-semibold text-black sm:text-center text-right w-full mb-2">Zallar</div>
                    <div className="flex flex-col gap-2 w-full max-h-[60vh] overflow-y-auto">
                      {adminGyms.map(g => (
                        <button 
                          key={g.id} 
                          onClick={() => { router.push(`/gyms/${g.id}`); setIsSwitcherOpen(false) }} 
                          className="w-full bg-white rounded-xl border border-[#ececed] flex items-center justify-between p-5 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                        >
                          <div className="text-[16px] font-medium text-black uppercase text-left">{g.name}</div>
                          <div className="w-[28px] h-[28px] rounded-full border border-[#cecfd2] flex items-center justify-center relative shrink-0">
                            {g.id === gym.id && <div className="w-3.5 h-3.5 rounded-full bg-[#00B4CC]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(gym.status?.toUpperCase() === 'ACTIVE' || !gym.status) && (
            <div className="h-[28px] rounded-full bg-[#166728] flex items-center px-4 gap-2 shadow-sm border border-green-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">{t.gyms.active}</span>
            </div>
          )}
          {gym.status?.toUpperCase() === 'INACTIVE' && (
            <div className="h-[28px] rounded-full bg-[#c9373a] flex items-center px-4 gap-2 shadow-sm border border-red-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">{t.gyms.inactive}</span>
            </div>
          )}
          {gym.status?.toUpperCase() === 'DRAFT' && (
            <div className="h-[28px] rounded-full bg-slate-400 flex items-center px-4 gap-2 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">{t.gyms.draft}</span>
            </div>
          )}
        </div>
      </div>

      {/* STRETCHED TABS */}
      {(!isGymAdmin || (isGymAdmin && isYogaOrPilates)) && (
        <div className="w-full border-b border-[#ececed]">
          <nav className="-mb-px flex w-full overflow-x-auto no-scrollbar" aria-label="Zal bölmələri">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 min-w-[130px] border-b-[3px] pb-3 text-[13px] font-bold transition-all duration-200 whitespace-nowrap tracking-wide text-center',
                  activeTab === tab.key
                    ? 'border-[#00B4CC] text-[#101828]'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200',
                )}
                aria-current={activeTab === tab.key ? 'page' : undefined}
              >
                {getTabLabel(tab.key)}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* TAB CONTENT (BOX) */}
      <div className="w-full min-h-[500px]">{renderTab()}</div>

      {/* QR Code Modal Overlay */}
      {isQrModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsQrModalOpen(false)}>
          <div className={styles.frameParent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.frameGroup}>
              <div className={styles.frame}>
                <div className={styles.frame2}>
                  <div className={styles.heading1}>
                    <div className={styles.qrKod}>QR Kod</div>
                  </div>
                  <div className={styles.pencilsimple} onClick={() => setIsQrModalOpen(false)}>
                    <div className={styles.x}>
                      <Image src="/Sidebar/X.svg" className={styles.vectorIcon} width={15} height={15} sizes="100vw" alt="Close" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.fitclub}>{gym.name}</div>
            </div>
            <div className={styles.geminiGeneratedImageFsxjjjfParent}>
              <Image 
                src={getImageUrl(qrCodeUrl)} 
                className={styles.geminiGeneratedImageFsxjjjfIcon} 
                width={230} 
                height={234} 
                sizes="100vw" 
                alt="QR Code" 
              />
              <button className={styles.button} onClick={handleExportQr}>
                <div className={styles.exportQr}>Export QR</div>
                <div className={styles.pencilsimple}>
                  <div className={styles.x}>
                    <Image src="/DownloadSimple.svg" className={styles.vectorIcon2} width={17.6} height={17.6} sizes="100vw" alt="Download" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}