'use client'

import { useRouter } from 'next/navigation'
import { GymDetail } from '@/components/gyms/gym-detail'
import { useGymQuery } from '@/modules/gyms'
import { useGymAnalytics } from '@/lib/query/gym-query'

export function GymDetailPage({ id }: { id: string }) {
  const router = useRouter()
  // Prefetch analytics in parallel since it's the default tab
  useGymAnalytics(id)
  const gymQuery = useGymQuery(id)

  if (gymQuery.isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        Zal məlumatları yüklənir...
      </div>
    )
  }

  if (gymQuery.isError || !gymQuery.data) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-16 text-center">
        <p className="text-sm text-red-500">Zal məlumatları yüklənmədi.</p>
        <button
          onClick={() => router.push('/gyms')}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Zallar siyahısına qayıt
        </button>
      </div>
    )
  }

  return <GymDetail gym={gymQuery.data} />
}
