import { AdminLayout } from '@/components/layout/admin-layout'
import { ReviewsTab }  from '@/components/gyms/tabs/reviews-tab'

export default function ReviewsPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-bold text-foreground">Reytinqlər</h1>
        <ReviewsTab />
      </div>
    </AdminLayout>
  )
}
