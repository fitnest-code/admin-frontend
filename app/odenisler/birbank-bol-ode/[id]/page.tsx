import { AdminLayout } from '@/components/layout/admin-layout'
import { BolOdeDetailPage } from '@/components/bol-ode/bol-ode-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BirbankBolOdeDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <BolOdeDetailPage id={id} />
    </AdminLayout>
  )
}
