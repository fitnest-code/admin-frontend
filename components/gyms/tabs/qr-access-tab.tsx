'use client'

import { Download, RefreshCw } from 'lucide-react'

interface QrAccessTabProps {
  gymName: string
}

export function QrAccessTab({ gymName }: QrAccessTabProps) {
  const qrValue = encodeURIComponent(`fitnest-gym:${gymName}`)
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrValue}&bgcolor=ffffff&color=000000&margin=10`

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-5 text-sm font-semibold text-foreground">QR giriş (Zala daxilolma)</h3>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-white p-3 shadow-sm">
            <img src={qrUrl} alt={`${gymName} QR kodu`} width={160} height={160} className="block" />
          </div>

          <div className="flex flex-col gap-3">
            <button className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] transition-colors group">
              <Download size={16} className="text-muted-foreground group-hover:text-[#00B4CC]" />
              QR pdf yüklə
            </button>
            <button className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-[#00B4CC] hover:text-[#00B4CC] transition-colors group">
              <RefreshCw size={16} className="text-muted-foreground group-hover:text-[#00B4CC]" />
              QR yenilə
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <button className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          Ləğv et
        </button>
        <button disabled className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed">
          Yadda saxla
        </button>
      </div>
    </div>
  )
}
