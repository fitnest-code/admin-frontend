'use client'

import { use } from 'react'
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
      <ZalDetail zal={zal} />
    </AdminLayout>
  )
}
