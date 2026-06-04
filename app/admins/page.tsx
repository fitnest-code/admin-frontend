import { AdminLayout } from '@/components/layout/admin-layout'
import { AdminsList } from '@/components/admins/admins-list'

export default function AdminsPage() {
  return (
    <AdminLayout>
      <AdminsList />
    </AdminLayout>
  )
}
