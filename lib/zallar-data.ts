export type ZalStatus = 'aktiv' | 'deaktiv'

export interface WorkingHour {
  day: string
  shortDay: string
  open: string
  close: string
  type: 'normal' | 'istirahет'
}

export interface Mesqci {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  role: string
  zalId: string
  photo?: string
}

export interface ZalAdmin {
  id: string
  role: 'BTM owner' | 'Admin' | 'Support' | 'Accountant'
  fullName: string
  email: string
}

export interface Zal {
  id: string
  name: string
  city: string
  address: string
  phone: string
  email: string
  status: ZalStatus
  createdAt: string
  logo?: string
  images: string[]
  workingHours: WorkingHour[]
  mesqciler: Mesqci[]
  admins: ZalAdmin[]
}

const DEFAULT_WORKING_HOURS: WorkingHour[] = [
  { day: 'Bazar ertəsi', shortDay: 'B.e', open: '07:00', close: '23:00', type: 'normal' },
  { day: 'Çərşənbə axşamı', shortDay: 'Ç.a', open: '07:00', close: '23:00', type: 'normal' },
  { day: 'Çərşənbə', shortDay: 'Ç', open: '07:00', close: '23:00', type: 'normal' },
  { day: 'Cümə axşamı', shortDay: 'C.a', open: '07:00', close: '23:00', type: 'normal' },
  { day: 'Cümə', shortDay: 'C', open: '07:00', close: '23:00', type: 'normal' },
  { day: 'Şənbə', shortDay: 'Ş', open: '09:00', close: '21:00', type: 'normal' },
  { day: 'Bazar', shortDay: 'B', open: '09:00', close: '18:00', type: 'istirahет' },
]

export const MOCK_ZALLAR: Zal[] = [
  {
    id: '1',
    name: 'FIT CLUB',
    city: 'Bakı',
    address: 'Nərimanov',
    phone: '+994 50 376 55 55',
    email: 'fitclub@gmail.com',
    status: 'aktiv',
    createdAt: '24.07.2021',
    images: [],
    workingHours: DEFAULT_WORKING_HOURS,
    mesqciler: [
      {
        id: 'm1',
        firstName: 'Gunay',
        lastName: 'Aliyev',
        phone: '+994 55 111 11 11',
        email: 'fitclub@gmail.com',
        role: 'Gym Coach',
        zalId: '1',
      },
      {
        id: 'm2',
        firstName: 'Ardan',
        lastName: 'Dadır',
        phone: '+994 55 222 22 22',
        email: 'fitclub@gmail.com',
        role: 'Gym Coach',
        zalId: '1',
      },
    ],
    admins: [
      { id: 'a1', role: 'BTM owner', fullName: 'Aliyev Kamal', email: 'Admin@mail.com' },
      { id: 'a2', role: 'Admin',     fullName: 'Aliyev Kamal', email: 'Admin@mail.com' },
      { id: 'a3', role: 'Support',   fullName: 'Aliyev Kamal', email: 'Admin@mail.com' },
      { id: 'a4', role: 'Accountant',fullName: 'Aliyev Kamal', email: 'Admin@mail.com' },
    ],
  },
  {
    id: '2',
    name: 'Power Gym',
    city: 'Bakı',
    address: 'Nəsimi',
    phone: '+994 51 234 56 78',
    email: 'powergym@mail.com',
    status: 'aktiv',
    createdAt: '10.03.2022',
    images: [],
    workingHours: DEFAULT_WORKING_HOURS,
    mesqciler: [],
    admins: [],
  },
  {
    id: '3',
    name: 'Iron Body',
    city: 'Gəncə',
    address: 'Kapaz',
    phone: '+994 70 987 65 43',
    email: 'ironbody@mail.com',
    status: 'deaktiv',
    createdAt: '05.06.2023',
    images: [],
    workingHours: DEFAULT_WORKING_HOURS,
    mesqciler: [],
    admins: [],
  },
  {
    id: '4',
    name: 'Active Sport',
    city: 'Bakı',
    address: 'Xətai',
    phone: '+994 55 765 43 21',
    email: 'active@sport.az',
    status: 'aktiv',
    createdAt: '18.01.2023',
    images: [],
    workingHours: DEFAULT_WORKING_HOURS,
    mesqciler: [],
    admins: [],
  },
  {
    id: '5',
    name: 'MegaFit',
    city: 'Bakı',
    address: 'Binəqədi',
    phone: '+994 50 111 22 33',
    email: 'mega@fit.az',
    status: 'deaktiv',
    createdAt: '29.09.2022',
    images: [],
    workingHours: DEFAULT_WORKING_HOURS,
    mesqciler: [],
    admins: [],
  },
]

export const SORT_OPTIONS = [
  { value: 'newest',   label: 'Yeni əlavə olunanlar' },
  { value: 'az',       label: 'Ad: A-Z' },
  { value: 'za',       label: 'Ad: Z-A' },
  { value: 'deaktiv',  label: 'Deaktiv zallar' },
  { value: 'sehir',    label: 'Şəhər/Ünvan' },
]

export const ZAL_TABS = [
  { key: 'analitika',   label: 'Analitika' },
  { key: 'melumatlar',  label: 'Zal məlumatları' },
  { key: 'work-hours',  label: 'İş saatları' },
  { key: 'mesqciler',   label: 'Məşqçilər' },
  { key: 'abunelik',    label: 'Abunəlik / Xidmətlər' },
  { key: 'contact',    label: 'Əlaqə' },
  { key: 'admin',       label: 'Zal Admini' },
  { key: 'reyting',     label: 'Reytinq' },
]
