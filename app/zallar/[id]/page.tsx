'use client'

import { use, Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { ZalDetail } from '@/components/zallar/zal-detail'
import { MOCK_ZALLAR } from '@/lib/zallar-data'

interface ZalDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ZalDetailPage({ params }: ZalDetailPageProps) {
  const { id } = use(params)
  const zal = MOCK_ZALLAR.find((z) => z.id === id)

  if (!zal) notFound()

  return (
    <AdminLayout>
      <Suspense fallback={<div className="text-center py-16 text-slate-400">Yüklənir...</div>}>
        <ZalDetail zal={zal} />
      </Suspense>
    </AdminLayout>
  )
}
