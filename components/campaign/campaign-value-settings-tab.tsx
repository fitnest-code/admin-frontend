'use client'

import { useT } from '@/lib/i18n'
import { useCampaignCoin } from './campaign-coin-provider'
import {
  CoinNumberField,
  CoinSaveBar,
  CoinSection,
  CoinTabLoader,
  CoinToggleField,
} from './campaign-coin-ui'

export function CampaignValueSettingsTab() {
  const t = useT()
  const c = t.campaign
  const { draft, setDraft, isLoading, isSaving, save } = useCampaignCoin()

  if (isLoading || !draft) return <CoinTabLoader />

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl">
      <CoinSection title={c.earnFormulaSection} description={c.earnFormulaHint}>
        <div className="grid gap-5 sm:grid-cols-2">
          <CoinNumberField
            label={c.baseEarnRate}
            value={draft.baseEarnRate}
            step="0.0001"
            onChange={(baseEarnRate) => setDraft({ ...draft, baseEarnRate })}
          />
          <CoinNumberField
            label={c.maxGivebackRate}
            value={draft.maxGivebackRate}
            step="0.0001"
            onChange={(maxGivebackRate) => setDraft({ ...draft, maxGivebackRate })}
          />
          <CoinNumberField
            label={c.earnCoinFactor}
            value={draft.earnCoinFactor}
            step="0.01"
            onChange={(earnCoinFactor) => setDraft({ ...draft, earnCoinFactor })}
          />
          <CoinNumberField
            label={c.welcomeBonus}
            value={draft.welcomeBonusAmount}
            step="1"
            min={0}
            suffix="Coin"
            onChange={(welcomeBonusAmount) => setDraft({ ...draft, welcomeBonusAmount })}
          />
        </div>
      </CoinSection>

      <CoinSection title={c.valueSettingsSpendSection} description={c.valueSettingsSpendHint}>
        <div className="grid gap-5 sm:grid-cols-2">
          <CoinNumberField
            label={c.spendRate}
            hint={c.spendRateHint}
            value={draft.spendRateCoinToAzn}
            step="1"
            min={1}
            suffix="Coin = 1 AZN"
            onChange={(spendRateCoinToAzn) => setDraft({ ...draft, spendRateCoinToAzn })}
          />
          <CoinNumberField
            label={c.maxDiscount}
            value={draft.maxDiscountPercentage}
            step="1"
            min={0}
            max={100}
            suffix="%"
            onChange={(maxDiscountPercentage) => setDraft({ ...draft, maxDiscountPercentage })}
          />
          <CoinNumberField
            label={c.expiryMonths}
            value={draft.expiryMonths}
            step="1"
            min={1}
            suffix={c.monthsShort}
            onChange={(expiryMonths) => setDraft({ ...draft, expiryMonths })}
          />
        </div>
      </CoinSection>

      <CoinSection title={c.valueSettingsProgramSection}>
        <CoinToggleField
          label={c.active}
          hint={c.activeHint}
          checked={draft.active}
          onChange={(active) => setDraft({ ...draft, active })}
        />
      </CoinSection>

      <CoinSaveBar
        onSave={save}
        isSaving={isSaving}
        savingLabel={c.saving}
        saveLabel={c.saveSettings}
      />
    </div>
  )
}
