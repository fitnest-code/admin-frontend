import { AdminLayout } from '@/components/layout/admin-layout'
import { ProfilePage } from '@/components/profile/profile-page'

export const metadata = {
  title: 'Profil — FitNest',
}

export default function Page() {
  return (
    <AdminLayout>
      <ProfilePage />
    </AdminLayout>
  )
}
