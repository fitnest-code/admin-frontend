import { AdminLayout } from '@/components/layout/admin-layout'
import { FitnestStaffDetailPage } from '@/components/fitnest-staff/fitnest-staff-detail-page'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FitnestStaffDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <FitnestStaffDetailPage id={id} />
    </AdminLayout>
  )
}
