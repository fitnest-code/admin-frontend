export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  gymId: string
  gymName: string
  userName: string
  rating: number
  comment: string
  status: ReviewStatus
  date: string
}

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', gymId: '1', gymName: 'FIT CLUB',     userName: 'Nigar Məmmədova', rating: 4, comment: 'Uzun müddətdir bu zala gəliram və çox razıyam. Avadanlıqlar çox yaxşıdır.', status: 'pending',  date: '12.06.2025' },
  { id: 'r2', gymId: '1', gymName: 'FIT CLUB',     userName: 'Ramil Babayev',   rating: 5, comment: 'Əla xidmət, peşəkar məşqçilər. Tövsiyə edirəm.', status: 'approved', date: '10.06.2025' },
  { id: 'r3', gymId: '2', gymName: 'Power Gym',    userName: 'Aynur Həsənova',  rating: 3, comment: 'Ümumi olaraq normaldır, amma daha yaxşı ola bilər.', status: 'rejected', date: '08.06.2025' },
  { id: 'r4', gymId: '2', gymName: 'Power Gym',    userName: 'Orxan Nəbiyev',   rating: 2, comment: 'Soyunma otaqları dar, avadanlıqlar köhnədir.', status: 'pending',  date: '06.06.2025' },
  { id: 'r5', gymId: '3', gymName: 'Iron Body',    userName: 'Leyla Quliyeva',  rating: 5, comment: 'Mükəmməl fitnes mərkəzi. Hər şey əladır!', status: 'approved', date: '04.06.2025' },
  { id: 'r6', gymId: '4', gymName: 'Active Sport', userName: 'Tural Hüseynov',  rating: 1, comment: 'Çox baha, xidmət zəifdir. Məyus oldum.', status: 'rejected', date: '02.06.2025' },
  { id: 'r7', gymId: '1', gymName: 'FIT CLUB',     userName: 'Sevinc Əliyeva',  rating: 4, comment: 'Havadarlıq sistemi yaxşıdır, məşqçilər səmimildir.', status: 'pending',  date: '01.06.2025' },
  { id: 'r8', gymId: '5', gymName: 'MegaFit',      userName: 'Elnur Rzayev',    rating: 3, comment: 'Orta səviyyəli zal. Qiymət uyğundur.', status: 'approved', date: '28.05.2025' },
]

export type SubscriptionTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

export interface GymService {
  id: string
  name: string
}

export const ALL_SUBSCRIPTION_TIERS: SubscriptionTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

export const DEFAULT_SERVICES: GymService[] = [
  { id: 's1', name: 'Spa' },
  { id: 's2', name: 'Masaj' },
  { id: 's3', name: 'Hovuz' },
  { id: 's4', name: 'Hamam' },
  { id: 's5', name: 'Sauna' },
  { id: 's6', name: 'Kafe' },
  { id: 's7', name: 'Fen' },
  { id: 's8', name: 'Daraq' },
]

export type GymStatus = 'active' | 'inactive'

export type GenderType = 'women-only' | 'men-only' | 'mixed'

export interface TimeSlot {
  id: string
  open: string
  close: string
}

export interface WorkingHour {
  day: string
  shortDay: string
  slots: TimeSlot[]
}

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  role: string
  gymId: string
  photo?: string
}

export interface GymAdmin {
  id: string
  role: 'Super admin' | 'Admin' | 'Support' | 'Accountant'
  fullName: string
  phone: string
  email: string
}

export interface Gym {
  id: string
  name: string
  about: string
  city: string
  address: string
  phone: string
  email: string
  status: GymStatus
  createdAt: string
  coverImage?: string
  images: string[]
  genderType: GenderType
  workingHours: WorkingHour[]
  subscriptionTiers: SubscriptionTier[]
  services: GymService[]
  trainers: Trainer[]
  admins: GymAdmin[]
}

export const DEFAULT_WORKING_HOURS: WorkingHour[] = [
  { day: 'Bazar ertəsi',    shortDay: 'B.e', slots: [{ id: '1', open: '07:00', close: '23:00' }] },
  { day: 'Çərşənbə axşamı', shortDay: 'Ç.a', slots: [{ id: '1', open: '07:00', close: '23:00' }] },
  { day: 'Çərşənbə',        shortDay: 'Ç',   slots: [{ id: '1', open: '07:00', close: '23:00' }] },
  { day: 'Cümə axşamı',     shortDay: 'C.a', slots: [{ id: '1', open: '07:00', close: '23:00' }] },
  { day: 'Cümə',            shortDay: 'C',   slots: [{ id: '1', open: '07:00', close: '23:00' }] },
  { day: 'Şənbə',           shortDay: 'Ş',   slots: [{ id: '1', open: '09:00', close: '21:00' }] },
  { day: 'Bazar',           shortDay: 'B',   slots: [{ id: '1', open: '12:00', close: '18:00' }, { id: '2', open: '12:00', close: '18:00' }] },
]

export const MOCK_GYMS: Gym[] = [
  {
    id: '1',
    name: 'FIT CLUB',
    about: 'Bakı şəhərinin ən müasir fitnes mərkəzi.',
    city: 'Bakı',
    address: 'Nərimanov',
    phone: '+994 50 376 55 55',
    email: 'fitclub@gmail.com',
    status: 'active',
    createdAt: '24.07.2021',
    images: [],
    genderType: 'mixed',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: ['Platinum'],
    services: [
      { id: 's1', name: 'Spa' },
      { id: 's2', name: 'Masaj' },
      { id: 's7', name: 'Fen' },
    ],
    trainers: [
      {
        id: 't1',
        firstName: 'Gunay',
        lastName: 'Aliyev',
        phone: '+994 55 111 11 11',
        email: 'gunay@fitclub.com',
        role: 'Gym Coach',
        gymId: '1',
      },
      {
        id: 't2',
        firstName: 'Ardan',
        lastName: 'Dadır',
        phone: '+994 55 222 22 22',
        email: 'ardan@fitclub.com',
        role: 'Gym Coach',
        gymId: '1',
      },
    ],
    admins: [
      { id: 'a1', role: 'Super admin', fullName: 'Aliyev Kamal', phone: '+994 00 000 00 00', email: 'Admin@mail.com' },
      { id: 'a2', role: 'Admin',       fullName: 'Aliyev Kamal', phone: '+994 00 000 00 00', email: 'Admin@mail.com' },
      { id: 'a3', role: 'Support',     fullName: 'Aliyev Kamal', phone: '+994 00 000 00 00', email: 'Admin@mail.com' },
      { id: 'a4', role: 'Accountant',  fullName: 'Aliyev Kamal', phone: '+994 00 000 00 00', email: 'Admin@mail.com' },
    ],
  },
  {
    id: '2',
    name: 'Power Gym',
    about: '',
    city: 'Bakı',
    address: 'Nəsimi',
    phone: '+994 51 234 56 78',
    email: 'powergym@mail.com',
    status: 'active',
    createdAt: '10.03.2022',
    images: [],
    genderType: 'men-only',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: [],
    services: [],
    trainers: [],
    admins: [],
  },
  {
    id: '3',
    name: 'Iron Body',
    about: '',
    city: 'Gəncə',
    address: 'Kapaz',
    phone: '+994 70 987 65 43',
    email: 'ironbody@mail.com',
    status: 'inactive',
    createdAt: '05.06.2023',
    images: [],
    genderType: 'mixed',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: [],
    services: [],
    trainers: [],
    admins: [],
  },
  {
    id: '4',
    name: 'Active Sport',
    about: '',
    city: 'Bakı',
    address: 'Xətai',
    phone: '+994 55 765 43 21',
    email: 'active@sport.az',
    status: 'active',
    createdAt: '18.01.2023',
    images: [],
    genderType: 'women-only',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: [],
    services: [],
    trainers: [],
    admins: [],
  },
  {
    id: '5',
    name: 'MegaFit',
    about: '',
    city: 'Bakı',
    address: 'Binəqədi',
    phone: '+994 50 111 22 33',
    email: 'mega@fit.az',
    status: 'inactive',
    createdAt: '29.09.2022',
    images: [],
    genderType: 'mixed',
    workingHours: DEFAULT_WORKING_HOURS,
    subscriptionTiers: [],
    services: [],
    trainers: [],
    admins: [],
  },
]

export const SORT_OPTIONS = [
  { value: 'newest',      label: 'Yeni əlavə olunanlar' },
  { value: 'name_asc',    label: 'Ad: A-Z' },
  { value: 'name_desc',   label: 'Ad: Z-A' },
  { value: 'deactivated', label: 'Deaktiv zallar' },
  { value: 'address_asc', label: 'Şəhər/Ünvan' },
]

export const GYM_TABS = [
  { key: 'info',        label: 'Zal məlumatları' },
  { key: 'trainers',    label: 'Məşqçilər' },
  { key: 'workingHours',label: 'İş saatları' },
  { key: 'address',     label: 'Ünvan' },
  { key: 'images',      label: 'Şəkillər' },
  { key: 'plans',       label: 'Abunəlik / Xidmətlər' },
  { key: 'admins',      label: 'Zal Admini' },
];
