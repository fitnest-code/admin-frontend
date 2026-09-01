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

const CAMPAIGN_TABS = [
  { key: 'multipliers', labelKey: 'multipliersTab' as const },
  { key: 'values', labelKey: 'valueSettingsTab' as const },
  { key: 'actions', labelKey: 'actionsTab' as const },
] as const

type CampaignTabKey = (typeof CAMPAIGN_TABS)[number]['key']

function parseTab(value: string | null): CampaignTabKey {
  if (value === 'values' || value === 'actions') return value
  if (value === 'operations') return 'actions'
  if (value === 'earn') return 'multipliers'
  return 'multipliers'
}

export default function CampaignMain() {
  const t = useT()
  const c = t.campaign
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = parseTab(searchParams.get('tab'))

  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  function setTab(tab: CampaignTabKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
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
      <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans">
        <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
          <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{c.title}</h1>
        </div>

        <div className="flex gap-1 rounded-xl bg-[#f4f4f5] p-1 w-fit">
          {CAMPAIGN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTab(tab.key)}
              className={cn(
                'rounded-lg px-4 py-2 text-[13px] font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-white text-[#101828] shadow-sm'
                  : 'text-[#667085] hover:text-[#101828]',
              )}
            >
              {c[tab.labelKey]}
            </button>
          ))}
        </div>

        {activeTab === 'multipliers' && <CampaignMultipliersTab />}
        {activeTab === 'values' && <CampaignValueSettingsTab />}
        {activeTab === 'actions' && (
          <CampaignActionsTab
            welcomeOpen={welcomeOpen}
            bulkOpen={bulkOpen}
            onWelcomeOpen={() => setWelcomeOpen(true)}
            onBulkOpen={() => setBulkOpen(true)}
            onWelcomeClose={() => setWelcomeOpen(false)}
            onBulkClose={() => setBulkOpen(false)}
          />
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
