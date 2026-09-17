import { AdminLayout } from '@/components/layout/admin-layout'
import { BmiRequestsList } from '@/components/bmi/bmi-requests-list'

export default function BmiRequestsPage() {
  return (
    <AdminLayout>
      <BmiRequestsList />
    </AdminLayout>
  )
}
