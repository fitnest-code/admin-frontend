'use client'

import { Gift, Megaphone, Sparkles } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { BulkCampaignModal, WelcomeBonusModal } from './campaign-modals'

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
  accent,
}: {
  icon: React.ElementType
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
  accent: 'cyan' | 'violet'
}) {
  const accentStyles =
    accent === 'cyan'
      ? 'from-[#00B4CC]/8 to-white border-[#00B4CC]/20 hover:border-[#00B4CC]/40'
      : 'from-[#7c3aed]/8 to-white border-[#7c3aed]/20 hover:border-[#7c3aed]/40'

  const iconStyles = accent === 'cyan' ? 'bg-[#00B4CC]/10 text-[#00B4CC]' : 'bg-[#7c3aed]/10 text-[#7c3aed]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex w-full flex-col items-start gap-4 rounded-2xl border bg-gradient-to-b p-5 text-left shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition-all duration-200',
        accentStyles,
        'hover:shadow-[0_8px_24px_rgba(16,24,40,0.06)] active:scale-[0.99]',
        disabled && 'cursor-not-allowed opacity-55 active:scale-100',
      )}
    >
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconStyles)}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-[#101828]">{title}</p>
        <p className="text-[13px] leading-relaxed text-[#667085]">{description}</p>
      </div>
      <span className="text-[12px] font-medium text-[#00B4CC] opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </button>
  )
}

export function CampaignActionsTab({
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
      <div className="w-full max-w-3xl">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#ececed]/80 bg-gradient-to-r from-[#fafafa] to-white p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00B4CC]/10 text-[#00B4CC]">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold text-[#101828]">{c.operations}</h2>
            <p className="text-[13px] leading-relaxed text-[#667085]">{c.actionsHint}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            icon={Gift}
            accent="cyan"
            title={c.sendWelcome}
            description={c.welcomeActionHint}
            onClick={onWelcomeOpen}
          />
          <ActionCard
            icon={Megaphone}
            accent="violet"
            title={c.sendCampaign}
            description={c.campaignActionHint}
            onClick={onBulkOpen}
          />
        </div>
      </div>

      {welcomeOpen && <WelcomeBonusModal onClose={onWelcomeClose} />}
      {bulkOpen && <BulkCampaignModal onClose={onBulkClose} />}
    </>
  )
}
