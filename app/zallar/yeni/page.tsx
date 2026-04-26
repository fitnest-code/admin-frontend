'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { ZalDetail } from '@/components/zallar/zal-detail'
import type { Zal } from '@/lib/zallar-data'

const EMPTY_ZAL: Zal = {
  id: 'new',
  name: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  status: 'aktiv',
  createdAt: new Date().toLocaleDateString('az-AZ'),
  images: [],
  workingHours: [
    { day: 'Bazar ertəsi',       shortDay: 'B.e', open: '07:00', close: '23:00', type: 'normal' },
    { day: 'Çərşənbə axşamı',    shortDay: 'Ç.a', open: '07:00', close: '23:00', type: 'normal' },
    { day: 'Çərşənbə',           shortDay: 'Ç',   open: '07:00', close: '23:00', type: 'normal' },
    { day: 'Cümə axşamı',        shortDay: 'C.a', open: '07:00', close: '23:00', type: 'normal' },
    { day: 'Cümə',               shortDay: 'C',   open: '07:00', close: '23:00', type: 'normal' },
    { day: 'Şənbə',              shortDay: 'Ş',   open: '09:00', close: '21:00', type: 'normal' },
    { day: 'Bazar',              shortDay: 'B',   open: '09:00', close: '18:00', type: 'istirahет' },
  ],
  mesqciler: [],
  admins: [],
}

export default function YeniZalPage() {
  return (
    <AdminLayout>
      <ZalDetail zal={EMPTY_ZAL} isNew />
    </AdminLayout>
  )
}
