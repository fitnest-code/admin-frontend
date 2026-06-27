'use client'

import { use, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ZalDetail } from '@/components/zallar/zal-detail'
import { MOCK_ZALLAR } from '@/lib/zallar-data'
import { useGymDetailsAdmin } from '@/lib/query/gym-query'
import { Loader2 } from 'lucide-react'

interface ZalDetailPageProps {
  params: Promise<{ id: string }>
}

function ZalDetailPageContent({ id }: { id: string }) {
  const { data: gymDetails, isLoading } = useGymDetailsAdmin(id)
  const mockZal = MOCK_ZALLAR.find((z) => z.id === id)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b4cc]" />
        <span className="font-semibold text-sm">Zal məlumatları yüklənir...</span>
      </div>
    )
  }

  if (!gymDetails && !mockZal) {
    notFound()
  }

  return (
    <ZalDetail 
      gymId={id} 
      gymDetails={gymDetails || undefined} 
      zal={mockZal || undefined} 
    />
  )
}

export default function ZalDetailPage({ params }: ZalDetailPageProps) {
  const { id } = use(params)

  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00b4cc]" />
          <span className="font-semibold text-sm">Yüklənir...</span>
        </div>
      }>
        <ZalDetailPageContent id={id} />
      </Suspense>
    </AdminLayout>
  )
}
