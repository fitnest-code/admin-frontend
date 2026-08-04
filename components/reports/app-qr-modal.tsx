'use client'

import React from 'react'
import Image from 'next/image'
import { X, Download } from 'lucide-react'
import styles from './app-qr-modal.module.css'

interface AppQrModalProps {
  isOpen: boolean
  onClose: () => void
}

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host.includes('dev') || host.includes('localhost') || host === '127.0.0.1') {
      return 'https://api-dev.fitnest.az'
    }
    if (host.includes('fitnest.az')) {
      return 'https://api.fitnest.az'
    }
  }
  return 'https://api-dev.fitnest.az'
}

export function AppQrModal({ isOpen, onClose }: AppQrModalProps) {
  if (!isOpen) return null

  const baseUrl = getApiBaseUrl()
  const lightQrUrl = `${baseUrl}/api/v1/public/app-qr/image/light`
  const darkQrUrl = `${baseUrl}/api/v1/public/app-qr/image/dark`

  const handleDownload = async (mode: 'light' | 'dark') => {
    try {
      const imageUrl = `${baseUrl}/api/v1/public/app-qr/image/${mode}`
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch QR image: ${response.status}`)
      }
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

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Tətbiq QR Kodları (App Store / Play Store)</div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Modal Body containing 2 QR banners side by side */}
        <div className={styles.modalBody}>
          
          {/* Light Mode Banner Card (Background Component Design) */}
          <div className={styles.qrCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Light Mode Design</span>
              <span className={`${styles.badge} ${styles.badgeLight}`}>Açıq Rejim</span>
            </div>

            {/* Canvas Container matching Figma Background component layout */}
            <div className={styles.bannerCanvasLight}>
              <div className={styles.frame}>
                <b className={styles.title}>QR KOD</b>
              </div>
              <div className={styles.qrCodeContainer}>
                <Image
                  src={lightQrUrl}
                  width={220}
                  height={220}
                  alt="Light Mode QR Code"
                  className={styles.qrCodeImage}
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
              <span>Export QR (Light Mode)</span>
            </button>
          </div>

          {/* Dark Mode Banner Card (MainFrame Component Design) */}
          <div className={styles.qrCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Dark Mode Design</span>
              <span className={`${styles.badge} ${styles.badgeDark}`}>Tünd Rejim</span>
            </div>

            {/* Canvas Container matching Figma MainFrame component layout */}
            <div className={styles.bannerCanvasDark}>
              <div className={styles.frame}>
                <b className={styles.title}>QR KOD</b>
              </div>
              <div className={styles.qrCodeContainer}>
                <Image
                  src={darkQrUrl}
                  width={220}
                  height={220}
                  alt="Dark Mode QR Code"
                  className={styles.qrCodeImage}
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
              <span>Export QR (Dark Mode)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
