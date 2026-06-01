import CancellationReasonsMain from '@/components/cancellation-reasons/cancellation-reasons-main'
import { AdminLayout } from '@/components/layout/admin-layout'
import React from 'react'

const page = () => {
  return (
    <AdminLayout>
      <CancellationReasonsMain />
    </AdminLayout>
  )
}

export default page
