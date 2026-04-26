import { AdminLayout }          from '@/components/layout/admin-layout'
import { GymDetail }             from '@/components/gyms/gym-detail'
import { DEFAULT_WORKING_HOURS } from '@/lib/gyms-data'
import type { Gym }              from '@/lib/gyms-data'

const EMPTY_GYM: Gym = {
  id: 'new',
  name: '',
  about: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  status: 'active',
  createdAt: new Date().toLocaleDateString('az-AZ'),
  images: [],
  genderType: 'mixed',
  workingHours: DEFAULT_WORKING_HOURS,
  subscriptionTiers: [],
  services: [],
  trainers: [],
  admins: [],
}

export const metadata = {
  title: 'Yeni Zal | FitNest Admin',
}

export default function NewGymPage() {
  return (
    <AdminLayout>
      <GymDetail gym={EMPTY_GYM} isNew />
    </AdminLayout>
  )
}
