import TranslationsPage from '@/components/translations/translations-main'
import { AdminLayout } from '@/components/layout/admin-layout'
import React from 'react'

const page = () => {
  return (
    <AdminLayout>
      <TranslationsPage />
    </AdminLayout>
  )
}

export default page
