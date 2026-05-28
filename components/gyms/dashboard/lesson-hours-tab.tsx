'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './lesson-hours-tab.module.css'
import { 
    useGymLessonHours, 
    useDeleteLessonHour,
    useGymTrainers,
    useGymLessonTypes
} from '@/lib/query/gym-query'
import { useParams } from 'next/navigation'
import { AddLessonHourModal } from './modals/add-lesson-hour-modal'
import { EditGymRulesModal } from './modals/edit-gym-rules-modal'
import { ConfirmDeleteModal } from '../modals/confirm-delete-modal'
import { formatTo24h, cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const LessonHoursTab = () => {
    const t = useT()
    const { id: gymId } = useParams()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
    const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null)

    const { data: lessonHours, isLoading } = useGymLessonHours(gymId as string)
    const deleteMutation = useDeleteLessonHour()

    const handleDelete = () => {
        if (!deleteLessonId) return
        deleteMutation.mutate({ gymId: Number(gymId), lessonHourId: deleteLessonId }, {
            onSuccess: () => setDeleteLessonId(null)
        })
    }

    if (isLoading) return <div className={styles.loading}>{t.lessonHours.loading}</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t.lessonHours.title}</h2>
                <div className="flex items-center gap-3">
                    <button 
                        className={cn(styles.addBtn, "bg-white border border-[#00B4CC] text-[#00B4CC] hover:bg-slate-50")} 
                        onClick={() => setIsRulesModalOpen(true)}
                    >
                        {t.lessonHours.addRulesBtn}
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                        {t.lessonHours.addBtn}
                    </button>
                </div>
            </div>

            {!lessonHours || lessonHours.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                        <h3 className={styles.emptyTitle}>{t.lessonHours.emptyTitle}</h3>
                        <p className={styles.emptySubtitle}>{t.lessonHours.emptySubtitle}</p>
                    </div>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{t.lessonHours.classType}</th>
                                <th>{t.lessonHours.trainer}</th>
                                <th>{t.lessonHours.date}</th>
                                <th>{t.lessonHours.time}</th>
                                <th>{t.lessonHours.places}</th>
                                <th>{t.lessonHours.status}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessonHours.map((hour: any) => (
                                <tr key={hour.id}>
                                    <td>{hour.lessonTypeName}</td>
                                    <td>{hour.trainerName}</td>
                                    <td>{hour.date}</td>
                                    <td>{formatTo24h(hour.timeRange)}</td>
                                    <td>{hour.emptySpaces}</td>
                                    <td>
                                        <span className={styles.statusBadge}>
                                            {hour.status === 'OPEN' ? t.lessonHours.statusActive : t.lessonHours.statusClosed}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.deleteBtn} onClick={() => setDeleteLessonId(hour.id)}>
                                            <Image src="/trash.png" width={20} height={20} alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isAddModalOpen && (
                <AddLessonHourModal 
                    gymId={Number(gymId)} 
                    onClose={() => setIsAddModalOpen(false)} 
                />
            )}
            {isRulesModalOpen && (
                <EditGymRulesModal
                    gymId={Number(gymId)}
                    onClose={() => setIsRulesModalOpen(false)}
                />
            )}
            {deleteLessonId !== null && (
                <ConfirmDeleteModal
                    name={lessonHours?.find((h: any) => h.id === deleteLessonId)?.lessonTypeName || t.lessonHours.fallbackName}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteLessonId(null)}
                    isLoading={deleteMutation.isPending}
                />
            )}
        </div>
    )
}

export default LessonHoursTab
