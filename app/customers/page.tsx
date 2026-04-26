import { AdminLayout }    from '@/components/layout/admin-layout'
import { CustomersList } from '@/components/customers/customers-list'

export default function CustomersPage() {
  return (
    <AdminLayout>
      <CustomersList />
    </AdminLayout>
  )
}
