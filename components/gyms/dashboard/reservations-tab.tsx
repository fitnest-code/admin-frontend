'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './reservations-tab.module.css'
import { 
    useGymReservations, 
    useReservationDetail, 
    useUpdateReservationStatus, 
    useGymReservationStats 
} from '@/lib/query/gym-query'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const STATUS_OPTIONS = [
    { key: "", label: "Hamısı", color: "#4b5563" },
    { key: "PENDING", label: "Gözləmədə", color: "#ec972f" },
    { key: "APPROVED", label: "Təsdiq olundu", color: "#166728" },
    { key: "CANCELLED", label: "Ləğv edildi", color: "#c9373a" },
    { key: "REJECTED", label: "İmtina olundu", color: "#8a38f5" },
    { key: "EXPIRED", label: "Müddəti bitib", color: "#9ca3af" },
];

const ReservationsTab = () => {
    const { id: gymId } = useParams()
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
    const [page, setPage] = useState(1)
    const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [rejectionError, setRejectionError] = useState(false)

    // Dropdown states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)

    const { data: stats } = useGymReservationStats(gymId as string)
    const { data: reservationsData, isLoading } = useGymReservations(gymId as string, {
        status: statusFilter,
        page,
        pageSize: 10
    })

    const { data: detailData } = useReservationDetail(selectedReservationId)
    const updateStatusMutation = useUpdateReservationStatus()

    const handleStatusFilter = (status: string | undefined) => {
        setStatusFilter(status)
        setPage(1)
        setIsStatusDropdownOpen(false)
    }

    const handleOpenDetail = (id: number) => {
        setSelectedReservationId(id)
        setIsDetailModalOpen(true)
    }

    const handleApprove = (id: number) => {
        updateStatusMutation.mutate({
            reservationId: id,
            status: 'APPROVED'
        })
    }

    const handleRejectClick = (id: number) => {
        setSelectedReservationId(id)
        setIsRejectionModalOpen(true)
    }

    const handleConfirmRejection = () => {
        if (!rejectionReason.trim()) {
            setRejectionError(true)
            return
        }
        if (selectedReservationId) {
            updateStatusMutation.mutate({
                reservationId: selectedReservationId,
                status: 'REJECTED',
                reason: rejectionReason
            }, {
                onSuccess: () => {
                    setIsRejectionModalOpen(false)
                    setRejectionReason('')
                    setRejectionError(false)
                    setIsDetailModalOpen(false)
                }
            })
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Gözləmədə'
            case 'APPROVED': return 'Təsdiqlənib'
            case 'CANCELLED': return 'Ləğv edilib'
            case 'REJECTED': return 'İmtina edilib'
            default: return status
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PENDING': return styles.odeniStatus
            case 'APPROVED': return styles.odeniStatus2
            case 'CANCELLED': return styles.odeniStatus3
            case 'REJECTED': return styles.odeniStatus4
            default: return styles.odeniStatus
        }
    }

    const totalPages = Math.ceil((reservationsData?.total || 0) / 10) || 1;

    return (
        <div className={styles.container}>
            {/* Header / Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statTitleWrapper}>
                        <div className={styles.statTitle}>Ümumi Rezervasiya</div>
                    </div>
                    <div className={styles.statValueWrapper}>
                        <b className={styles.statValue}>{stats?.total || 0}</b>
                    </div>
                    <div className={styles.statSubtitleWrapper}>
                        <div className={styles.statSubtitle}>Bu ay</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitleWrapper}>
                        <div className={styles.statTitle}>Gözləmədə</div>
                    </div>
                    <div className={`${styles.statValueWrapper} ${styles.colorOrange}`}>
                        <b className={styles.statValue}>{stats?.pending || 0}</b>
                    </div>
                    <div className={styles.statSubtitleWrapper}>
                        <div className={styles.statSubtitle}>Təsdiq gözləyir</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitleWrapper}>
                        <div className={styles.statTitle}>Təsdiq olundu</div>
                    </div>
                    <div className={`${styles.statValueWrapper} ${styles.colorGreen}`}>
                        <b className={styles.statValue}>{stats?.confirmed || 0}</b>
                    </div>
                    <div className={styles.statSubtitleWrapper}>
                        <div className={styles.statSubtitle}>Bu ay</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitleWrapper}>
                        <div className={styles.statTitle}>Ləğv edildi</div>
                    </div>
                    <div className={`${styles.statValueWrapper} ${styles.colorRed}`}>
                        <b className={styles.statValue}>{stats?.cancelled || 0}</b>
                    </div>
                    <div className={styles.statSubtitleWrapper}>
                        <div className={styles.statSubtitle}>Bu ay</div>
                    </div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className={styles.frameParent2}>
                <div className={styles.statusParent}>
                    <div className={styles.statusLabel}>Status:</div>
                    <div className="relative">
                        <div 
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className="h-[40px] w-[180px] bg-white border border-[#ececed] rounded-lg flex items-center justify-between px-4 cursor-pointer hover:border-[#00B4CC] transition-all shadow-sm"
                        >
                            <span className="text-[14px] text-black">
                                {statusFilter ? STATUS_OPTIONS.find(o => o.key === statusFilter)?.label : "Hamısı"}
                            </span>
                            <ChevronDown size={18} className={cn("text-black transition-transform flex-shrink-0", isStatusDropdownOpen && "rotate-180")} />
                        </div>
                        {isStatusDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#ececed] rounded-xl shadow-xl flex flex-col p-4 gap-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button 
                                            key={opt.key}
                                            onClick={() => {
                                                handleStatusFilter(opt.key ? opt.key : undefined);
                                            }}
                                            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                                        >
                                            {opt.key && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />}
                                            <span className="text-[14px] font-medium text-[#001028] whitespace-nowrap">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.musteriParent}>
                    <div className={styles.musteri3}>
                        <div className={styles.adSoyadWrapper}>
                            <div className={styles.adSoyad}>Ad / Soyad</div>
                        </div>
                        <div className={styles.tarix}>Tarix</div>
                        <div className={styles.saat}>Saat</div>
                        <div className={styles.status2}>Status</div>
                        <div className={styles.mqi}>Məşqçi</div>
                        <div className={styles.mkanAxtar}>Əməliyyatlar</div>
                    </div>

                    {isLoading ? (
                        <div className={styles.frameParent3} style={{ justifyContent: 'center', color: '#999' }}>Yüklənir...</div>
                    ) : reservationsData?.items?.length === 0 ? (
                        <div className={styles.frameParent3} style={{ justifyContent: 'center', color: '#999' }}>Rezervasiya tapılmadı</div>
                    ) : reservationsData?.items?.map((res: any) => (
                        <React.Fragment key={res.id}>
                            <div className={styles.frameParent3}>
                                <div className={styles.frameWrapper}>
                                    <div className={styles.ayxanSalmanzadWrapper}>
                                        <div className={styles.mkanAxtar}>{res.userFullName}</div>
                                    </div>
                                </div>
                                <div className={styles.mart2026}>{res.date}</div>
                                <div className={styles.mkanAxtar}>{res.timeRange}</div>
                                <div className={getStatusClass(res.status)}>
                                    <div className={styles.component32Child} />
                                    <div className={styles.aktiv}>{getStatusText(res.status)}</div>
                                </div>
                                <div className={styles.adSoyadContainer}>
                                    <div className={styles.mkanAxtar}>{res.trainerName}</div>
                                </div>
                                <div className={styles.moreWrapper} onClick={() => handleOpenDetail(res.id)}>
                                    <div className={styles.moreWrapper}>
                                        <div className={styles.more}>
                                            <Image src="/more.svg" width={24} height={24} alt="More" className={styles.vuesaxlinearmoreIcon} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(res.status === 'REJECTED' || res.status === 'CANCELLED') && res.reason && (
                                <div className={styles.frameWrapper9}>
                                    <div className={styles.frameWrapper10}>
                                        <div className={styles.rectangleParent}>
                                            <div className={styles.frameItem} />
                                            <div className={styles.lvEtmSbbiParent}>
                                                <div className={styles.lvEtmSbbi}>Ləğv etmə səbəbi</div>
                                                <b className={styles.tciliIlLaqdar}>{res.reason}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-[18px] mt-8 select-none">
                {/* Page 1 */}
                <button 
                    onClick={() => setPage(1)}
                    className={cn(
                    "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                    page === 1 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                    )}
                >
                    1
                </button>
                
                {/* Page 2 */}
                {totalPages >= 2 && (
                    <button 
                    onClick={() => setPage(2)}
                    className={cn(
                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                        page === 2 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                    )}
                    >
                    2
                    </button>
                )}

                {/* Page 3 */}
                {totalPages >= 3 && (
                    <button 
                    onClick={() => setPage(3)}
                    className={cn(
                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                        page === 3 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                    )}
                    >
                    3
                    </button>
                )}

                {/* Page 4 */}
                {totalPages >= 4 && (
                    <button 
                    onClick={() => setPage(4)}
                    className={cn(
                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                        page === 4 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
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
                    onClick={() => setPage(totalPages)}
                    className={cn(
                        "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                        page === totalPages ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                    )}
                    >
                    {totalPages}
                    </button>
                )}
                </div>
            )}

            {/* Detail Modal */}
            {isDetailModalOpen && detailData && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Rezervasiya Detalları</h2>
                            <button className={styles.closeBtn} onClick={() => setIsDetailModalOpen(false)}>
                                <Image src="/close.svg" width={24} height={24} alt="Close" />
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailGroup}>
                                    <label>Müştəri</label>
                                    <div>{detailData.userFullName}</div>
                                </div>
                                <div className={styles.detailGroup}>
                                    <label>Telefon</label>
                                    <div>{detailData.userPhone}</div>
                                </div>
                                <div className={styles.detailGroup}>
                                    <label>E-poçt</label>
                                    <div>{detailData.userEmail}</div>
                                </div>
                                <div className={styles.detailGroup}>
                                    <label>Tarix / Saat</label>
                                    <div>{detailData.date} | {detailData.timeRange}</div>
                                </div>
                                <div className={styles.detailGroup}>
                                    <label>Məşqçi</label>
                                    <div>{detailData.trainerName}</div>
                                </div>
                                <div className={styles.detailGroup}>
                                    <label>Dərs növü</label>
                                    <div>{detailData.lessonType}</div>
                                </div>
                            </div>

                            {detailData.cancelReason && (
                                <div className={styles.reasonBox}>
                                    <label>İmtina səbəbi:</label>
                                    <p>{detailData.cancelReason}</p>
                                </div>
                            )}

                            {detailData.status === 'PENDING' && (
                                <div className={styles.modalActions}>
                                    <button className={styles.approveBtn} onClick={() => handleApprove(detailData.id)}>
                                        Təsdiqlə
                                    </button>
                                    <button className={styles.rejectBtn} onClick={() => handleRejectClick(detailData.id)}>
                                        İmtina et
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {isRejectionModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.rejectionModal}>
                        <h3>İmtina səbəbi</h3>
                        <p>Zəhmət olmasa imtina səbəbini qeyd edin</p>
                        <textarea 
                            className={`${styles.reasonInput} ${rejectionError ? styles.inputError : ''}`}
                            placeholder="Səbəbi bura yazın..."
                            value={rejectionReason}
                            onChange={(e) => {
                                setRejectionReason(e.target.value)
                                if (e.target.value.trim()) setRejectionError(false)
                            }}
                        />
                        {rejectionError && <span className={styles.errorText}>Səbəb qeyd edilməlidir</span>}
                        <div className={styles.rejectionActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsRejectionModalOpen(false)}>Ləğv et</button>
                            <button className={styles.confirmRejectBtn} onClick={handleConfirmRejection}>Təsdiqlə</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReservationsTab
