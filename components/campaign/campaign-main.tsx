'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { CampaignEarnTab } from './campaign-earn-tab'
import { CampaignRulesTab } from './campaign-rules-tab'

const CAMPAIGN_TABS = [
  { key: 'earn', labelKey: 'earnTab' as const },
  { key: 'operations', labelKey: 'operationsTab' as const },
]

export default function CampaignMain() {
  const t = useT()
  const c = t.campaign
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') === 'operations' ? 'operations' : 'earn'

  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  })

  function setTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`)
  }

  function notify(message: string, type: 'success' | 'error') {
    setModal({ open: true, message, type })
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in-50 duration-300 font-sans">
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{c.title}</h1>
      </div>

      <div className="flex gap-0 border-b border-[#ececed]">
        {CAMPAIGN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={cn(
              'px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-[#00B4CC] text-[#00B4CC]'
                : 'border-transparent text-[#667085] hover:text-[#101828]',
            )}
          >
            {c[tab.labelKey]}
          </button>
        ))}
      </div>

      {activeTab === 'earn' ? (
        <CampaignEarnTab onNotify={notify} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <CampaignRulesTab
            welcomeOpen={welcomeOpen}
            bulkOpen={bulkOpen}
            onWelcomeOpen={() => setWelcomeOpen(true)}
            onBulkOpen={() => setBulkOpen(true)}
            onWelcomeClose={() => setWelcomeOpen(false)}
            onBulkClose={() => setBulkOpen(false)}
          />
        </div>
      )}

      <SuccessAnimationModal
        isOpen={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}
