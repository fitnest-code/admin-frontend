import { AdminLayout } from '@/components/layout/admin-layout'
import { GymDetailPage as GymDetailScreen } from '@/components/gyms/gym-detail-page'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GymDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <GymDetailScreen id={id} />
    </AdminLayout>
  )
}
