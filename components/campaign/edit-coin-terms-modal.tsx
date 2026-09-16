'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { useCoinTerms } from '@/lib/query/use-coin-terms'
import { emptyLanguageRecord, useLanguages } from '@/lib/query/use-languages'
import styles from '@/components/gyms/dashboard/modals/add-lesson-hour-modal.module.css'

const COIN_TERM_COLUMN_BY_LANG: Record<string, 'htmlContentAz' | 'htmlContentEn' | 'htmlContentRu' | undefined> = {
  AZ: 'htmlContentAz',
  EN: 'htmlContentEn',
  RU: 'htmlContentRu',
}

export function EditCoinTermsModal({
  onClose,
  onNotify,
}: {
  onClose: () => void
  onNotify: (message: string, type: 'success' | 'error') => void
}) {
  const t = useT()
  const c = t.campaign
  const { languages } = useLanguages()
  const primaryLang = languages.includes('AZ') ? 'AZ' : languages[0] ?? 'AZ'
  const { terms, isLoading, saveTerms, isSaving } = useCoinTerms()
  const [activeTab, setActiveTab] = useState<string>(primaryLang)
  const [htmlContents, setHtmlContents] = useState<Record<string, string>>(() => emptyLanguageRecord(languages))
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setActiveTab(primaryLang)
    setHtmlContents(emptyLanguageRecord(languages))
  }, [languages, primaryLang])

  useEffect(() => {
    if (!terms) return
    setHtmlContents((prev) => ({
      ...emptyLanguageRecord(languages),
      ...prev,
      AZ: terms.htmlContentAz ?? '',
      EN: terms.htmlContentEn ?? '',
      RU: terms.htmlContentRu ?? '',
    }))
  }, [terms, languages])

  const isPersistedLang = (lang: string) => Boolean(COIN_TERM_COLUMN_BY_LANG[lang])

  async function handleSubmit() {
    try {
      await saveTerms({
        htmlContentAz: htmlContents.AZ ?? '',
        htmlContentEn: htmlContents.EN ?? '',
        htmlContentRu: htmlContents.RU ?? '',
      })
      setShowSuccess(true)
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.termsSaveFailed, 'error')
    }
  }

  const placeholder = isPersistedLang(activeTab)
    ? activeTab === 'AZ'
      ? '<p>Coin qaydaları HTML formatında...</p>'
      : activeTab === 'EN'
        ? '<p>Coin terms in HTML format...</p>'
        : '<p>Правила Coin в формате HTML...</p>'
    : `<p>Not persisted — backend only supports AZ/EN/RU columns</p>`

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: '640px' }}>
        <div className={styles.header}>
          <h2 className={styles.title}>{c.termsModalTitle}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <Image src="/Sidebar/X.svg" width={24} height={24} alt="Close" />
          </button>
        </div>

        <div className={styles.body}>
          <div className="mb-3 flex items-center gap-1 border-b border-[#ececed]">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveTab(lang)}
                className={cn(
                  'border-b-2 px-4 py-2 text-[13px] font-semibold transition-all',
                  activeTab === lang
                    ? 'border-[#00b4cc] text-[#00b4cc]'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          {!isPersistedLang(activeTab) && (
            <p className="mb-2 text-xs text-amber-600">
              This language is shown for preview only. Only AZ, EN, and RU are saved (htmlContentAz/En/Ru columns).
            </p>
          )}

          <div className={styles.inputGroup} style={{ gap: '12px' }}>
            <label className={styles.label} style={{ fontWeight: 500 }}>
              {c.termsHtmlLabel} ({activeTab})
            </label>
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">{c.loading}</div>
            ) : (
              <textarea
                className={cn(styles.input, 'min-h-[260px] p-4 font-mono text-sm leading-relaxed')}
                style={{ resize: 'vertical' }}
                placeholder={placeholder}
                value={htmlContents[activeTab] ?? ''}
                readOnly={!isPersistedLang(activeTab)}
                onChange={(e) => {
                  if (!isPersistedLang(activeTab)) return
                  setHtmlContents((prev) => ({ ...prev, [activeTab]: e.target.value }))
                }}
              />
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            {t.common.cancel}
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
          >
            {isSaving ? c.saving : c.saveSettings}
          </button>
        </div>
      </div>

      <SuccessAnimationModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          onClose()
        }}
        message={c.termsSaved}
      />
    </div>
  )
}
