import { AdminLayout }    from '@/components/layout/admin-layout'
import { SettingsPage }  from '@/components/settings/settings-page'

export const metadata = {
  title: 'Tənzimləmələr — FitNest',
}

export default function Page() {
  return (
    <AdminLayout>
      <SettingsPage />
    </AdminLayout>
  )
}
