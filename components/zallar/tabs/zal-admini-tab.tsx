'use client'

import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ZalAdmin } from '@/lib/zallar-data'

interface ZalAdminiTabProps {
  admins: ZalAdmin[]
}

const ROLE_STYLES: Record<ZalAdmin['role'], string> = {
  'BTM owner':  'bg-[#00B4CC] text-white',
  'Admin':      'bg-[#624DE3] text-white',
  'Support':    'bg-[#F59E0B] text-white',
  'Accountant': 'bg-[#10B981] text-white',
}

export function ZalAdminiTab({ admins }: ZalAdminiTabProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 text-sm font-semibold text-foreground">Zalı idarə edən admin</h3>

        <div className="flex flex-col gap-3">
          {admins.map((admin) => (
            <AdminRow key={admin.id} admin={admin} />
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button className="rounded-lg bg-[#00B4CC] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">
          Yadda saxla
        </button>
      </div>
    </div>
  )
}

function AdminRow({ admin }: { admin: ZalAdmin }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background px-4 py-3">
      {/* Role badge */}
      <span
        className={cn(
          'shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold',
          ROLE_STYLES[admin.role],
        )}
      >
        {admin.role}
      </span>

      {/* Name */}
      <span className="flex-1 min-w-[140px] text-sm text-foreground">
        Ad soyad:{' '}
        <span className="font-medium">{admin.fullName}</span>
      </span>

      {/* Email */}
      <div className="flex flex-1 min-w-[160px] items-center gap-2">
        <span className="text-sm text-muted-foreground truncate">
          E-poçt: <span className="text-foreground">{admin.email}</span>
        </span>
        <button
          className="shrink-0 text-muted-foreground hover:text-[#00B4CC] transition-colors"
          aria-label="E-poçtu redaktə et"
        >
          <Pencil size={13} />
        </button>
      </div>
    </div>
  )
}
