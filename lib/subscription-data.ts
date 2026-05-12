
export type SubStatus = 'active' | 'inactive'

export interface PriceTier {
  duration: string
  price: number
  discountPrice: number
  entryLimit?: number
}

export interface SubPackage {
  id: string
  name: string
  priceTiers: PriceTier[]
  entryLimit: number
  services: string[]
  status: SubStatus
}

export const ENTRY_LIMIT_OPTIONS = [
  '7 giriş', '8 giriş', '9 giriş', '10 giriş', '11 giriş',
  '12 giriş', '15 giriş', '20 giriş', 'Limitsiz',
]

export const MOCK_SUB_PACKAGES: SubPackage[] = [
  {
    id: 'sub-1',
    name: 'Bronze',
    priceTiers: [{ duration: '1 ay', price: 30, discountPrice: 25 }],
    entryLimit: 12,
    services: ['Hovuz', 'Sauna'],
    status: 'active',
  },
  {
    id: 'sub-2',
    name: 'Bronze',
    priceTiers: [{ duration: '1 ay', price: 30, discountPrice: 25 }],
    entryLimit: 12,
    services: ['Hovuz', 'Sauna'],
    status: 'inactive',
  },
  {
    id: 'sub-3',
    name: 'Silver',
    priceTiers: [
      { duration: '1 ay', price: 50, discountPrice: 45 },
      { duration: '3 ay', price: 150, discountPrice: 120 },
    ],
    entryLimit: 20,
    services: ['Hovuz', 'Sauna', 'Fitness'],
    status: 'active',
  },
  {
    id: 'sub-4',
    name: 'Gold',
    priceTiers: [
      { duration: '3 ay', price: 75, discountPrice: 60 },
      { duration: '6 ay', price: 140, discountPrice: 120 },
    ],
    entryLimit: 12,
    services: ['Hovuz', 'Sauna', 'Fitness', 'SPA'],
    status: 'active',
  },
  {
    id: 'sub-5',
    name: 'Platinum',
    priceTiers: [{ duration: '12 ay', price: 250, discountPrice: 210 }],
    entryLimit: 12,
    services: ['Hovuz', 'Sauna', 'Fitness', 'SPA', 'Masaj'],
    status: 'inactive',
  },
]
