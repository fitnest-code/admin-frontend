import FaqPage from '@/components/faq/faq-main'
import { AdminLayout } from '@/components/layout/admin-layout'
import React from 'react'

const page = () => {
  return (
    <AdminLayout>
      <FaqPage />
    </AdminLayout>
  )
}

export default page
