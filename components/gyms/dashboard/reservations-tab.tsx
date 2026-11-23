'use client'

import React, { useState, useMemo } from 'react'
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
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AdminDataTable, type AdminDataTableColumn } from '@/components/ui/admin-data-table'

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
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
        isOpen: false,
        message: "",
        type: "success"
    })

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

    const handleApprove = (id: number) => {
        updateStatusMutation.mutate({
            reservationId: id,
            status: 'APPROVED'
        }, {
            onSuccess: () => {
                setModalConfig({
                    isOpen: true,
                    message: "Rezervasiya uğurla təsdiq edildi",
                    type: "success"
                })
            },
            onError: (err: any) => {
                setModalConfig({
                    isOpen: true,
                    message: err?.message || "Rezervasiyanın təsdiqi zamanı xəta baş verdi",
                    type: "error"
                })
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

    const totalPages = Math.ceil((reservationsData?.total || 0) / 10) || 1;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    const reservationRows = reservationsData?.items ?? []

    const columns: AdminDataTableColumn<any>[] = useMemo(
        () => [
            {
                id: 'name',
                label: 'Ad / Soyad',
                defaultWidth: 200,
                minWidth: 120,
                maxWidth: 320,
                flex: true,
                render: (res) => <span className="block truncate font-bold text-[#101828]">{res.userFullName}</span>,
            },
            {
                id: 'date',
                label: 'Tarix',
                defaultWidth: 120,
                minWidth: 90,
                maxWidth: 160,
                render: (res) => <span className="block truncate">{res.date}</span>,
            },
            {
                id: 'time',
                label: 'Saat',
                defaultWidth: 120,
                minWidth: 90,
                maxWidth: 160,
                render: (res) => <span className="block truncate">{formatTo24h(res.timeRange)}</span>,
            },
            {
                id: 'status',
                label: 'Status',
                defaultWidth: 200,
                minWidth: 120,
                maxWidth: 280,
                render: (res) => (
                    <div className="flex min-w-0 flex-col gap-1">
                        <div
                            className={cn(
                                'flex h-[26px] w-fit min-w-[90px] items-center justify-center gap-1.5 rounded-[20px] px-3 text-[10px] font-bold uppercase tracking-tight text-white shadow-xs',
                                res.status === 'PENDING' && 'bg-[#ec972f]',
                                res.status === 'APPROVED' && 'bg-[#166728]',
                                res.status === 'CANCELLED' && 'bg-[#c9373a]',
                                res.status === 'REJECTED' && 'bg-[#8a38f5]',
                            )}
                        >
                            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                            <span>{getStatusText(res.status)}</span>
                        </div>
                        {(res.status === 'REJECTED' || res.status === 'CANCELLED') && res.reason ? (
                            <span className="truncate text-xs text-slate-500" title={res.reason}>
                                {res.reason}
                            </span>
                        ) : null}
                    </div>
                ),
            },
            {
                id: 'trainer',
                label: 'Məşqçi',
                defaultWidth: 180,
                minWidth: 120,
                maxWidth: 280,
                render: (res) => <span className="block truncate">{res.trainerName || 'N/A'}</span>,
            },
            {
                id: 'actions',
                label: 'Əməliyyatlar',
                defaultWidth: 90,
                minWidth: 80,
                maxWidth: 120,
                reorderable: false,
                hideable: false,
                render: (res) => (
                    <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-slate-100"
                                >
                                    <Image src="/more.svg" width={20} height={20} alt="More" className="opacity-70" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedReservationId(res.id)
                                        setViewMode('detail')
                                    }}
                                >
                                    Bax
                                </DropdownMenuItem>
                                {res.status === 'PENDING' && (
                                    <>
                                        <DropdownMenuItem onClick={() => handleApprove(res.id)}>Təsdiq et</DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedReservationId(res.id)
                                                setViewMode('detail')
                                                setTimeout(() => {
                                                    const textarea = document.getElementById('rejectionReasonTextarea')
                                                    if (textarea) textarea.focus()
                                                }, 150)
                                            }}
                                        >
                                            İmtina et
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [],
    )

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
                    setModalConfig({
                        isOpen: true,
                        message: "Rezervasiya uğurla təsdiq edildi",
                        type: "success"
                    })
                },
                onError: (err: any) => {
                    setModalConfig({
                        isOpen: true,
                        message: err?.message || "Rezervasiyanın təsdiqi zamanı xəta baş verdi",
                        type: "error"
                    })
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
                    setModalConfig({
                        isOpen: true,
                        message: "Rezervasiya uğurla ləğv edildi",
                        type: "success"
                    })
                },
                onError: (err: any) => {
                    setModalConfig({
                        isOpen: true,
                        message: err?.message || "Rezervasiyanın ləğvi zamanı xəta baş verdi",
                        type: "error"
                    })
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
                            <div className={styles.as_label}>Ləğv etmə səbəbi qeyd olunmalıdır</div>
                            <div className={styles.frameWrapper5}>
                                <div className={styles.imtinaSbbiWrapper}>
                                    <textarea
                                        id="rejectionReasonTextarea"
                                        className={styles.imtinaTextarea}
                                        placeholder="Ləğv etmə səbəbini bura qeyd edin..."
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
                                Zəhmət olmasa ləğv etmə səbəbini qeyd edin
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
                        <button className={styles.button4} onClick={handleDetailReject} style={{ backgroundColor: '#c9373a' }}>
                            <div className={styles.statusUp_btn}>
                                <div className={styles.logout_btn}>
                                    <svg className={styles.vectorIcon5} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            <span>Ləğv et</span>
                        </button>
                    </div>
                )}
                
                <SuccessAnimationModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                    message={modalConfig.message}
                    type={modalConfig.type}
                />
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

                <AdminDataTable
                    storageKey="gym-reservations"
                    columns={columns}
                    rows={reservationRows}
                    getRowId={(res) => res.id}
                    isLoading={isLoading}
                    emptyTitle="Rezervasiya tapılmadı"
                    onRowClick={(res) => {
                        setSelectedReservationId(res.id)
                        setViewMode('detail')
                    }}
                />

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
            
            <SuccessAnimationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                message={modalConfig.message}
                type={modalConfig.type}
            />
        </div>
    )
}

export default ReservationsTab
