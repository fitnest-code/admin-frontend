import { PartnerDetailPage } from '@/components/partners/partner-detail-page'
import { AdminLayout } from '@/components/layout/admin-layout'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PartnerDetailRoute({ params }: Props) {
  const { id } = await params

  return (
    <AdminLayout>
      <PartnerDetailPage id={id} />
    </AdminLayout>
  )
}
