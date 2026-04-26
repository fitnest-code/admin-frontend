export interface Store {
  id: string
  name: string
  city: string
  address: string
  phone: string
  email: string
  workingHours: string
  about: string
  photo?: string
  packages: StorePackage[]
}

export interface StorePackage {
  id: string
  name: string
  discount: number
}

export const MOCK_STORES: Store[] = [
  {
    id: 's1',
    name: 'Vitamin club',
    city: 'Bakı',
    address: 'Nərimanov rayonu',
    phone: '+994 050 000 00 00',
    email: 'asss@gmail.com',
    workingHours: 'B.e-C :  07:00-22:00',
    about: '',
    packages: [
      { id: 'p1', name: 'Paket adı', discount: 10 },
      { id: 'p2', name: 'Paket adı', discount: 10 },
    ],
  },
  {
    id: 's2',
    name: 'Vitamin club',
    city: 'Bakı',
    address: 'Nərimanov rayonu',
    phone: '+994 050 000 00 00',
    email: 'asss@gmail.com',
    workingHours: 'B.e-C :  07:00-22:00',
    about: '',
    packages: [],
  },
  {
    id: 's3',
    name: 'Vitamin club',
    city: 'Bakı',
    address: 'Nərimanov rayonu',
    phone: '+994 050 000 00 00',
    email: 'asss@gmail.com',
    workingHours: 'B.e-C :  07:00-22:00',
    about: '',
    packages: [{ id: 'p3', name: 'Paket adı', discount: 15 }],
  },
  {
    id: 's4',
    name: 'Vitamin club',
    city: 'Bakı',
    address: 'Nərimanov rayonu',
    phone: '+994 050 000 00 00',
    email: 'asss@gmail.com',
    workingHours: 'B.e-C :  07:00-22:00',
    about: '',
    packages: [],
  },
  {
    id: 's5',
    name: 'FitZone',
    city: 'Bakı',
    address: 'Xətai rayonu',
    phone: '+994 050 111 11 11',
    email: 'fitzone@gmail.com',
    workingHours: 'B.e-C :  08:00-22:00',
    about: '',
    packages: [],
  },
  {
    id: 's6',
    name: 'PowerGym',
    city: 'Gəncə',
    address: 'Nizami küçəsi',
    phone: '+994 050 222 22 22',
    email: 'powergym@gmail.com',
    workingHours: 'B.e-C :  07:00-21:00',
    about: '',
    packages: [],
  },
  {
    id: 's7',
    name: 'SportLife',
    city: 'Sumqayıt',
    address: 'Mərkəz',
    phone: '+994 050 333 33 33',
    email: 'sportlife@gmail.com',
    workingHours: 'B.e-C :  06:00-22:00',
    about: '',
    packages: [],
  },
]

export const STORE_SORT_OPTIONS = [
  { value: 'newest',      label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc',    label: 'Ad: A-Z' },
  { value: 'name_desc',   label: 'Ad: Z-A' },
  { value: 'address_asc', label: 'Şəhər/Ünvan' },
]
