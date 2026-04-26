import { AdminLayout } from '@/components/layout/admin-layout'
import { GymsList }    from '@/components/gyms/gyms-list'

export const metadata = {
  title: 'Zallar | FitNest Admin',
}

export default function GymsPage() {
  return (
    <AdminLayout>
      <GymsList />
    </AdminLayout>
  )
}
