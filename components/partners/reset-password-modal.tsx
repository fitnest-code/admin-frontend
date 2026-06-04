'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import styles from './reset-password-modal.module.css'
import { resetUserPassword } from '@/modules/customers/api/customers.service'

interface ResetPasswordModalProps {
  userId: number
  onClose: () => void
}

export function ResetPasswordModal({ userId, onClose }: ResetPasswordModalProps) {
  const [mounted, setMounted] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    // Prevent background scrolling while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!newPassword.trim()) {
      setErrorMsg('Yeni şifrə boş ola bilməz.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Şifrələr eyni deyil.')
      return
    }

    if (newPassword.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.')
      return
    }

    setLoading(true)
    try {
      await resetUserPassword(userId, newPassword.trim())
      setSuccessMsg('Şifrə uğurla yeniləndi.')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Şifrə yenilənərkən xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.frameParent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.frameWrapper}>
          <form className={styles.frameContainer} onSubmit={handleSave}>
            <div className={styles.frameGroup}>
              <div className={styles.ifrYenilmWrapper}>
                <div className={styles.ifrYenilm}>Şifrə yeniləmə</div>
              </div>
              
              <div className={styles.frameDiv}>
                <div className={styles.yeniIfrWrapper}>
                  <div className={styles.yeniIfr}>Yeni şifrə</div>
                </div>
                <div className={styles.input}>
                  <div className={styles.frameParent2}>
                    <div className={styles.frameWrapper2}>
                      <div className={styles.yeniIfrContainer}>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Yeni şifrə"
                          className={styles.inputField}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.eyeWrapper}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                    >
                      <div className={styles.eye}>
                        <Image
                          src="/Eye.png"
                          className={styles.icon}
                          width={19.7}
                          height={18}
                          alt="Toggle password visibility"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.frameDiv}>
                <div className={styles.yeniIfrWrapper}>
                  <div className={styles.yeniIfr}>Şifrə təkrarı</div>
                </div>
                <div className={styles.input}>
                  <div className={styles.frameParent2}>
                    <div className={styles.frameWrapper2}>
                      <div className={styles.yeniIfrContainer}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Şifrənin təkrarı"
                          className={styles.inputField}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.eyeWrapper}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      <div className={styles.eye}>
                        <Image
                          src="/Eye.png"
                          className={styles.icon}
                          width={19.7}
                          height={18}
                          alt="Toggle password visibility"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}
              {successMsg && <div className={styles.successText}>{successMsg}</div>}

              <div className={styles.buttonParent}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={onClose}
                  disabled={loading}
                >
                  <div className={styles.yeniIfr}>Ləğv et</div>
                </button>
                <button
                  type="submit"
                  className={styles.button2}
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  <div className={styles.yeniIfr}>
                    {loading ? 'Yüklənir...' : 'Yadda saxla'}
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
