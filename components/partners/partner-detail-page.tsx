'use client'

import { useRouter } from 'next/navigation'
import { PartnerDetail } from '@/components/partners/partner-detail'
import { useCustomerQuery } from '@/modules/customers'

export function PartnerDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const customerQuery = useCustomerQuery(id)

  if (customerQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground font-sans animate-pulse">
        Partnyor məlumatları yüklənir...
      </div>
    )
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center font-sans">
        <p className="text-sm text-red-500">Partnyor məlumatları yüklənmədi.</p>
        <button
          onClick={() => router.push('/partners')}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Partnyorlar siyahısına qayıt
        </button>
      </div>
    )
  }

  return <PartnerDetail customer={customerQuery.data} />
}
