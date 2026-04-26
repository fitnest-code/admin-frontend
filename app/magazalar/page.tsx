import { AdminLayout } from '@/components/layout/admin-layout'
import { StoresList }  from '@/components/stores/stores-list'

export default function MagazalarPage() {
  return (
    <AdminLayout>
      <StoresList />
    </AdminLayout>
  )
}
