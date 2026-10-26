'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { CampaignCoinProvider } from './campaign-coin-provider'
import { CampaignMultipliersTab } from './campaign-multipliers-tab'
import { CampaignValueSettingsTab } from './campaign-value-settings-tab'
import { CampaignActionsTab } from './campaign-actions-tab'
import { CampaignRulesTab } from './campaign-rules-tab'
import { CampaignHistoryTab } from './campaign-history-tab'
import Image from 'next/image'

// Main tabs: FitCoin, Promo kodlar, Tərəfdaşlar
const MAIN_TABS = [
  { key: 'fitcoin', labelKey: 'fitCoin' as const },
  { key: 'promo', labelKey: 'promoCodes' as const },
  { key: 'partners', labelKey: 'partners' as const },
] as const

type MainTabKey = (typeof MAIN_TABS)[number]['key']

// FitCoin sub-tabs
const FITCOIN_SUB_TABS = [
  { key: 'history', labelKey: 'history' as const }, // Custom label handled separately
  { key: 'multipliers', labelKey: 'multipliersTab' as const },
  { key: 'values', labelKey: 'valueSettingsTab' as const },
  { key: 'rules', labelKey: 'rulesTab' as const },
  { key: 'actions', labelKey: 'actionsTab' as const },
] as const

type FitCoinSubTabKey = (typeof FITCOIN_SUB_TABS)[number]['key']

function parseMainTab(value: string | null): MainTabKey {
  if (value === 'promo' || value === 'partners') return value
  return 'fitcoin'
}

function parseFitCoinSubTab(value: string | null): FitCoinSubTabKey {
  if (value === 'multipliers' || value === 'values' || value === 'rules' || value === 'actions' || value === 'history') {
    return value
  }
  if (value === 'operations') return 'actions'
  if (value === 'earn') return 'multipliers'
  return 'history' // Default to history (new design)
}

export default function CampaignMain() {
  const t = useT()
  const c = t.campaign
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mainTab = parseMainTab(searchParams.get('mainTab'))
  const fitCoinSubTab = parseFitCoinSubTab(searchParams.get('subTab'))

  const [bulkOpen, setBulkOpen] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  function setMainTab(tab: MainTabKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mainTab', tab)
    // Reset subTab when switching main tabs
    if (tab !== 'fitcoin') {
      params.delete('subTab')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  function setFitCoinSubTab(subTab: FitCoinSubTabKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mainTab', 'fitcoin')
    params.set('subTab', subTab)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function notify(message: string, type: 'success' | 'error') {
    setModal({ open: true, message, type })
  }

  return (
    <CampaignCoinProvider
      onNotify={notify}
      settingsSavedMessage={c.settingsSaved}
      saveFailedMessage={c.saveFailed}
      previewFailedMessage={c.previewFailed}
    >
      <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans bg-[#FAFAFA] min-h-screen">
        {/* Page Header */}
        <div className="w-full flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-black tracking-tight font-sans leading-[30px]">
            {c.title}
          </h1>
          <button
            type="button"
            className="h-12 px-6 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2"
          >
            <Image
              src="/admin-panel-icons/add.svg"
              alt="add"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="text-white text-[16px] font-medium leading-[24px] font-sans">
              {c.createCampaign}
            </span>
          </button>
        </div>

        {/* Main Tabs */}
        <div className="w-full flex gap-0">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMainTab(tab.key)}
              className={cn(
                'flex-1 min-w-[130px] py-3 px-4 text-center text-[20px] font-bold leading-[30px] font-sans transition-all border-b-[3px]',
                mainTab === tab.key
                  ? 'border-[#00B4CC] text-black'
                  : 'border-[#7C7C7C] text-[#7C7C7C]',
              )}
            >
              {c.tabs[tab.labelKey]}
            </button>
          ))}
        </div>

        {mainTab === 'fitcoin' && (
          <>
            {/* FitCoin Sub Tabs */}
            <div className="flex gap-1 rounded-xl bg-[#f4f4f5] p-1 w-fit">
              {FITCOIN_SUB_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFitCoinSubTab(tab.key)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-[13px] font-medium transition-all',
                    fitCoinSubTab === tab.key
                      ? 'bg-white text-[#101828] shadow-sm'
                      : 'text-[#667085] hover:text-[#101828]',
                  )}
                >
                  {c[tab.labelKey]}
                </button>
              ))}
            </div>

            {/* FitCoin Sub Tab Content */}
            {fitCoinSubTab === 'history' && <CampaignHistoryTab />}
            {fitCoinSubTab === 'multipliers' && <CampaignMultipliersTab />}
            {fitCoinSubTab === 'values' && <CampaignValueSettingsTab />}
            {fitCoinSubTab === 'rules' && <CampaignRulesTab onNotify={notify} />}
            {fitCoinSubTab === 'actions' && (
              <CampaignActionsTab
                bulkOpen={bulkOpen}
                onBulkOpen={() => setBulkOpen(true)}
                onBulkClose={() => setBulkOpen(false)}
              />
            )}
          </>
        )}

        {mainTab === 'promo' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-300">
            <div className="text-center text-[#8A9694] text-[16px] py-12">{c.comingSoon}</div>
          </div>
        )}

        {mainTab === 'partners' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-300">
            <div className="text-center text-[#8A9694] text-[16px] py-12">{c.comingSoon}</div>
          </div>
        )}

        <SuccessAnimationModal
          isOpen={modal.open}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
          message={modal.message}
          type={modal.type}
        />
      </div>
    </CampaignCoinProvider>
  )
}
