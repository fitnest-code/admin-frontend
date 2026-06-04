import { AdminDetailPage } from '@/components/admins/admin-detail-page'
import { AdminLayout } from '@/components/layout/admin-layout'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <AdminDetailPage id={id} />
    </AdminLayout>
  )
}
