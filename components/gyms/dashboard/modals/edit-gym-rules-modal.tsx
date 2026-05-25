'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './add-lesson-hour-modal.module.css' // Reuse modal layout styles
import { cn } from '@/lib/utils'
import { useGymRulesQuery, useUpdateGymRules } from '@/lib/query/gym-query'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

interface Props {
    gymId: number
    onClose: () => void
}

export const EditGymRulesModal = ({ gymId, onClose }: Props) => {
    const { data: rulesData, isLoading } = useGymRulesQuery(gymId)
    const updateRulesMutation = useUpdateGymRules()
    
    const [htmlContent, setHtmlContent] = useState('')
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        if (rulesData && typeof rulesData.htmlContent === 'string') {
            setHtmlContent(rulesData.htmlContent)
        }
    }, [rulesData])

    const handleSubmit = () => {
        updateRulesMutation.mutate({
            gymId,
            htmlContent
        }, {
            onSuccess: () => setShowSuccess(true)
        })
    }

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal} style={{ maxWidth: '600px' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Rezervasiya Qaydalarını Redaktə Et</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <Image src="/Sidebar/X.svg" width={24} height={24} alt="Close" />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.inputGroup} style={{ gap: '12px' }}>
                        <label className={styles.label} style={{ fontWeight: '500' }}>Qaydaların HTML Mətni</label>
                        {isLoading ? (
                            <div className="py-8 text-center text-sm text-slate-400">Yüklənir...</div>
                        ) : (
                            <textarea
                                className={cn(styles.input, "min-h-[240px] font-mono text-sm leading-relaxed p-4")}
                                style={{ resize: 'vertical' }}
                                placeholder="<p>Rezervasiya qaydaları HTML formatında...</p>"
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
                    <button 
                        className={styles.saveBtn} 
                        onClick={handleSubmit}
                        disabled={updateRulesMutation.isPending || isLoading}
                    >
                        {updateRulesMutation.isPending ? 'Gözləyin...' : 'Yadda saxla'}
                    </button>
                </div>
            </div>
            
            <SuccessAnimationModal 
                isOpen={showSuccess} 
                onClose={() => {
                    setShowSuccess(false);
                    onClose();
                }} 
                message="Qaydalar uğurla yeniləndi"
            />
        </div>
    )
}
