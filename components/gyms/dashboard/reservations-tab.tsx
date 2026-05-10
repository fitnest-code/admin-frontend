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
            case 'PENDING': return styles.statusPending
            case 'APPROVED': return styles.statusConfirmed
            case 'CANCELLED': return styles.statusCancelled
            case 'REJECTED': return styles.statusRejected
            default: return ''
        }
    }

    return (
        <div className={styles.container}>
            {/* Header / Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Ümumi Rezervasiyalar</div>
                    <div className={styles.statValue}>{stats?.total || 0}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Gözləyənlər</div>
                    <div className={`${styles.statValue} ${styles.colorOrange}`}>{stats?.pending || 0}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Təsdiqlənənlər</div>
                    <div className={`${styles.statValue} ${styles.colorGreen}`}>{stats?.confirmed || 0}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statTitle}>Ləğv Edilənlər</div>
                    <div className={`${styles.statValue} ${styles.colorRed}`}>{stats?.cancelled || 0}</div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filtersRow}>
                <div className={styles.searchBox}>
                    <Image src="/search-normal.svg" width={20} height={20} alt="Search" />
                    <input type="text" placeholder="Ad, Soyad və ya ID ilə axtar" className={styles.searchInput} />
                </div>
                <div className={styles.dropdowns}>
                    <div className={styles.dropdownWrapper}>
                        <button 
                            className={styles.filterButton}
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        >
                            <span>Status: {statusFilter ? getStatusText(statusFilter) : 'Hamısı'}</span>
                            <Image src="/arrow-down.svg" width={16} height={16} alt="Arrow" />
                        </button>
                        {isStatusDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownItem} onClick={() => handleStatusFilter(undefined)}>Hamısı</div>
                                <div className={styles.dropdownItem} onClick={() => handleStatusFilter('PENDING')}>Gözləmədə</div>
                                <div className={styles.dropdownItem} onClick={() => handleStatusFilter('APPROVED')}>Təsdiqlənib</div>
                                <div className={styles.dropdownItem} onClick={() => handleStatusFilter('CANCELLED')}>Ləğv edilib</div>
                                <div className={styles.dropdownItem} onClick={() => handleStatusFilter('REJECTED')}>İmtina edilib</div>
                            </div>
                        )}
                    </div>

                    <div className={styles.dropdownWrapper}>
                        <button 
                            className={styles.filterButton}
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        >
                            <span>Sırala</span>
                            <Image src="/arrow-down.svg" width={16} height={16} alt="Arrow" />
                        </button>
                        {isSortDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownItem}>Tarix (Yeni → Köhnə)</div>
                                <div className={styles.dropdownItem}>Tarix (Köhnə → Yeni)</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ad / Soyad</th>
                            <th>Tarix</th>
                            <th>Saat</th>
                            <th>Status</th>
                            <th>Məşqçi</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Yüklənir...</td></tr>
                        ) : reservationsData?.items.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Rezervasiya tapılmadı</td></tr>
                        ) : reservationsData?.items.map((res: any) => (
                            <tr key={res.id}>
                                <td>{res.userFullName}</td>
                                <td>{res.date}</td>
                                <td>{res.timeRange}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusClass(res.status)}`}>
                                        {getStatusText(res.status)}
                                    </span>
                                </td>
                                <td>{res.trainerName}</td>
                                <td className={styles.actionsCell}>
                                    <button className={styles.detailBtn} onClick={() => handleOpenDetail(res.id)}>
                                        Detallı
                                    </button>
                                    <div className={styles.moreActions}>
                                        <Image src="/more.svg" width={24} height={24} alt="More" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <button 
                    className={styles.pageBtn} 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    <Image src="/arrow-left.svg" width={16} height={16} alt="Prev" />
                </button>
                <span className={styles.pageInfo}>Səhifə {page} / {Math.ceil((reservationsData?.total || 0) / 10) || 1}</span>
                <button 
                    className={styles.pageBtn}
                    disabled={page >= Math.ceil((reservationsData?.total || 0) / 10)}
                    onClick={() => setPage(page + 1)}
                >
                    <Image src="/arrow-right.svg" width={16} height={16} alt="Next" />
                </button>
            </div>

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
