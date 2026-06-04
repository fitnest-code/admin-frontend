'use client'

import { useRouter } from 'next/navigation'
import { AdminDetail } from '@/components/admins/admin-detail'
import { useCustomerQuery } from '@/modules/customers'

export function AdminDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const customerQuery = useCustomerQuery(id)

  if (customerQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground font-sans animate-pulse">
        Admin məlumatları yüklənir...
      </div>
    )
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center font-sans">
        <p className="text-sm text-red-500">Admin məlumatları yüklənmədi.</p>
        <button
          onClick={() => router.push('/admins')}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Adminlər siyahısına qayıt
        </button>
      </div>
    )
  }

  return <AdminDetail customer={customerQuery.data} />
}
