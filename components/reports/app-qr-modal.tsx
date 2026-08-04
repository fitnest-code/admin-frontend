'use client'

import React from 'react'
import Image from 'next/image'
import { X, Download } from 'lucide-react'
import styles from './app-qr-modal.module.css'

interface AppQrModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AppQrModal({ isOpen, onClose }: AppQrModalProps) {
  if (!isOpen) return null

  const handleDownload = async (mode: 'light' | 'dark') => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const imageUrl = `${backendUrl}/api/v1/public/app-qr/image/${mode}`
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `fitnest_app_qr_${mode}_mode.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error(`Failed to export ${mode} QR code:`, error)
    }
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const lightQrUrl = `${backendUrl}/api/v1/public/app-qr/image/light`
  const darkQrUrl = `${backendUrl}/api/v1/public/app-qr/image/dark`

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Tətbiq QR Kodları (App Store / Play Store)</div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body containing 2 QR codes side by side */}
        <div className={styles.modalBody}>
          
          {/* Light Mode QR Card */}
          <div className={styles.qrCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Light Mode</span>
              <span className={`${styles.badge} ${styles.badgeLight}`}>Açıq Rejim</span>
            </div>

            {/* Design Banner Container */}
            <div className={styles.bannerPreviewLight}>
              <b className={styles.bannerTitle}>QR KOD</b>
              <div className={styles.qrImageContainer}>
                <Image
                  src={lightQrUrl}
                  width={150}
                  height={150}
                  alt="Light Mode QR Code"
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>
              <div className={styles.backgroundChild} />
              <div className={styles.backgroundItem} />
            </div>

            <button
              type="button"
              className={styles.downloadButton}
              onClick={() => handleDownload('light')}
            >
              <Download size={18} />
              <span>Export QR (Light)</span>
            </button>
          </div>

          {/* Dark Mode QR Card */}
          <div className={styles.qrCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Dark Mode</span>
              <span className={`${styles.badge} ${styles.badgeDark}`}>Tünd Rejim</span>
            </div>

            {/* Design Banner Container */}
            <div className={styles.bannerPreviewDark}>
              <b className={styles.bannerTitle}>QR KOD</b>
              <div className={styles.qrImageContainer}>
                <Image
                  src={darkQrUrl}
                  width={150}
                  height={150}
                  alt="Dark Mode QR Code"
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>
              <div className={styles.mainFrameChild} />
              <div className={styles.mainFrameItem} />
            </div>

            <button
              type="button"
              className={styles.downloadButton}
              onClick={() => handleDownload('dark')}
            >
              <Download size={18} />
              <span>Export QR (Dark)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
