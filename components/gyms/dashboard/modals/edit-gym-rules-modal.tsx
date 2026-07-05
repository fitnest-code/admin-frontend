'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './add-lesson-hour-modal.module.css' // Reuse modal layout styles
import { cn } from '@/lib/utils'
import { useGymRulesQuery, useUpdateGymRules } from '@/lib/query/gym-query'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { useT } from '@/lib/i18n'
import { apiGet, apiPost } from '@/lib/api/client'

interface Props {
    gymId: number
    onClose: () => void
}

export const EditGymRulesModal = ({ gymId, onClose }: Props) => {
    const t = useT()
    const { data: rulesData, isLoading } = useGymRulesQuery(gymId)
    const updateRulesMutation = useUpdateGymRules()
    
    const [htmlContent, setHtmlContent] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('AZ')
    const [htmlContents, setHtmlContents] = useState<Record<string, string>>({ AZ: '', EN: '', RU: '' })
    const [translationsLoaded, setTranslationsLoaded] = useState(false)

    useEffect(() => {
        if (rulesData && typeof rulesData.htmlContent === 'string') {
            setHtmlContent(rulesData.htmlContent)
            setHtmlContents(prev => ({ ...prev, AZ: rulesData.htmlContent }))
        }
    }, [rulesData])

    useEffect(() => {
        if (gymId && !translationsLoaded) {
            apiGet<any[]>('/admin/translations', {
                params: { entityType: 'RESERVATION_RULE', entityId: String(gymId), fieldName: 'htmlContent' }
            }).then(res => {
                const list = Array.isArray(res) ? res : (res as any)?.data || []
                const contents: Record<string, string> = { ...htmlContents }
                list.forEach((item: any) => {
                    if (item.languageCode && item.fieldName === 'htmlContent') {
                        contents[item.languageCode.toUpperCase()] = item.fieldValue || ''
                    }
                })
                setHtmlContents(contents)
                setTranslationsLoaded(true)
            }).catch(() => {})
        }
    }, [gymId, translationsLoaded])

    const handleSubmit = () => {
        updateRulesMutation.mutate({
            gymId,
            htmlContent: htmlContents.AZ || htmlContent
        }, {
            onSuccess: async () => {
                const payload = Object.entries(htmlContents)
                    .filter(([lang, val]) => lang !== 'AZ' && val.trim() !== '')
                    .map(([lang, val]) => ({
                        entityType: 'RESERVATION_RULE',
                        entityId: String(gymId),
                        fieldName: 'htmlContent',
                        languageCode: lang,
                        fieldValue: val.trim(),
                    }))
                if (payload.length > 0) {
                    try { await apiPost('/admin/translations/bulk', payload) } catch (e) { console.error(e) }
                }
                setShowSuccess(true)
            }
        })
    }

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} style={{ maxWidth: '600px' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t.lessonHours.rulesModalTitle}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <Image src="/Sidebar/X.svg" width={24} height={24} alt="Close" />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Language Tabs */}
                    <div className="flex items-center border-b border-[#ececed] gap-1 mb-3">
                        {['AZ', 'EN', 'RU'].map((lang) => (
                            <button key={lang} type="button" onClick={() => setActiveTab(lang)}
                                className={`px-4 py-2 text-[13px] font-semibold transition-all border-b-2 ${
                                    activeTab === lang ? 'border-[#00b4cc] text-[#00b4cc]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>{lang}</button>
                        ))}
                    </div>

                    <div className={styles.inputGroup} style={{ gap: '12px' }}>
                        <label className={styles.label} style={{ fontWeight: '500' }}>{t.lessonHours.rulesHtmlLabel} ({activeTab})</label>
                        {isLoading ? (
                            <div className="py-8 text-center text-sm text-slate-400">{t.lessonHours.loading}</div>
                        ) : (
                            <textarea
                                className={cn(styles.input, "min-h-[240px] font-mono text-sm leading-relaxed p-4")}
                                style={{ resize: 'vertical' }}
                                placeholder={activeTab === 'AZ' ? '<p>Rezervasiya qaydaları HTML formatında...</p>' : activeTab === 'EN' ? '<p>Reservation rules in HTML format...</p>' : '<p>Правила бронирования в HTML формате...</p>'}
                                value={htmlContents[activeTab] || ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    setHtmlContents(prev => ({ ...prev, [activeTab]: val }))
                                    if (activeTab === 'AZ') setHtmlContent(val)
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>{t.lessonHours.cancelBtn}</button>
                    <button 
                        className={styles.saveBtn} 
                        onClick={handleSubmit}
                        disabled={updateRulesMutation.isPending || isLoading}
                    >
                        {updateRulesMutation.isPending ? t.lessonHours.waiting : t.lessonHours.saveBtn}
                    </button>
                </div>
            </div>
            
            <SuccessAnimationModal 
                isOpen={showSuccess} 
                onClose={() => {
                    setShowSuccess(false);
                    onClose();
                }} 
                message={t.lessonHours.rulesSuccess}
            />
        </div>
    )
}
