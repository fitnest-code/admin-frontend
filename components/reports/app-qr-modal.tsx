'use client'

import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import styles from './app-qr-modal.module.css'

interface AppQrModalProps {
  isOpen: boolean
  onClose: () => void
}

async function downloadQr(src: string, filename: string) {
  try {
    const response = await fetch(src)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download QR code:', error)
  }
}

function QrBanner({
  backgroundSrc,
  backgroundAlt,
  qrSrc,
  qrDownloadSrc,
  qrAlt,
  downloadName,
  downloadIconSrc,
}: {
  backgroundSrc: string
  backgroundAlt: string
  qrSrc: string
  qrDownloadSrc: string
  qrAlt: string
  downloadName: string
  downloadIconSrc: string
}) {
  return (
    <div className={styles.banner}>
      <Image
        src={backgroundSrc}
        alt={backgroundAlt}
        fill
        className={styles.bannerBg}
        sizes="(max-width: 900px) 90vw, 45vw"
        priority
      />

      <button
        type="button"
        className={styles.downloadBtn}
        onClick={() => downloadQr(qrDownloadSrc, downloadName)}
        aria-label="QR kodu yüklə"
        title="QR kodu yüklə"
      >
        <Image
          src={downloadIconSrc}
          alt=""
          width={28}
          height={28}
          className={styles.downloadIcon}
        />
      </button>

      <div className={styles.qrSlot}>
        <Image
          src={qrSrc}
          alt={qrAlt}
          width={280}
          height={280}
          className={styles.qrImage}
          priority
        />
      </div>
    </div>
  )
}

export function AppQrModal({ isOpen, onClose }: AppQrModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Bağla">
        <X size={28} />
      </button>

      <div className={styles.banners} onClick={(e) => e.stopPropagation()}>
        <QrBanner
          backgroundSrc="/qr-light-background.png"
          backgroundAlt="Light QR background"
          qrSrc="/app_qr_light.png"
          qrDownloadSrc="/app_qr_light_download.png"
          qrAlt="Light Mode QR"
          downloadName="fitnest_app_qr_light.png"
          downloadIconSrc="/download-icon-light.png"
        />
        <QrBanner
          backgroundSrc="/qr-code-dark-background.png"
          backgroundAlt="Dark QR background"
          qrSrc="/app_qr_dark.png"
          qrDownloadSrc="/app_qr_dark_download.png"
          qrAlt="Dark Mode QR"
          downloadName="fitnest_app_qr_dark.png"
          downloadIconSrc="/download-icon-dark.png"
        />
      </div>
    </div>
  )
}
