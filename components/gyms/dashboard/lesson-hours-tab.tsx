'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './lesson-hours-tab.module.css'
import {
    useGymLessonHours,
    useGymLessonHoursArchive,
    useDeleteLessonHour,
    useGymTrainers
} from '@/lib/query/gym-query'
import { useParams } from 'next/navigation'
import { AddLessonHourModal } from './modals/add-lesson-hour-modal'
import { EditGymRulesModal } from './modals/edit-gym-rules-modal'
import { ConfirmDeleteModal } from '../modals/confirm-delete-modal'
import { formatTo24h, cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { ChevronDown } from 'lucide-react'

const LessonHoursTab = () => {
    const t = useT()
    const { id: gymId } = useParams()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
    const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // Date range filtering states
    const [dateRange, setDateRange] = useState<string>('')
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    const handleDateRangeSelect = (range: string) => {
        if (range === 'custom') {
            setIsCalendarOpen(true)
            return
        }
        
        setDateRange(range)
        setSelectedRange(undefined)
        const today = new Date()
        let start = new Date()
        let end = new Date()
        
        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'thisWeek':
                start.setDate(today.getDate() - 7)
                start.setHours(0, 0, 0, 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1)
                start.setHours(0, 0, 0, 0)
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'all':
                setStartDate('')
                setEndDate('')
                setCurrentPage(1)
                return
            default:
                return
        }
        
        setStartDate(format(start, 'yyyy-MM-dd'))
        setEndDate(format(end, 'yyyy-MM-dd'))
        setCurrentPage(1)
    }

    const handleCustomDateSelect = (range: DateRange | undefined) => {
        setSelectedRange(range)
        if (range?.from && range?.to) {
            setStartDate(format(range.from, 'yyyy-MM-dd'))
            setEndDate(format(range.to, 'yyyy-MM-dd'))
            setCurrentPage(1)
        }
    }

    const [viewMode, setViewMode] = useState<'active' | 'archive'>('active')

    const { data: activeData, isLoading: isActiveLoading } = useGymLessonHours(gymId as string, { 
        page: currentPage, 
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    }, { enabled: viewMode === 'active' })

    const { data: archiveData, isLoading: isArchiveLoading } = useGymLessonHoursArchive(gymId as string, { 
        page: currentPage, 
        pageSize,
    }, { enabled: viewMode === 'archive' })

    const apiData = viewMode === 'active' ? activeData : archiveData
    const isLoading = viewMode === 'active' ? isActiveLoading : isArchiveLoading
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

            {/* Active / Archive Switcher */}
            <div className="flex items-center gap-2 mb-6 border-b border-[#ececed] pb-3 font-sans">
                <button
                    onClick={() => {
                        setViewMode('active')
                        setCurrentPage(1)
                    }}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                        viewMode === 'active'
                            ? "bg-[#00B4CC] text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                >
                    Aktiv
                </button>
                <button
                    onClick={() => {
                        setViewMode('archive')
                        setCurrentPage(1)
                    }}
                    className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                        viewMode === 'archive'
                            ? "bg-[#00B4CC] text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                >
                    Arxiv
                </button>
            </div>

            {/* Date range filter dropdown */}
            {viewMode === 'active' && (
                <div className="w-full flex items-center justify-start mb-6 font-sans">
                <div className="relative">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-10 w-[220px] rounded-lg bg-white border border-[#ececed] flex items-center justify-between px-4 text-sm font-medium text-black transition-all hover:border-[#00B4CC] hover:shadow-sm outline-none">
                                <span className="relative leading-[24px] truncate text-[14px]">
                                    {dateRange === 'today' ? 'Bu gün' :
                                     dateRange === 'thisWeek' ? 'Bu həftə' :
                                     dateRange === 'thisMonth' ? 'Bu ay' :
                                     (dateRange === 'custom' && selectedRange?.from && selectedRange?.to) ? 
                                        `${format(selectedRange.from, "dd.MM.yyyy")} - ${format(selectedRange.to, "dd.MM.yyyy")}` : 
                                     dateRange === 'custom' ? 'Xüsusi tarix' : 'Bütün vaxtlar'}
                                </span>
                                <ChevronDown size={20} className="text-black ml-2 shrink-0" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[213px] rounded-[12px] bg-white border border-[#ececed] p-3 flex flex-col gap-3 shadow-xl z-50">
                            <DropdownMenuItem 
                                onClick={() => handleDateRangeSelect('today')}
                                className={cn(
                                    "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1.5 cursor-pointer hover:bg-transparent focus:bg-transparent",
                                    dateRange === 'today' && "border-[#00B4CC]"
                                )}
                            >
                                <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bu gün</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDateRangeSelect('thisWeek')}
                                className={cn(
                                    "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1.5 cursor-pointer hover:bg-transparent focus:bg-transparent",
                                    dateRange === 'thisWeek' && "border-[#00B4CC]"
                                )}
                            >
                                <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bu həftə</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDateRangeSelect('thisMonth')}
                                className={cn(
                                    "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1.5 cursor-pointer hover:bg-transparent focus:bg-transparent",
                                    dateRange === 'thisMonth' && "border-[#00B4CC]"
                                )}
                            >
                                <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bu ay</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDateRangeSelect('custom')}
                                className={cn(
                                    "self-stretch border-b border-[#ececed] flex items-center p-0 pb-1.5 cursor-pointer hover:bg-transparent focus:bg-transparent",
                                    dateRange === 'custom' && "border-[#00B4CC]"
                                )}
                            >
                                <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Xüsusi tarix</div>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => handleDateRangeSelect('all')}
                                className={cn(
                                    "self-stretch flex items-center p-0 cursor-pointer hover:bg-transparent focus:bg-transparent",
                                    dateRange === 'all' && "border-b border-[#00B4CC] pb-1.5"
                                )}
                            >
                                <div className="flex-1 relative leading-[24px] text-[16px] font-sans font-medium text-black">Bütün vaxtlar</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogContent className="w-[395px] min-h-[389px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white font-sans flex flex-col z-[100]">
                        <div className="bg-[#fafafa] border-b border-[#ececed] p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="text-[12px] text-[#8e8c8c] font-bold uppercase tracking-wider">Tarix</div>
                                <button onClick={() => setIsCalendarOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                     <Image src="/close.svg" width={20} height={20} alt="close" className="opacity-40" />
                                </button>
                            </div>
                            <div className="h-[54px] w-full rounded-xl bg-white border border-[#ececed] flex items-center justify-between px-4 text-[15px] font-bold text-[#101828]">
                                <span>
                                    {selectedRange?.from ? (
                                        selectedRange.to ? (
                                            <>
                                                {format(selectedRange.from, "dd.MM.yyyy")} - {format(selectedRange.to, "dd.MM.yyyy")}
                                            </>
                                        ) : (
                                            format(selectedRange.from, "dd.MM.yyyy")
                                        )
                                    ) : (
                                        "Tarix seçin"
                                    )}
                                </span>
                                <Image src="/Calendar.svg" width={22} height={22} alt="calendar" />
                            </div>
                        </div>
                        
                        <div className="flex-1 px-4 py-2 flex justify-center overflow-y-auto">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={selectedRange?.from || new Date()}
                                selected={selectedRange}
                                onSelect={handleCustomDateSelect}
                                numberOfMonths={1}
                                locale={az}
                                className="w-full"
                            />
                        </div>

                        <div className="p-5 border-t border-[#ececed] flex items-center gap-3 bg-white mt-auto">
                            <button 
                                onClick={() => {
                                    setSelectedRange(undefined);
                                    setIsCalendarOpen(false);
                                }}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Ləğv et
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedRange?.from && selectedRange?.to) {
                                        setDateRange('custom')
                                        setIsCalendarOpen(false)
                                    }
                                }}
                                disabled={!selectedRange?.from || !selectedRange?.to}
                                className="flex-1 h-11 rounded-xl bg-[#00B4CC] text-sm font-bold text-white hover:bg-[#009DB3] transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-300"
                            >
                                Tətbiq et
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            )}

            {isLoading ? (
                <div className={styles.loading}>{t.lessonHours.loading}</div>
            ) : lessonHours.length === 0 ? (
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
                                            {viewMode === 'active' && (
                                                <button className={styles.deleteBtn} onClick={() => setDeleteLessonId(hour.id)}>
                                                    <Image src="/trash.png" width={20} height={20} alt="Delete" />
                                                </button>
                                            )}
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
                                    activePage === 1 ? "bg-[#00b4cc] text-white font-bold" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
                                        activePage === 2 ? "bg-[#00b4cc] text-white font-bold" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
                                        activePage === 3 ? "bg-[#00b4cc] text-white font-bold" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
                                        activePage === 4 ? "bg-[#00b4cc] text-white font-bold" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
                                        activePage === totalPages ? "bg-[#00b4cc] text-white font-bold" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
