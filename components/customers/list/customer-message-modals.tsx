'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Ban, Bell, Check, ChevronDown, Mail, MessageSquare, Upload } from 'lucide-react'
import { QUICK_REPLIES } from '@/lib/customers-data'
import { cn } from '@/lib/utils'

type SendState = 'form' | 'confirm' | 'success' | 'error'

export function CustomerBulkActions({
  selectedCount,
  onOpenPush,
  onOpenSms,
}: {
  selectedCount: number
  onOpenPush: () => void
  onOpenSms: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[13.4px] w-full transition-all duration-300 animate-in fade-in-50">
      <div className="w-[196px] flex items-center px-2">
        <span className="text-base font-medium text-foreground">{selectedCount} müştəri seçildi</span>
      </div>
      <div className="flex flex-wrap items-center gap-[13.4px]">
        <ActionBtn iconSrc="/push-notification.svg" icon={Bell} label="Push" onClick={onOpenPush} variant="cyan-outline" />
        <ActionBtn iconSrc="/sms-icon.svg" icon={MessageSquare} label="SMS" onClick={onOpenSms} variant="cyan-outline" />
        <ActionBtn iconSrc="/mail-icon.svg" icon={Mail} label="Email " onClick={() => {}} variant="cyan-outline" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
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
        className="flex items-center gap-1 text-xs font-medium text-[#00B4CC] hover:underline transition-colors"
      >
        Cavab seçimləri <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">Quick Replies</p>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply.id}
              onClick={() => {
                onSelect(reply.body)
                setOpen(false)
              }}
              className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{reply.title}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{reply.body}</span>
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
    <div className="flex flex-col gap-5">
      <p className="text-center text-sm font-medium text-foreground">
        {type === 'push' ? 'Bildirişi göndərmək istədiyinizə əminsiniz?' : 'SMS göndərmək istədiyinizə əminsiniz?'}
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button onClick={onConfirm} className="flex-1 rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Göndər
        </button>
      </div>
    </div>
  )
}

function ResultDialog({ label, success, onClose }: { label: string; success?: boolean; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className={cn('flex items-center gap-2 text-sm font-medium', success ? 'text-[#00B4CC]' : 'text-red-500')}>
        {success ? <Check size={18} className="text-[#00B4CC]" /> : <Ban size={18} className="text-red-500" />}
        {label}
      </div>
      <button onClick={onClose} className="rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-secondary transition-colors">
        Bağla
      </button>
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
      
      if (userIds.length > 0) {
        await fetch('/api/v1/admin/notifications/bulk', {
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
        // Fallback to absolute system wide broadcast if zero targeted checkboxes explicitly flagged
        await fetch('/api/v1/admin/notifications/broadcast', {
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
      setState('success')
    } catch (err) {
      console.error('Push send error:', err)
      setState('error')
    }
  }

  return (
    <ModalBase onClose={onClose}>
      {state === 'form' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-foreground">Push bildiriş göndər</h2>
          <Field label="Başlıq" placeholder="Başlıq ( istəyə bağlı )" value={title} onChange={setTitle} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Mesaj</label>
              <QuickRepliesDropdown open={qOpen} setOpen={setQOpen} onSelect={setMessage} />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mesaj"
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
              Ləğv et
            </button>
            <button
              onClick={() => setState('confirm')}
              disabled={!message}
              className="flex-1 rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-40 transition-colors"
            >
              Göndər
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {selectedUsers.length > 0 
              ? `Bu bildiriş seçilmiş ${selectedUsers.length} müştəriyə göndəriləcək` 
              : 'Bu bildiriş bütün müştərilərə göndəriləcək'}
          </p>
        </div>
      )}
      {state === 'confirm' && <ConfirmDialog type="push" onConfirm={handleConfirm} onCancel={() => setState('form')} />}
      {state === 'success' && <ResultDialog success label="Bildiriş uğurla göndərildi" onClose={onClose} />}
      {state === 'error' && <ResultDialog label="Bildiriş göndərilmədi. Yenidən cəhd edin." onClose={() => setState('form')} />}
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
        await fetch('/api/v1/sms/bulk', {
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
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-foreground">SMS göndər</h2>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            <span className="text-xs text-muted-foreground">Telefon nömrələri ({phoneList.length})</span>
            <span className="text-sm font-medium text-foreground">
              {phoneList.length > 0 ? phoneList.join(', ') : 'Hədəf nömrə seçilməyib'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Mesaj</label>
              <QuickRepliesDropdown open={qOpen} setOpen={setQOpen} onSelect={setMessage} />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mesaj"
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
              Ləğv et
            </button>
            <button
              onClick={() => setState('confirm')}
              disabled={!message || phoneList.length === 0}
              className="flex-1 rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-40 transition-colors"
            >
              Göndər
            </button>
          </div>
        </div>
      )}
      {state === 'confirm' && <ConfirmDialog type="sms" onConfirm={handleConfirm} onCancel={() => setState('form')} />}
      {state === 'success' && <ResultDialog success label="SMS uğurla göndərildi" onClose={onClose} />}
      {state === 'error' && <ResultDialog label="SMS göndərilmədi. Yenidən cəhd edin." onClose={() => setState('form')} />}
    </ModalBase>
  )
}
