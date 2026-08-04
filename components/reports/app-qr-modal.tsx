'use client'

import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import styles from './app-qr-modal.module.css'

interface AppQrModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AppQrModal({ isOpen, onClose }: AppQrModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Bağla">
        <X size={28} />
      </button>

      <div className={styles.banners} onClick={(e) => e.stopPropagation()}>
        <div className={styles.banner}>
          <Image
            src="/qr-light-background.jpg"
            alt="Light QR background"
            fill
            className={styles.bannerBg}
            sizes="(max-width: 900px) 90vw, 45vw"
            priority
          />
          <div className={styles.qrSlot}>
            <Image
              src="/app_qr_light.png"
              alt="Light Mode QR"
              width={280}
              height={280}
              className={styles.qrImage}
              priority
            />
          </div>
        </div>

        <div className={styles.banner}>
          <Image
            src="/qr-code-dark-background.jpg"
            alt="Dark QR background"
            fill
            className={styles.bannerBg}
            sizes="(max-width: 900px) 90vw, 45vw"
            priority
          />
          <div className={styles.qrSlot}>
            <Image
              src="/app_qr_dark.png"
              alt="Dark Mode QR"
              width={280}
              height={280}
              className={styles.qrImage}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
