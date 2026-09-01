'use client'

import { Gift, Megaphone } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { BulkCampaignModal, WelcomeBonusModal } from './campaign-modals'

function OpsBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
        'border-border bg-white text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] hover:bg-[#00B4CC]/5 shadow-xs',
        disabled && 'opacity-55 cursor-not-allowed active:scale-100',
      )}
    >
      <Icon size={18} className="shrink-0 text-[#00B4CC]" />
      <span>{label}</span>
    </button>
  )
}

export function CampaignRulesTab({
  welcomeOpen,
  bulkOpen,
  onWelcomeOpen,
  onBulkOpen,
  onWelcomeClose,
  onBulkClose,
}: {
  welcomeOpen: boolean
  bulkOpen: boolean
  onWelcomeOpen: () => void
  onBulkOpen: () => void
  onWelcomeClose: () => void
  onBulkClose: () => void
}) {
  const t = useT()
  const c = t.campaign

  return (
    <>
      <div className="w-full lg:w-[360px] shrink-0">
        <div className="flex flex-col rounded-xl bg-white border border-border p-5 shadow-xs gap-5">
          <div className="border-b border-border pb-3">
            <h2 className="text-[16px] font-bold text-foreground tracking-tight">{c.operations}</h2>
          </div>
          <div className="flex flex-col gap-3">
            <OpsBtn icon={Gift} label={c.sendWelcome} onClick={onWelcomeOpen} />
            <OpsBtn icon={Megaphone} label={c.sendCampaign} onClick={onBulkOpen} />
          </div>
        </div>
      </div>

      {welcomeOpen && <WelcomeBonusModal onClose={onWelcomeClose} />}
      {bulkOpen && <BulkCampaignModal onClose={onBulkClose} />}
    </>
  )
}
