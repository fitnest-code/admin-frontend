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
import { formatTo24h } from '@/lib/utils'

const LessonHoursTab = () => {
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

    if (isLoading) return <div className={styles.loading}>Yüklənir...</div>

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Dərs saatları</h2>
                <div className="flex items-center gap-3">
                    <button 
                        className={cn(styles.addBtn, "bg-white border border-[#00B4CC] text-[#00B4CC] hover:bg-slate-50")} 
                        onClick={() => setIsRulesModalOpen(true)}
                    >
                        Qaydaları əlavə et
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                        Əlavə et
                    </button>
                </div>
            </div>

            {!lessonHours || lessonHours.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                        <h3 className={styles.emptyTitle}>Dərs saatları əlavə edilməyib</h3>
                        <p className={styles.emptySubtitle}>Dərs saatı əlavə etmək üçün əlavə et düyməsini sıxın</p>
                    </div>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Dərs növü</th>
                                <th>Məşqçi</th>
                                <th>Tarix</th>
                                <th>Saat</th>
                                <th>Yer</th>
                                <th>Status</th>
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
                                            {hour.status === 'OPEN' ? 'Aktiv' : 'Bağlı'}
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
                    name={lessonHours?.find((h: any) => h.id === deleteLessonId)?.lessonTypeName || 'Dərs saatı'}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteLessonId(null)}
                    isLoading={deleteMutation.isPending}
                />
            )}
        </div>
    )
}

export default LessonHoursTab
