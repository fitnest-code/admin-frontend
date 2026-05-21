'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Ban, Bell, Check, ChevronDown, Mail, MessageSquare, Upload } from 'lucide-react'
import { QUICK_REPLIES } from '@/lib/customers-data'
import { cn } from '@/lib/utils'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

type SendState = 'form' | 'confirm' | 'success' | 'error'

export function CustomerBulkActions({
  selectedCount,
  onOpenPush,
  onOpenSms,
  onOpenEmail,
}: {
  selectedCount: number
  onOpenPush: () => void
  onOpenSms: () => void
  onOpenEmail?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[13.4px] w-full transition-all duration-300 animate-in fade-in-50">
      <div className="w-[196px] flex items-center px-2">
        <span className="text-base font-medium text-foreground">{selectedCount} müştəri seçildi</span>
      </div>
      <div className="flex flex-wrap items-center gap-[13.4px]">
        <ActionBtn iconSrc="/push-notification.svg" icon={Bell} label="Push" onClick={onOpenPush} variant="cyan-outline" />
        <ActionBtn iconSrc="/sms-icon.svg" icon={MessageSquare} label="SMS" onClick={onOpenSms} variant="cyan-outline" />
        <ActionBtn iconSrc="/mail-icon.svg" icon={Mail} label="Email " onClick={() => onOpenEmail?.()} variant="cyan-outline" />
        <ActionBtn iconSrc="/export-icon.svg" icon={Upload} label="Export" onClick={() => {}} variant="cyan-outline" />
        <ActionBtn icon={Ban} label="Block" onClick={() => {}} variant="danger-outline" />
      </div>
    </div>
  )
}

function ActionBtn({
  icon: Icon,
  iconSrc,
  label,
  onClick,
  variant = 'cyan-outline',
}: {
  icon: React.ElementType
  iconSrc?: string
  label: string
  onClick: () => void
  variant?: 'push' | 'cyan-outline' | 'danger-outline'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-[48px] w-[160px] items-center justify-center gap-2 rounded-[10px] border text-base font-medium transition-all duration-200 active:scale-[0.98]',
        variant === 'danger-outline'
          ? 'border-[#ff5255] bg-white dark:bg-card text-foreground hover:bg-[#ff5255]/10'
          : 'border-[#00B4CC] bg-white dark:bg-card text-foreground hover:bg-[#00B4CC]/10',
      )}
    >
      {iconSrc ? <Image src={iconSrc} width={24} height={24} alt="" className="shrink-0" /> : <Icon size={20} />}
      <span>{label}</span>
    </button>
  )
}

function ModalBase({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans" onClick={onClose}>
      <div className="w-full max-w-[588px] rounded-[12px] bg-white border border-[#ececed] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[16px] font-medium text-black leading-[24px]">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full h-[60px] rounded-[4px] border border-[#ececed] bg-white px-4 py-3 text-[18px] text-black outline-none focus:border-[#00B4CC] transition-colors placeholder:text-muted-foreground/60"
      />
    </div>
  )
}

function QuickRepliesDropdown({
  open,
  setOpen,
  onSelect,
}: {
  open: boolean
  setOpen: (v: boolean) => void
  onSelect: (v: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [setOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-[28px] rounded-[6px] bg-[#eef8ff] border border-[#d9d9d9] flex items-center justify-center px-3 py-1 gap-1.5 text-[12px] text-[#0b86fe] font-medium hover:bg-[#e0f2ff] transition-colors"
      >
        <span>Cavab seçimləri</span>
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[280px] rounded-[12px] border border-[#d9d9d9] bg-white shadow-xl overflow-hidden p-2 flex flex-col gap-1">
          <p className="px-3 py-1.5 text-[12px] font-semibold text-muted-foreground uppercase border-b border-[#ececed]">Şablon Mesajlar</p>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply.id}
              onClick={() => {
                onSelect(reply.body)
                setOpen(false)
              }}
              className="flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-[14px] font-medium text-[#001028]">{reply.title}</span>
              <span className="text-[12px] text-[#7a7c7f] truncate max-w-full">{reply.body}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfirmDialog({
  type,
  onConfirm,
  onCancel,
}: {
  type: 'push' | 'sms'
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-7">
      <p className="text-[26px] font-medium text-[#131212] leading-[40px] text-center max-w-md">
        {type === 'push' ? 'Bildirişi göndərmək istədiyinizə əminsiniz?' : 'SMS göndərmək istədiyinizə əminsiniz?'}
      </p>
      <div className="w-full flex items-center justify-between gap-5 mt-2">
        <button onClick={onCancel} className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50">
          <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
        </button>
        <button onClick={onConfirm} className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100">
          <span className="text-[16px] font-medium text-white leading-[24px]">Göndər</span>
        </button>
      </div>
    </div>
  )
}



export function PushModal({ selectedUsers = [], onClose }: { selectedUsers?: any[]; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('form')
  const [qOpen, setQOpen] = useState(false)

  async function handleConfirm() {
    try {
      const token = localStorage.getItem('access_token') || ''
      const userIds = selectedUsers.map(u => u.id).filter(Boolean)
      
      let res
      if (userIds.length > 0) {
        res = await fetch('/api/v1/admin/notifications/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            userIds,
            title: title.trim() || 'Fitnest Bildiriş',
            body: message
          })
        })
      } else {
        res = await fetch('/api/v1/admin/notifications/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            title: title.trim() || 'Fitnest Bildiriş',
            body: message
          })
        })
      }
      
      if (res && !res.ok) {
        throw new Error(`Server xətası: ${res.status}`)
      }
      setState('success')
    } catch (err) {
      console.error('Push send error:', err)
      setState('error')
    }
  }

  return (
    <ModalBase onClose={onClose}>
      {state === 'form' && (
        <div className="flex flex-col gap-6 font-sans">
          <div className="w-full border-b border-[#ececed] pb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-black leading-[30px]">Push bildiriş göndər</h2>
          </div>
          
          <Field label="Başlıq" placeholder="Başlıq" value={title} onChange={setTitle} />
          
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <label className="text-[16px] font-medium text-black leading-[24px]">Mesaj</label>
              <QuickRepliesDropdown open={qOpen} setOpen={setQOpen} onSelect={setMessage} />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mesaj"
              rows={4}
              className="w-full min-h-[100px] resize-none rounded-[4px] border border-[#ececed] bg-white px-4 py-3 text-[18px] text-black outline-none focus:border-[#00B4CC] transition-colors placeholder:text-muted-foreground/60"
            />
          </div>
          
          <div className="w-full flex items-center justify-between gap-5 mt-2">
            <button onClick={onClose} className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50">
              <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
            </button>
            <button
              onClick={() => setState('confirm')}
              disabled={!title.trim() || !message.trim()}
              className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 text-white font-medium text-[16px] disabled:bg-[#c1c1cc] disabled:shadow-none disabled:cursor-not-allowed"
            >
              Göndər
            </button>
          </div>
          
          <p className="text-center text-[14px] font-medium text-[#717182]">
            {selectedUsers.length > 0 
              ? `Bu bildiriş yalnız seçilmiş ${selectedUsers.length} müştəriyə göndəriləcək` 
              : 'Bu bildiriş yalnız bu müştəriyə göndəriləcək'}
          </p>
        </div>
      )}
      {state === 'confirm' && <ConfirmDialog type="push" onConfirm={handleConfirm} onCancel={() => setState('form')} />}
      <SuccessAnimationModal
        isOpen={state === 'success'}
        onClose={onClose}
        type="success"
        message="Bildiriş uğurla göndərildi"
      />
      <SuccessAnimationModal
        isOpen={state === 'error'}
        onClose={() => setState('form')}
        type="error"
        message="Bildiriş göndərilmədi. Yenidən cəhd edin."
      />
    </ModalBase>
  )
}

export function SmsModal({ selectedUsers = [], onClose }: { selectedUsers?: any[]; onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('form')
  const [qOpen, setQOpen] = useState(false)

  const phoneList = selectedUsers.map(u => u.phoneNumber).filter(Boolean)

  async function handleConfirm() {
    try {
      const token = localStorage.getItem('access_token') || ''
      if (phoneList.length > 0) {
        const res = await fetch('/api/v1/admin/notifications/sms/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            phoneNumbers: phoneList,
            text: message
          })
        })
        if (!res.ok) {
          throw new Error(`Server xətası: ${res.status}`)
        }
      }
      setState('success')
    } catch (err) {
      console.error('SMS send error:', err)
      setState('error')
    }
  }

  return (
    <ModalBase onClose={onClose}>
      {state === 'form' && (
        <div className="flex flex-col gap-6 font-sans">
          <div className="w-full border-b border-[#ececed] pb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-black leading-[30px]">SMS göndər</h2>
          </div>
          
          <div className="flex flex-col gap-2 w-full max-h-24 overflow-y-auto">
            <span className="text-[16px] font-medium text-black leading-[24px]">Telefon nömrəsi</span>
            <span className="text-[18px] font-semibold text-black leading-[28px]">
              {phoneList.length > 0 ? phoneList.join(', ') : '+994 00 000 00 00'}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <label className="text-[16px] font-medium text-black leading-[24px]">Mesaj</label>
              <QuickRepliesDropdown open={qOpen} setOpen={setQOpen} onSelect={setMessage} />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mesaj"
              rows={4}
              className="w-full min-h-[100px] resize-none rounded-[4px] border border-[#ececed] bg-white px-4 py-3 text-[18px] text-black outline-none focus:border-[#00B4CC] transition-colors placeholder:text-muted-foreground/60"
            />
          </div>
          
          <div className="w-full flex items-center justify-between gap-5 mt-2">
            <button onClick={onClose} className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50">
              <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
            </button>
            <button
              onClick={() => setState('confirm')}
              disabled={!message || phoneList.length === 0}
              className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 text-white font-medium text-[16px] disabled:bg-[#c1c1cc] disabled:shadow-none disabled:cursor-not-allowed"
            >
              Göndər
            </button>
          </div>
        </div>
      )}
      {state === 'confirm' && <ConfirmDialog type="sms" onConfirm={handleConfirm} onCancel={() => setState('form')} />}
      <SuccessAnimationModal
        isOpen={state === 'success'}
        onClose={onClose}
        type="success"
        message="SMS uğurla göndərildi"
      />
      <SuccessAnimationModal
        isOpen={state === 'error'}
        onClose={() => setState('form')}
        type="error"
        message="SMS göndərilmədi. Yenidən cəhd edin."
      />
    </ModalBase>
  )
}

export function EmailModal({ selectedUsers = [], onClose }: { selectedUsers?: any[]; onClose: () => void }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<SendState>('form')
  const [qOpen, setQOpen] = useState(false)

  const emailList = selectedUsers.map(u => u.email).filter(Boolean)

  async function handleConfirm() {
    try {
      const token = localStorage.getItem('access_token') || ''
      if (emailList.length > 0) {
        const res = await fetch('/api/v1/admin/notifications/email/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            emails: emailList,
            subject: subject.trim(),
            body: message
          })
        })
        if (!res.ok) {
          throw new Error(`Server xətası: ${res.status}`)
        }
      }
      setState('success')
    } catch (err) {
      console.error('Email send error:', err)
      setState('error')
    }
  }

  return (
    <ModalBase onClose={onClose}>
      {state === 'form' && (
        <div className="flex flex-col gap-6 font-sans">
          <div className="w-full border-b border-[#ececed] pb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-black leading-[30px]">Email göndər</h2>
          </div>
          
          <div className="flex flex-col gap-2 w-full max-h-24 overflow-y-auto">
            <span className="text-[16px] font-medium text-black leading-[24px]">Alıcılar ({emailList.length})</span>
            <span className="text-[18px] font-semibold text-black leading-[28px]">
              {emailList.length > 0 ? emailList.join(', ') : 'Hədəf email seçilməyib'}
            </span>
          </div>

          <Field label="Mövzu" placeholder="Mövzu başlığı" value={subject} onChange={setSubject} />
          
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <label className="text-[16px] font-medium text-black leading-[24px]">Mesaj</label>
              <QuickRepliesDropdown open={qOpen} setOpen={setQOpen} onSelect={setMessage} />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mesaj məzmunu"
              rows={5}
              className="w-full min-h-[120px] resize-none rounded-[4px] border border-[#ececed] bg-white px-4 py-3 text-[18px] text-black outline-none focus:border-[#00B4CC] transition-colors placeholder:text-muted-foreground/60"
            />
          </div>
          
          <div className="w-full flex items-center justify-between gap-5 mt-2">
            <button onClick={onClose} className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50">
              <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
            </button>
            <button
              onClick={() => setState('confirm')}
              disabled={!subject.trim() || !message.trim() || emailList.length === 0}
              className="flex-1 h-[48px] max-w-[280px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 text-white font-medium text-[16px] disabled:bg-[#c1c1cc] disabled:shadow-none disabled:cursor-not-allowed"
            >
              Göndər
            </button>
          </div>
        </div>
      )}
      {state === 'confirm' && (
        <div className="flex flex-col items-center justify-center py-6 gap-7">
          <p className="text-[26px] font-medium text-[#131212] leading-[40px] text-center max-w-md">
            Emaili göndərmək istədiyinizə əminsiniz?
          </p>
          <div className="w-full flex items-center justify-between gap-5 mt-2">
            <button onClick={() => setState('form')} className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50">
              <span className="text-[16px] font-medium text-black leading-[24px]">Ləğv et</span>
            </button>
            <button onClick={handleConfirm} className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100">
              <span className="text-[16px] font-medium text-white leading-[24px]">Göndər</span>
            </button>
          </div>
        </div>
      )}
      <SuccessAnimationModal
        isOpen={state === 'success'}
        onClose={onClose}
        type="success"
        message="Email uğurla göndərildi"
      />
      <SuccessAnimationModal
        isOpen={state === 'error'}
        onClose={() => setState('form')}
        type="error"
        message="Email göndərilmədi. Yenidən cəhd edin."
      />
    </ModalBase>
  )
}
