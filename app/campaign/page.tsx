import { AdminLayout } from '@/components/layout/admin-layout'
import CampaignMain from '@/components/campaign/campaign-main'

export const metadata = {
  title: 'Kampaniya — FitNest',
}

export default function CampaignPage() {
  return (
    <AdminLayout>
      <CampaignMain />
    </AdminLayout>
  )
}
