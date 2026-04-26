import { CustomerDetailPage as CustomerDetailScreen } from '@/components/customers/customer-detail-page'
import { AdminLayout } from '@/components/layout/admin-layout'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <CustomerDetailScreen id={id} />
    </AdminLayout>
  )
}
