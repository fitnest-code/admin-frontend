'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './reservations-tab.module.css'
import { 
    useGymReservations, 
    useReservationDetail, 
    useUpdateReservationStatus, 
    useGymReservationStats 
} from '@/lib/query/gym-query'
import { useParams } from 'next/navigation'
import { cn, formatTo24h } from '@/lib/utils'
import { ChevronDown, ArrowLeft } from 'lucide-react'

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
    const [rejectionReason, setRejectionReason] = useState('')
    const [rejectionError, setRejectionError] = useState(false)

    // Dropdown states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
    const [activeActionsDropdownId, setActiveActionsDropdownId] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
    const dropdownRef = useRef<HTMLDivElement | null>(null)

    const { data: stats } = useGymReservationStats(gymId as string)
    const { data: reservationsData, isLoading } = useGymReservations(gymId as string, {
        status: statusFilter,
        page,
        pageSize: 10
    })

    const { data: detailData } = useReservationDetail(selectedReservationId)
    const updateStatusMutation = useUpdateReservationStatus()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveActionsDropdownId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleStatusFilter = (status: string | undefined) => {
        setStatusFilter(status)
        setPage(1)
        setIsStatusDropdownOpen(false)
    }

    const handleApprove = (id: number) => {
        updateStatusMutation.mutate({
            reservationId: id,
            status: 'APPROVED'
        }, {
            onSuccess: () => {
                setActiveActionsDropdownId(null)
            }
        })
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

    // Detailed Reservation View Mode
    if (viewMode === 'detail' && detailData) {
        const getDetailStatusBadge = (status: string) => {
            switch (status) {
                case 'PENDING': return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Gözləmədə</span>
                case 'APPROVED': return <span className={`${styles.statusBadge} ${styles.statusApproved}`}>Təsdiq edilib</span>
                case 'CANCELLED': return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Ləğv edilib</span>
                case 'REJECTED': return <span className={`${styles.statusBadge} ${styles.statusRejected}`}>İmtina edilib</span>
                default: return <span className={styles.statusBadge}>{status}</span>
            }
        }

        const handleDetailApprove = () => {
            updateStatusMutation.mutate({
                reservationId: detailData.id,
                status: 'APPROVED'
            }, {
                onSuccess: () => {
                    setViewMode('list')
                }
            })
        }

        const handleDetailReject = () => {
            if (!rejectionReason.trim()) {
                setRejectionError(true)
                return
            }
            updateStatusMutation.mutate({
                reservationId: detailData.id,
                status: 'REJECTED',
                reason: rejectionReason
            }, {
                onSuccess: () => {
                    setRejectionReason('')
                    setRejectionError(false)
                    setViewMode('list')
                }
            })
        }

        return (
            <div className={styles.detailContainer}>
                {/* Back button and title */}
                <div className={styles.detailHeaderRow}>
                    <button className={styles.backBtn} onClick={() => {
                        setViewMode('list');
                        setRejectionReason('');
                        setRejectionError(false);
                    }}>
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        <span>Geri qayıt</span>
                    </button>
                    <div className={styles.detailTitle}>Rezervasiya detallı</div>
                </div>

                <div className={styles.detailCardParent}>
                    {/* User profile / basic info header card */}
                    <div className={styles.detailCard}>
                        <div className={styles.customerHeader}>
                            <div className={styles.customerNameSection}>
                                <div className={styles.customerName}>{detailData.userFullName}</div>
                                {getDetailStatusBadge(detailData.status)}
                            </div>
                        </div>

                        <div className={styles.metaInfoGrid}>
                            <div className={styles.metaInfoItem}>
                                <span className={styles.metaLabel}>User ID:</span>
                                <span className={styles.metaValue}>{String(detailData.userId).padStart(7, '0')}</span>
                            </div>
                            <div className={styles.metaInfoItem}>
                                <span className={styles.metaLabel}>Qeydiyyat tarixi:</span>
                                <span className={styles.metaValue}>{detailData.regDate || 'N/A'}</span>
                            </div>
                            <div className={styles.metaInfoItem}>
                                <span className={styles.metaLabel}>Platforma:</span>
                                <span className={styles.metaValue}>{detailData.platform === 'N/A' ? 'İOS' : detailData.platform}</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal & Lesson Info Grid */}
                    <div className={styles.detailGrid2}>
                        {/* Personal info card */}
                        <div className={styles.detailCard}>
                            <div className={styles.detailCardTitle}>Şəxsi məlumatlar</div>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center py-1 border-b border-[#f3f4f6]">
                                    <span className="text-[13px] text-slate-500 font-medium">Telefon nömrəsi:</span>
                                    <span className="text-[14px] text-slate-800 font-bold">{detailData.userPhone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-[#f3f4f6]">
                                    <span className="text-[13px] text-slate-500 font-medium">Email:</span>
                                    <span className="text-[14px] text-slate-800 font-bold">{detailData.userEmail || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-[#f3f4f6]">
                                    <span className="text-[13px] text-slate-500 font-medium">Doğum tarixi:</span>
                                    <span className="text-[14px] text-slate-800 font-bold">{detailData.birthDate || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-[#f3f4f6]">
                                    <span className="text-[13px] text-slate-500 font-medium">Məşqçi:</span>
                                    <span className="text-[14px] text-slate-800 font-bold">{detailData.trainerName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-[#f3f4f6]">
                                    <span className="text-[13px] text-slate-500 font-medium">Növ:</span>
                                    <span className="text-[14px] text-slate-800 font-bold">{detailData.lessonType || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Panel for rejection/approval */}
                        {detailData.status === 'PENDING' && (
                            <div className={styles.actionPanel}>
                                <div className={styles.actionTitle}>Imtina səbəbi qeyd olunmalıdır</div>
                                <textarea
                                    id="rejectionReasonTextarea"
                                    className={cn(styles.reasonArea, rejectionError && "border-red-500")}
                                    placeholder="İmtina səbəbini bura qeyd edin..."
                                    value={rejectionReason}
                                    onChange={(e) => {
                                        setRejectionReason(e.target.value)
                                        if (e.target.value.trim()) setRejectionError(false)
                                    }}
                                />
                                {rejectionError && <span className={styles.errorText}>Zəhmət olmasa imtina səbəbini qeyd edin</span>}

                                <div className={styles.actionButtonRow}>
                                    <button className={styles.actionRejectBtn} onClick={handleDetailReject}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                        <span>İmtina</span>
                                    </button>
                                    <button className={styles.actionApproveBtn} onClick={handleDetailApprove}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Təsdiq et</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* If status is already REJECTED or CANCELLED, show the saved reason */}
                        {(detailData.status === 'REJECTED' || detailData.status === 'CANCELLED') && detailData.cancelReasonText && (
                            <div className={styles.detailCard}>
                                <div className={styles.detailCardTitle} style={{ color: '#c9373a', borderBottomColor: '#fee2e2' }}>Ləğv etmə səbəbi</div>
                                <p className="text-[15px] font-bold text-slate-800 leading-relaxed bg-red-50/50 p-4 rounded-lg border border-red-100">
                                    {detailData.cancelReasonText}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Reservation List View Mode
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
                                <div className={styles.mkanAxtar}>{formatTo24h(res.timeRange)}</div>
                                <div className={getStatusClass(res.status)}>
                                    <div className={styles.component32Child} />
                                    <div className={styles.aktiv}>{getStatusText(res.status)}</div>
                                </div>
                                <div className={styles.adSoyadContainer}>
                                    <div className={styles.mkanAxtar}>{res.trainerName}</div>
                                </div>
                                <div className="relative">
                                    <div className={styles.moreWrapper} onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveActionsDropdownId(activeActionsDropdownId === res.id ? null : res.id);
                                    }}>
                                        <div className={styles.more}>
                                            <Image src="/more.svg" width={24} height={24} alt="More" className={styles.vuesaxlinearmoreIcon} />
                                        </div>
                                    </div>
                                    {activeActionsDropdownId === res.id && (
                                        <div ref={dropdownRef} className={styles.popoverMenu} onClick={(e) => e.stopPropagation()}>
                                            <button className={styles.popoverBtn} onClick={() => {
                                                setSelectedReservationId(res.id);
                                                setViewMode('detail');
                                                setActiveActionsDropdownId(null);
                                            }}>
                                                <div className={styles.popoverFrameParent}>
                                                    <div className={styles.popoverEyeWrapper}>
                                                        <div className={styles.popoverEye}>
                                                            <div className={styles.popoverEye2}>
                                                                <svg className={styles.popoverVectorIcon} width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M7.5 0.5C4.0625 0.5 1.15625 2.58125 0 5.5C1.15625 8.41875 4.0625 10.5 7.5 10.5C10.9375 10.5 13.8438 8.41875 15 5.5C13.8438 2.58125 10.9375 0.5 7.5 0.5ZM7.5 8.83333C5.65625 8.83333 4.16667 7.34375 4.16667 5.5C4.16667 3.65625 5.65625 2.16667 7.5 2.16667C9.34375 2.16667 10.8333 3.65625 10.8333 5.5C10.8333 7.34375 9.34375 8.83333 7.5 8.83333ZM7.5 3.5C6.39583 3.5 5.5 4.39583 5.5 5.5C5.5 6.60417 6.39583 7.5 7.5 7.5C8.60417 7.5 9.5 6.60417 9.5 5.5C9.5 4.39583 8.60417 3.5 7.5 3.5Z" fill="#364153"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.popoverBax}>Bax</div>
                                                </div>
                                            </button>
                                            <button className={styles.popoverBtn2} onClick={() => {
                                                handleApprove(res.id);
                                                setActiveActionsDropdownId(null);
                                            }}>
                                                <div className={styles.popoverCheckWrapper}>
                                                    <div className={styles.popoverEye}>
                                                        <div className={styles.popoverEye2}>
                                                            <svg className={styles.popoverVectorIcon2} width="13" height="10" viewBox="0 0 13 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1.5 5L4.5 8L11.5 1.5" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={styles.popoverTsdiqEt}>Təsdiq et</div>
                                            </button>
                                            <button className={styles.popoverBtn3} onClick={() => {
                                                setSelectedReservationId(res.id);
                                                setViewMode('detail');
                                                setActiveActionsDropdownId(null);
                                                setTimeout(() => {
                                                    const textarea = document.getElementById('rejectionReasonTextarea');
                                                    if (textarea) textarea.focus();
                                                }, 150);
                                            }}>
                                                <div className={styles.popoverCheckWrapper}>
                                                    <div className={styles.popoverEye}>
                                                        <div className={styles.popoverEye2}>
                                                            <svg className={styles.popoverVectorIcon3} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1 1L9 9M9 1L1 9" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={styles.popoverTsdiqEt}>İmtina et</div>
                                            </button>
                                            <div className={styles.popoverLine} />
                                        </div>
                                    )}
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
                <button 
                    onClick={() => setPage(1)}
                    className={cn(
                    "h-8 w-8 rounded flex items-center justify-center text-[16px] font-semibold transition-all",
                    page === 1 ? "bg-[#00b4cc] text-white" : "bg-white border border-[#ececed] text-black hover:bg-slate-50"
                    )}
                >
                    1
                </button>
                
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

                {totalPages > 5 && (
                    <div className="h-8 w-8 rounded bg-white border border-[#ececed] flex items-center justify-center gap-[1px]">
                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                    <div className="h-[3px] w-[3px] rounded-full bg-black" />
                    </div>
                )}

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
        </div>
    )
}

export default ReservationsTab
