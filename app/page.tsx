import { AdminLayout } from '@/components/layout/admin-layout'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export default function Page() {
  return (
    <AdminLayout>
      <DashboardPage />
    </AdminLayout>
  )
}
