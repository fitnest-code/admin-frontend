import { AdminLayout } from '@/components/layout/admin-layout'
import { StoreDetail }  from '@/components/stores/store-detail'
import { MOCK_STORES }  from '@/lib/stores-data'

export default async function MagazaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const store = MOCK_STORES.find((s) => s.id === id)
  return (
    <AdminLayout>
      <StoreDetail store={store} isNew={id === 'new'} />
    </AdminLayout>
  )
}
