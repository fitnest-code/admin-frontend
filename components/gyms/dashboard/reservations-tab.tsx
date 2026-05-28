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
            case 'APPROVED': return 'Uğurlu'
            case 'CANCELLED': return 'Ləğv'
            case 'REJECTED': return 'Imtina olundu'
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
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    // Detailed Reservation View Mode
    if (viewMode === 'detail' && detailData) {
        const getStatusBadgeText = (status: string) => {
            switch (status) {
                case 'PENDING': return 'Gözləmədə';
                case 'APPROVED': return 'Təsdiq edilib';
                case 'CANCELLED': return 'Ləğv edilib';
                case 'REJECTED': return 'İmtina edilib';
                default: return status;
            }
        }

        const getStatusBadgeClass = (status: string) => {
            switch (status) {
                case 'PENDING': return styles.odeniStatusPending;
                case 'APPROVED': return styles.odeniStatusApproved;
                case 'CANCELLED': return styles.odeniStatusCancelled;
                case 'REJECTED': return styles.odeniStatusRejected;
                default: return '';
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
                {/* Heading & Back Button */}
                <div className={styles.heading1Wrapper}>
                    <div className={styles.heading1}>
                        <div className={styles.rezervasiyaDetall}>Rezervasiya detallı</div>
                    </div>
                    <button className={styles.backBtn} onClick={() => {
                        setViewMode('list');
                        setRejectionReason('');
                        setRejectionError(false);
                    }}>
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        <span>Geri qayıt</span>
                    </button>
                </div>

                {/* Main detail card */}
                <div className={styles.detailMainCard}>
                    <div className={styles.frameContainer}>
                        <div className={styles.ayxanSalmanzadParent}>
                            <div className={styles.ayxanSalmanzad}>{detailData.userFullName}</div>
                            <div className={cn(styles.odeniStatus, getStatusBadgeClass(detailData.status))}>
                                <div className={styles.component32Child} />
                                <div className={styles.aktiv}>{getStatusBadgeText(detailData.status)}</div>
                            </div>
                        </div>
                        <div className={styles.frameDiv}>
                            <div className={styles.userIdParent}>
                                <div className={styles.mkanAxtar}>User ID:</div>
                                <b className={styles.mkanAxtar}>{String(detailData.userId).padStart(7, '0')}</b>
                            </div>
                            <div className={styles.userIdParent}>
                                <div className={styles.mkanAxtar}>Qeydiyyat tarixi:</div>
                                <b className={styles.mkanAxtar}>{detailData.regDate || '31.03.2026'}</b>
                            </div>
                            <div className={styles.userIdParent}>
                                <div className={styles.mkanAxtar}>Platforma:</div>
                                <b className={styles.mkanAxtar}>{detailData.platform === 'N/A' || !detailData.platform ? 'İOS' : detailData.platform}</b>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal & Lesson Info Card */}
                <div className={styles.superAdminUsersDetailInner}>
                    <div className={styles.frameWrapper2}>
                        <div className={styles.frameWrapper3}>
                            <div className={styles.frameWrapper4}>
                                <div className={styles.frameParent2_detail}>
                                    <div className={styles.xsiMlumatlarWrapper}>
                                        <div className={styles.mkanAxtar} style={{ fontWeight: 600 }}>Şəxsi məlumatlar</div>
                                    </div>
                                    <div className={styles.frameParent3_detail}>
                                        <div className={styles.telefonNmrsiParent}>
                                            <div className={styles.telefonNmrsi}>Telefon nömrəsi:</div>
                                            <b className={styles.fitnestMailcom}>{detailData.userPhone || '+994 00 000 00 00'}</b>
                                        </div>
                                        <div className={styles.telefonNmrsiParent}>
                                            <div className={styles.telefonNmrsi}>{`Email: `}</div>
                                            <b className={styles.fitnestMailcom}>{detailData.userEmail || 'fitnest@ mail.com'}</b>
                                        </div>
                                        <div className={styles.telefonNmrsiParent}>
                                            <div className={styles.telefonNmrsi}>Doğum tarixi:</div>
                                            <b className={styles.fitnestMailcom}>{detailData.birthDate || '12.07.2000'}</b>
                                        </div>
                                        <div className={styles.telefonNmrsiParent}>
                                            <div className={styles.telefonNmrsi}>Məşqçi</div>
                                            <b className={styles.fitnestMailcom}>{detailData.trainerName || 'Ayxan Salmanzadə'}</b>
                                        </div>
                                        <div className={styles.telefonNmrsiParent}>
                                            <div className={styles.telefonNmrsi}>Növ</div>
                                            <b className={styles.fitnestMailcom}>{detailData.lessonType || 'Yoga'}</b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rejection / Cancellation Reason */}
                {detailData.status === 'PENDING' && (
                    <>
                        <div className={styles.imtinaSbbiQeydOlunmaldrParent}>
                            <div className={styles.as_label}>Imtina səbəbi qeyd olunmalıdır</div>
                            <div className={styles.frameWrapper5}>
                                <div className={styles.imtinaSbbiWrapper}>
                                    <textarea
                                        id="rejectionReasonTextarea"
                                        className={styles.imtinaTextarea}
                                        placeholder="İmtina səbəbini bura qeyd edin..."
                                        value={rejectionReason}
                                        maxLength={100}
                                        onChange={(e) => {
                                            setRejectionReason(e.target.value)
                                            if (e.target.value.trim()) setRejectionError(false)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.wrapper_counter}>
                            <div className={styles.mkanAxtar}>{rejectionReason.length}/100</div>
                        </div>
                        {rejectionError && (
                            <div className={styles.errorText} style={{ maxWidth: '1068px', width: '100%', paddingLeft: '12px' }}>
                                Zəhmət olmasa imtina səbəbini qeyd edin
                            </div>
                        )}
                    </>
                )}

                {(detailData.status === 'REJECTED' || detailData.status === 'CANCELLED') && detailData.cancelReasonText && (
                    <div className={styles.imtinaSbbiQeydOlunmaldrParent}>
                        <div className={styles.as_label} style={{ color: '#c9373a' }}>Ləğv etmə / İmtina səbəbi</div>
                        <div className={styles.frameWrapper5} style={{ height: 'auto', minHeight: '60px', padding: '12px' }}>
                            <p className={styles.mkanAxtar} style={{ color: '#c9373a', fontWeight: 500, margin: 0 }}>
                                {detailData.cancelReasonText}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action buttons (only in PENDING state) */}
                {detailData.status === 'PENDING' && (
                    <div className={styles.buttonParent}>
                        <button className={styles.button3} onClick={handleDetailReject}>
                            <div className={styles.statusUp_btn}>
                                <div className={styles.logout_btn}>
                                    <svg className={styles.vectorIcon5} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            <span>İmtina</span>
                        </button>
                        <button className={styles.button4} onClick={handleDetailApprove}>
                            <div className={styles.statusUp_btn}>
                                <div className={styles.logout_btn}>
                                    <svg className={styles.vectorIcon6} viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 7.5L7.5 13L18 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <span>Təsdiq et</span>
                        </button>
                    </div>
                )}
            </div>
        )
    }

    // Reservation List View Mode
    return (
        <div className="flex flex-col gap-6 py-4 w-full font-sans">
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

            {/* Main Card Wrapper containing filters and table */}
            <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col p-5 gap-6 font-sans shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="text-[18px] font-bold text-black">Rezervasiyalar</div>
                    
                    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="text-[14px] font-medium text-slate-500">Status:</div>
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
                    </div>
                </div>

                <div className="w-full overflow-x-auto rounded-[12px] border border-[#cecfd2] bg-white">
                    <div className="w-full min-w-[1000px] flex flex-col bg-white">
                        {/* Header */}
                        <div className="w-full h-[48px] bg-[rgba(0,180,204,0.15)] flex items-center px-[20px] text-[14px] font-bold text-[#101828] border-b border-[#cecfd2]">
                            <div className="flex-1 min-w-[200px] opacity-80 uppercase text-[12px] tracking-wider">Ad / Soyad</div>
                            <div className="w-[140px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Tarix</div>
                            <div className="w-[140px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Saat</div>
                            <div className="w-[140px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider">Status</div>
                            <div className="flex-1 min-w-[200px] opacity-80 uppercase text-[12px] tracking-wider">Məşqçi</div>
                            <div className="w-[100px] shrink-0 opacity-80 uppercase text-[12px] tracking-wider text-center">Əməliyyatlar</div>
                        </div>

                        {/* List Items */}
                        <div className="flex flex-col bg-white divide-y divide-[#ececed]">
                            {isLoading ? (
                                <div className="w-full h-[64px] flex items-center justify-center text-[14px] text-slate-400">Yüklənir...</div>
                            ) : reservationsData?.items?.length === 0 ? (
                                <div className="w-full h-[64px] flex items-center justify-center text-[14px] text-slate-400">Rezervasiya tapılmadı</div>
                            ) : reservationsData?.items?.map((res: any) => (
                                <React.Fragment key={res.id}>
                                    <div className="w-full h-[64px] flex items-center px-[20px] text-[14px] hover:bg-slate-50 transition-colors group">
                                        <div className="flex-1 min-w-[200px] font-bold text-[#101828] group-hover:text-[#00B4CC] transition-colors truncate">
                                            {res.userFullName}
                                        </div>
                                        <div className="w-[140px] shrink-0 text-slate-600 font-medium">
                                            {res.date}
                                        </div>
                                        <div className="w-[140px] shrink-0 text-slate-600 font-medium">
                                            {formatTo24h(res.timeRange)}
                                        </div>
                                        <div className="w-[140px] shrink-0 flex items-center">
                                            <div className={cn(
                                                "h-[26px] min-w-[90px] rounded-[20px] flex items-center justify-center gap-1.5 px-3 text-[12px] font-bold text-white shadow-xs",
                                                res.status === 'PENDING' && "bg-[#ec972f]",
                                                res.status === 'APPROVED' && "bg-[#166728]",
                                                res.status === 'CANCELLED' && "bg-[#c9373a]",
                                                res.status === 'REJECTED' && "bg-[#8a38f5]"
                                            )}>
                                                <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                                                <span className="uppercase tracking-tight text-[10px]">{getStatusText(res.status)}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-[200px] text-slate-600 font-medium truncate">
                                            {res.trainerName || 'N/A'}
                                        </div>
                                        <div className="w-[100px] shrink-0 flex justify-center relative">
                                            <div className="cursor-pointer p-1.5 hover:bg-slate-100 rounded-md transition-colors" onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveActionsDropdownId(activeActionsDropdownId === res.id ? null : res.id);
                                            }}>
                                                <Image src="/more.svg" width={20} height={20} alt="More" className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            {activeActionsDropdownId === res.id && (
                                                <div ref={dropdownRef} className={styles.popoverMenu} onClick={(e) => e.stopPropagation()} style={{ right: 'auto', left: '50%', transform: 'translateX(-50%)', top: '100%' }}>
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
                                    {/* Sub row showing cancellation reason */}
                                    {(res.status === 'REJECTED' || res.status === 'CANCELLED') && res.reason && (
                                        <div className="w-full bg-[#fafafa] border-t border-[#ececed] px-[20px] py-[10px] text-[13px] text-slate-500">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-red-500">Ləğv etmə səbəbi:</span>
                                                <span>{res.reason}</span>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pagination Section */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 border-t border-border px-4 py-4 mt-8 select-none">
                        {pages.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                                    p === page ? 'bg-[#00B4CC] text-white' : 'text-[#101828] hover:bg-slate-100',
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReservationsTab
