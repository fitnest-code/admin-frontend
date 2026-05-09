import CategoriesPage from '@/components/categories/category-main'
import { AdminLayout } from '@/components/layout/admin-layout'
import React from 'react'

const page = () => {
  return (
    <AdminLayout>
      <CategoriesPage />
    </AdminLayout>
  )
}

export default page