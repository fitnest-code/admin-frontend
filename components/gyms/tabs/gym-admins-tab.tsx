'use client'

import { useState } from 'react'
import { Trash2, X, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GymAdmin } from '@/lib/gyms-data'

const ROLE_STYLES: Record<GymAdmin['role'], string> = {
  'Super admin': 'bg-[#00B4CC] text-white',
  'Admin':       'bg-[#624DE3] text-white',
  'Support':     'bg-[#F59E0B] text-white',
  'Accountant':  'bg-[#10B981] text-white',
}

interface GymAdminsTabProps {
  admins: GymAdmin[]
}

interface NewAdmin {
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}

const EMPTY_FORM: NewAdmin = { firstName: '', lastName: '', phone: '', email: '', password: '' }

export function GymAdminsTab({ admins: initial }: GymAdminsTabProps) {
  const [admins, setAdmins]     = useState<GymAdmin[]>(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState<NewAdmin>(EMPTY_FORM)
  const [showPwd, setShowPwd]     = useState(false)

  function handleDelete(id: string) {
    setAdmins((prev) => prev.filter((a) => a.id !== id))
  }

  function handleSave() {
    if (!form.firstName.trim() || !form.email.trim()) return
    const newAdmin: GymAdmin = {
      id:       `adm-${Date.now()}`,
      role:     'Admin',
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone:    form.phone.trim(),
      email:    form.email.trim(),
    }
    setAdmins((prev) => [...prev, newAdmin])
    setForm(EMPTY_FORM)
    setModalOpen(false)
  }

  function update(field: keyof NewAdmin, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 text-sm font-semibold text-foreground">Zalı idarə edən admin</h3>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border">
          {/* Header */}
          <div className="grid grid-cols-[140px_120px_1fr_1fr_1fr_40px] gap-3 border-b border-border bg-[#00B4CC14] px-4 py-2.5">
            <span className="text-xs font-semibold text-foreground">Rol</span>
            <span className="text-xs font-semibold text-foreground">ID</span>
            <span className="text-xs font-semibold text-foreground">Ad / Soyad</span>
            <span className="text-xs font-semibold text-foreground">Telefon</span>
            <span className="text-xs font-semibold text-foreground">E-poçt</span>
            <span />
          </div>

          {admins.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Admin əlavə edilməyib
            </div>
          ) : (
            admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-[140px_120px_1fr_1fr_1fr_40px] items-center gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                {/* Role badge */}
                <div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold',
                      ROLE_STYLES[admin.role],
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    {admin.role}
                  </span>
                </div>

                {/* ID */}
                <span className="text-sm text-muted-foreground font-mono">
                  {admin.id.replace('a', '00000')}
                </span>

                {/* Full name */}
                <span className="text-sm text-foreground">{admin.fullName}</span>

                {/* Phone */}
                <span className="text-sm text-foreground">{admin.phone || '+994 00 000 00 00'}</span>

                {/* Email */}
                <span className="text-sm text-foreground">{admin.email}</span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Admini sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add admin button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#00B4CC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008799] transition-colors"
          >
            Admin əlavə et
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-base font-bold leading-none">+</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Admin əlavə et</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Fields */}
            <ModalField label="Ad"     value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="Adminin adı" />
            <ModalField label="Soyad"  value={form.lastName}  onChange={(v) => update('lastName', v)}  placeholder="Adminin soyadı" />
            <ModalField label="Telefon" value={form.phone}    onChange={(v) => update('phone', v)}     placeholder="Adminin nömrəsi" />
            <ModalField label="Email"  value={form.email}     onChange={(v) => update('email', v)}     placeholder="Adminin emaili" />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Şifrə</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="············"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00B4CC] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!form.firstName.trim() || !form.email.trim()}
              className="mt-1 w-full rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] disabled:opacity-40 transition-colors"
            >
              Yadda saxla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors"
      />
    </div>
  )
}
