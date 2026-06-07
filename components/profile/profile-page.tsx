'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Camera, Loader2, X, RefreshCw, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGet, apiPut, apiPost, apiDelete } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { SuccessAnimationModal } from '../ui/success-animation-modal'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n'

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return ""
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("/")) return urlOrFsId
  return `/api/v1/media/stream/${urlOrFsId}`
}

export function ProfilePage() {
  const t = useT()
  const authUser = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)

  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Name form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  // Email form state
  const [newEmail, setNewEmail] = useState('')
  const [isRequestingEmail, setIsRequestingEmail] = useState(false)

  // OTP Modal state
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpSessionId, setOtpSessionId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)

  // Password form state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Avatar state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // General success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchProfile = async () => {
    try {
      const data = await apiGet<any>('/me')
      const p = data?.data || data
      setProfile(p)
      setFirstName(p?.first_name || p?.firstName || '')
      setLastName(p?.last_name || p?.lastName || '')
    } catch (err) {
      console.error(err)
      toast.error('Profil məlumatlarını yükləmək mümkün olmadı')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Cooldown timer effect for OTP resend
  useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = setInterval(() => {
      setOtpCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [otpCooldown])

  // Save Name & Surname
  const handleSaveName = async () => {
    const fName = firstName.trim()
    const lName = lastName.trim()

    if (!fName || !lName) {
      toast.error(t.validation.fillRequired || 'Zəhmət olmasa bütün sahələri doldurun')
      return
    }

    try {
      setIsSavingName(true)
      const data = await apiPut<any>('/me', {
        first_name: fName,
        last_name: lName
      })
      const updatedProfile = data?.data || data
      setProfile(updatedProfile)

      // Sync with authStore
      if (authUser) {
        setSession({
          user: {
            ...authUser,
            name: `${fName} ${lName}`
          }
        })
      }

      setSuccessMessage('Ad və soyad uğurla yeniləndi!')
      setShowSuccessModal(true)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Ad və soyad yenilənərkən xəta baş verdi')
    } finally {
      setIsSavingName(false)
    }
  }

  // Request Email Change
  const handleRequestEmailChange = async () => {
    const emailToChange = newEmail.trim()
    if (!emailToChange) {
      toast.error('Zəhmət olmasa yeni e-poçt ünvanını daxil edin')
      return
    }

    // validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailToChange)) {
      toast.error(t.validation.emailInvalid || 'Düzgün e-poçt daxil edin')
      return
    }

    try {
      setIsRequestingEmail(true)
      const data = await apiPost<any>('/me/change-email/request', {
        newEmail: emailToChange
      })
      const response = data?.data || data
      
      const sessionId = response?.otp_session_id || response?.otpSessionId
      if (sessionId) {
        setOtpSessionId(sessionId)
        setOtpCode('')
        setOtpCooldown(60)
        setShowOtpModal(true)
      } else {
        toast.error('OTP Sessiya ID tapılmadı')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'E-poçt dəyişmə sorğusu uğursuz oldu')
    } finally {
      setIsRequestingEmail(false)
    }
  }

  // Resend Email Change OTP
  const handleResendOtp = async () => {
    if (otpCooldown > 0) return

    try {
      setIsResendingOtp(true)
      await apiPost<any>(`/me/change-email/resend`, null, {
        params: { otpSessionId }
      })
      setOtpCooldown(60)
      setOtpCode('')
      toast.success('Təsdiq kodu yenidən göndərildi!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Kodu yenidən göndərmək mümkün olmadı')
    } finally {
      setIsResendingOtp(false)
    }
  }

  // Confirm Email Change
  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 4) {
      toast.error('Zəhmət olmasa 4 rəqəmli təsdiq kodunu daxil edin')
      return
    }

    try {
      setIsVerifyingOtp(true)
      const data = await apiPost<any>('/me/change-email/confirm', {
        otp_session_id: otpSessionId,
        otp_code: otpCode
      })
      
      // Update local profile state
      const updatedUser = data?.data || data
      if (profile) {
        setProfile({ ...profile, email: newEmail.trim() })
      }
      setNewEmail('')
      setShowOtpModal(false)

      // Sync with authStore
      if (authUser) {
        setSession({
          user: {
            ...authUser,
            email: updatedUser?.email || newEmail.trim()
          }
        })
      }

      setSuccessMessage('E-poçt ünvanınız uğurla dəyişdirildi!')
      setShowSuccessModal(true)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Təsdiq kodu yanlışdır və ya vaxtı bitib')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Change Password
  const handleChangePassword = async () => {
    const oldPass = oldPassword
    const newPass = newPassword.trim()
    const confPass = confirmNewPassword.trim()

    if (!oldPass || !newPass || !confPass) {
      toast.error(t.validation.fillRequired || 'Zəhmət olmasa bütün sahələri doldurun')
      return
    }

    if (newPass.length < 8) {
      toast.error(t.validation.passwordMinLength || 'Şifrə ən azı 8 simvol olmalıdır')
      return
    }

    if (newPass !== confPass) {
      toast.error('Yeni şifrələr uyğun gəlmir!')
      return
    }

    try {
      setIsSavingPassword(true)
      await apiPost<any>('/me/change-password', {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmNewPassword: confPass
      })

      // Clear fields
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')

      setSuccessMessage('Şifrəniz uğurla dəyişdirildi!')
      setShowSuccessModal(true)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Şifrə dəyişdirilərkən xəta baş verdi')
    } finally {
      setIsSavingPassword(false)
    }
  }

  // Upload Avatar Image
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Şəkil ölçüsü 5MB-dan böyük ola bilməz')
      return
    }

    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsUploadingAvatar(true)
      await apiPut<any>('/me/profile-image', formData)
      
      // Re-fetch profile to load the new image url
      await fetchProfile()
      toast.success('Profil şəkli uğurla yükləndi!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Profil şəkli yüklənərkən xəta baş verdi')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  // Delete Avatar Image
  const handleAvatarDelete = async () => {
    try {
      setIsDeletingAvatar(true)
      await apiDelete<any>('/me/profile-image')
      
      // Re-fetch profile
      await fetchProfile()
      toast.success('Profil şəkli silindi!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Profil şəklini silmək mümkün olmadı')
    } finally {
      setIsDeletingAvatar(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 w-full h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#00B4CC]" size={36} />
        <span className="text-sm font-semibold text-slate-500 animate-pulse">Yüklənir...</span>
      </div>
    )
  }

  const avatarUrl = profile?.profile_image_url || profile?.profileImageUrl
  const userInitials = (firstName?.[0] || '') + (lastName?.[0] || '')

  return (
    <div className="flex flex-col gap-6 pb-10 font-sans w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">Profil tənzimləmələri</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Avatar & Summary Card */}
        <div className="lg:col-span-1 bg-white border border-[#ececed] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
          <div className="relative group mb-4">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#00B4CC]/10 bg-slate-50 flex items-center justify-center relative shadow-sm">
              {avatarUrl ? (
                <img src={getImageUrl(avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#00B4CC] uppercase">{userInitials || 'AS'}</span>
              )}
              
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>

            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar || isDeletingAvatar}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#00B4CC] text-white hover:bg-[#009DB3] transition-all shadow-md select-none border border-white"
              title="Profil şəkli yüklə"
            >
              <Camera size={14} />
            </button>
            <input 
              ref={avatarInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleAvatarUpload} 
            />
          </div>

          <h2 className="text-lg font-bold text-[#101828] leading-tight">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 justify-center">
            <Mail size={14} className="text-slate-400" />
            {profile?.email}
          </p>
          {profile?.mobile && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 justify-center">
              <Phone size={14} className="text-slate-400" />
              {profile.mobile}
            </p>
          )}

          {avatarUrl && (
            <button
              onClick={handleAvatarDelete}
              disabled={isUploadingAvatar || isDeletingAvatar}
              className="mt-5 text-xs text-red-500 hover:text-red-650 transition-colors font-semibold flex items-center gap-1 cursor-pointer select-none"
            >
              {isDeletingAvatar ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <>
                  <Trash2 size={12} />
                  Şəkli sil
                </>
              )}
            </button>
          )}
        </div>

        {/* Right Side: Inputs & Configurations */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Section 1: Personal Details */}
          <div className="bg-white border border-[#ececed] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm text-left">
            <div className="border-b border-[#ececed] pb-3 flex items-center gap-2">
              <User size={18} className="text-[#00B4CC]" />
              <h3 className="text-sm font-semibold text-black">Şəxsi məlumatlar</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Ad</label>
                <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all">
                  <input
                    type="text"
                    placeholder="Adınız"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-transparent font-medium text-black outline-none w-full h-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Soyad</label>
                <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all">
                  <input
                    type="text"
                    placeholder="Soyadınız"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-transparent font-medium text-black outline-none w-full h-full placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#ececed] pt-4 mt-2">
              <button
                onClick={handleSaveName}
                disabled={isSavingName}
                className="h-[42px] w-full sm:w-[150px] rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-sm font-semibold text-white shadow-sm flex items-center justify-center transition-all disabled:opacity-75 disabled:pointer-events-none active:scale-[0.98] select-none"
              >
                {isSavingName ? <Loader2 size={18} className="animate-spin" /> : 'Yadda saxla'}
              </button>
            </div>
          </div>

          {/* Section 2: Email Change */}
          <div className="bg-white border border-[#ececed] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm text-left">
            <div className="border-b border-[#ececed] pb-3 flex items-center gap-2">
              <Mail size={18} className="text-[#00B4CC]" />
              <h3 className="text-sm font-semibold text-black">E-poçt ünvanını dəyiş</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Yeni E-poçt</label>
              <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all">
                <input
                  type="email"
                  placeholder="yeni.email@fitnest.az"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-transparent font-medium text-black outline-none w-full h-full placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#ececed] pt-4 mt-2">
              <button
                onClick={handleRequestEmailChange}
                disabled={isRequestingEmail}
                className="h-[42px] w-full sm:w-[150px] rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-sm font-semibold text-white shadow-sm flex items-center justify-center transition-all disabled:opacity-75 disabled:pointer-events-none active:scale-[0.98] select-none"
              >
                {isRequestingEmail ? <Loader2 size={18} className="animate-spin" /> : 'Email dəyiş'}
              </button>
            </div>
          </div>

          {/* Section 3: Password Change */}
          <div className="bg-white border border-[#ececed] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-sm text-left">
            <div className="border-b border-[#ececed] pb-3 flex items-center gap-2">
              <Lock size={18} className="text-[#00B4CC]" />
              <h3 className="text-sm font-semibold text-black">Şifrəni dəyiş</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Köhnə şifrə</label>
                <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-transparent font-medium text-black outline-none w-full h-full pr-10 placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <button
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-4 text-slate-400 hover:text-slate-650 transition-colors"
                  >
                    {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Yeni şifrə</label>
                  <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent font-medium text-black outline-none w-full h-full pr-10 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <button
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 text-slate-400 hover:text-slate-650 transition-colors"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Təkrar şifrə</label>
                  <div className="h-[46px] rounded-xl border border-[#ececed] bg-[#fafafa] flex items-center px-4 text-sm focus-within:border-[#00B4CC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00B4CC15] transition-all relative">
                    <input
                      type={showConfPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="bg-transparent font-medium text-black outline-none w-full h-full pr-10 placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <button
                      onClick={() => setShowConfPass(!showConfPass)}
                      className="absolute right-4 text-slate-400 hover:text-slate-650 transition-colors"
                    >
                      {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#ececed] pt-4 mt-2">
              <button
                onClick={handleChangePassword}
                disabled={isSavingPassword}
                className="h-[42px] w-full sm:w-[150px] rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-sm font-semibold text-white shadow-sm flex items-center justify-center transition-all disabled:opacity-75 disabled:pointer-events-none active:scale-[0.98] select-none"
              >
                {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Şifrəni yenilə'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={() => setShowOtpModal(false)} />
          <form
            onSubmit={handleConfirmEmailChange}
            className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white border border-[#ececed] p-6 flex flex-col gap-5 shadow-2xl animate-in zoom-in-95 duration-200 text-left font-sans"
          >
            <div className="flex items-center justify-between border-b border-[#ececed] pb-3 text-[#101828]">
              <h3 className="text-base font-semibold leading-tight">E-poçt təsdiqlənməsi</h3>
              <button type="button" onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Yeni e-poçt ünvanınıza (<span className="font-semibold text-black">{newEmail}</span>) göndərilən 4 rəqəmli təsdiq kodunu daxil edin.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Təsdiq kodu (OTP)</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="rounded-xl border border-[#ececed] bg-[#fafafa] px-4 py-3 text-center text-lg font-bold tracking-[0.75em] outline-none focus:border-[#00B4CC] focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mt-1">
                {otpCooldown > 0 ? (
                  <span>Kodu yenidən göndər ({otpCooldown}s)</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendingOtp}
                    className="text-[#00B4CC] hover:text-[#009DB3] font-semibold flex items-center gap-1 cursor-pointer select-none"
                  >
                    {isResendingOtp ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Kodu yenidən göndər
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#ececed] pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="h-[38px] rounded-lg border border-[#ececed] px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 4}
                className="h-[38px] rounded-lg bg-[#00B4CC] px-6 text-sm font-semibold text-white hover:bg-[#009DB3] disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? <Loader2 size={16} className="animate-spin" /> : 'Təsdiqlə'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Lottie Animation Modal */}
      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  )
}
