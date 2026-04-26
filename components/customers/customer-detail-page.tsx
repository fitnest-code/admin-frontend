'use client'

import { useRouter } from 'next/navigation'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { useCustomerQuery } from '@/modules/customers'

export function CustomerDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const customerQuery = useCustomerQuery(id)

  if (customerQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        Müştəri məlumatları yüklənir...
      </div>
    )
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center">
        <p className="text-sm text-red-500">Müştəri məlumatları yüklənmədi.</p>
        <button
          onClick={() => router.push('/customers')}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Müştərilər siyahısına qayıt
        </button>
      </div>
    )
  }

  return <CustomerDetail customer={customerQuery.data} />
}
