'use client'

import { useRouter } from 'next/navigation'
import { AdminDetail } from '@/components/admins/admin-detail'
import { useCustomerQuery } from '@/modules/customers'
import { useT } from '@/lib/i18n'

export function FitnestStaffDetailPage({ id }: { id: string }) {
  const router = useRouter()
  const t = useT()
  const customerQuery = useCustomerQuery(id)

  if (customerQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        {t.fitnestStaff.loadingDetail}
      </div>
    )
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center">
        <p className="text-sm text-red-500">{t.fitnestStaff.errorDetail}</p>
        <button
          onClick={() => router.push('/fitnest-staff')}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          {t.fitnestStaff.backToList}
        </button>
      </div>
    )
  }

  return <AdminDetail customer={customerQuery.data} />
}
