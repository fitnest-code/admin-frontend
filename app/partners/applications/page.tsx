import { AdminLayout } from '@/components/layout/admin-layout'
import { PartnerApplicationsList } from '@/components/partners/partner-applications-list'

export default function PartnerApplicationsPage() {
  return (
    <AdminLayout>
      <PartnerApplicationsList />
    </AdminLayout>
  )
}
