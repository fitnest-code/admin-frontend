'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { ZallarList } from '@/components/zallar/zallar-list'

export default function ZallarPage() {
  return (
    <AdminLayout>
      <ZallarList />
    </AdminLayout>
  )
}
