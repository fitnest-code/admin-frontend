import { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { GymDetailPage as GymDetailScreen } from '@/components/gyms/gym-detail-page'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GymDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <Suspense fallback={<div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">Zal məlumatları yüklənir...</div>}>
        <GymDetailScreen id={id} />
      </Suspense>
    </AdminLayout>
  )
}
