interface TrainerState {
  gymId: number | null;
  setGymId: (id: number) => void;
  resetGym: () => void;
}

export interface ITrainerPayload {
  id: number;
  names: string[];
  surnames: string[];
  professionIds: number[];
  emails: string[];
  phones: string[];
  photos: File[];
}

export interface IProfession {
  id: number;
  name: string;
}

export interface ITrainer {
  trainer_id: string;
  name: string;
  surname: string;
  profession: IProfession;
  picture: string;
  phone: string;
  email: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TrainerRequest {
  name: string;
  surname: string;
  professionId: number;
  phone: string;
  email: string;
  photo?: File;
}


export interface GymStep1Data {
  categoryId: number | null
  name: string
  description: string
  phone: string
  email: string
}

interface GymStore {
  step1: GymStep1Data
  gymId: string | null
  setStep1: (data: Partial<GymStep1Data>) => void
  setGymId: (id: string) => void
}

export interface Category {
  id: number
  name: string
  photoUrl: string
  iconUrl: string
}

export interface CategoriesResponse {
  items: Category[]
  total: number
  page: number
  pageSize: number
}

export interface GymStep1Response {
  gymId: number
}

export interface GymStep1Payload {
  categoryId: number
  name: string
  description: string
  phone: string
  email: string
}

export interface SupportedServiceResponse {
  id: number
  name: string
  gymId?: number
}

export interface SupportedServiceRequest {
  name: string
  gymId?: number
}

export interface GymCreateStep6SubscriptionRequest {
  packageId: number
  dailyPrice: number
  supportedServicesId: number[]
}

export interface GymCreateStep6Request {
  subscriptions: GymCreateStep6SubscriptionRequest[]
}

export interface GymAdminCreateRequest {
  name: string
  surname: string
  phoneNumber: string
  email: string
  password: string
}

export interface GymCreateStep7Request {
  admins: GymAdminCreateRequest[]
}

export interface GymEntranceHistoryAdminResponse {
  id: number
  userId: number
  firstName: string
  lastName: string
  phone: string
  scanDateTime: string
  status: string
  reason: string | null
  amount: number
}

export interface GymAnalyticsResponse {
  totalProfit: number
  successfulScans: number
  failedScans: number
  history: {
    items: GymEntranceHistoryAdminResponse[]
    total: number
    page: number
    pageSize: number
  }
}

export interface RoomImageDto {
  id: number
  name: string
  imageUrl: string
}

export interface GymInfoAdminResponse {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string
  coverImageUrl: string
  rooms: RoomImageDto[]
  phone: string
  email: string
  city: string
  address: string
  latitude: number
  longitude: number
  createdAt: string
}

export interface GymInfoUpdateRequest {
  categoryId: number
  name: string
  description: string
  phone: string
  email: string
  city: string
  address: string
  latitude: number
  longitude: number
}