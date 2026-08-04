import { AdminLayout } from '@/components/layout/admin-layout'
import { FitnestStaffList } from '@/components/fitnest-staff/fitnest-staff-list'

export default function FitnestStaffPage() {
  return (
    <AdminLayout>
      <FitnestStaffList />
    </AdminLayout>
  )
}
