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
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { data: apiData, isLoading } = useGymLessonHours(gymId as string, { page: currentPage, pageSize })
    const deleteMutation = useDeleteLessonHour()

    const lessonHours = apiData?.items || []
    const total = apiData?.total || 0
    const totalPages = Math.ceil(total / pageSize)
    const activePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1

    const handleDelete = () => {
        if (!deleteLessonId) return
        deleteMutation.mutate({ gymId: Number(gymId), lessonHourId: deleteLessonId }, {
            onSuccess: () => {
                setDeleteLessonId(null)
                // If we are on a page > 1, and this was the last remaining item on this page, go back 1 page
                if (activePage > 1 && (total - 1) % pageSize === 0) {
                    setCurrentPage(activePage - 1)
                }
            }
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

            {lessonHours.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                        <h3 className={styles.emptyTitle}>{t.lessonHours.emptyTitle}</h3>
                        <p className={styles.emptySubtitle}>{t.lessonHours.emptySubtitle}</p>
                    </div>
                </div>
            ) : (
                <>
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

                    {/* Pagination Section */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-[18px] mt-8 select-none font-sans">
                            {/* Page 1 */}
                            <button 
                                onClick={() => setCurrentPage(1)}
                                className={cn(
                                    "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                                    activePage === 1 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                                )}
                            >
                                1
                            </button>
                            
                            {/* Page 2 */}
                            {totalPages >= 2 && (
                                <button 
                                    onClick={() => setCurrentPage(2)}
                                    className={cn(
                                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                                        activePage === 2 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                                    )}
                                >
                                    2
                                </button>
                            )}

                            {/* Page 3 */}
                            {totalPages >= 3 && (
                                <button 
                                    onClick={() => setCurrentPage(3)}
                                    className={cn(
                                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                                        activePage === 3 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                                    )}
                                >
                                    3
                                </button>
                            )}

                            {/* Page 4 */}
                            {totalPages >= 4 && (
                                <button 
                                    onClick={() => setCurrentPage(4)}
                                    className={cn(
                                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                                        activePage === 4 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                                    )}
                                >
                                    4
                                </button>
                            )}

                            {/* Ellipsis */}
                            {totalPages > 5 && (
                                <div className="h-8 w-8 rounded bg-white border border-[#ececed] flex items-center justify-center gap-[1px]">
                                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                                </div>
                            )}

                            {/* Last Page */}
                            {totalPages > 4 && (
                                <button 
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={cn(
                                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                                        activePage === totalPages ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                                    )}
                                >
                                    {totalPages}
                                </button>
                            )}
                        </div>
                    )}
                </>
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
