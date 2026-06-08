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
  lessonTypesPerTrainer?: string[];
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
  lessonTypeIds?: number[];
}

export interface ITrainersResponse {
  items: ITrainer[];
  total: number;
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
  lessonTypeIds?: number[];
}


export interface GymStep1Data {
  categoryId: number | null
  name: string
  description: string
  phone: string
  email: string | null
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
  lessonTypes?: { id: number; name: string }[]
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
  email: string | null
  lessonTypeIds: number[]
}

export interface SupportedServiceResponse {
  id: number
  name: string
  gymId?: number
  iconImageUrl?: string
  iconUrl?: string
}

export interface SupportedServiceRequest {
  name: string
  gymId?: number
}

export interface GymCreateStep6SubscriptionRequest {
  packageId: number
  dailyPrice: number
  supportedServicesId: number[]
  customServices?: string[]
}

export interface GymCreateStep6Request {
  subscriptions: GymCreateStep6SubscriptionRequest[]
  serviceIcons?: File[]
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
  profilePhotoUrl?: string
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

export interface GymWorkHourResponse {
  period: string
  from: string
  to: string
}

export interface RestDayRequest {
  period: string
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
  status?: string
  createdAt: string
  lessonTypes?: { id: number; name: string }[]
}

export interface GymPlanBenefitAdminResponse {
  id: number
  name: string
  iconImageUrl?: string
}

export interface GymPlanItemAdminResponse {
  packageId: number
  packageName: string
  dailyPrice: number
  benefits: GymPlanBenefitAdminResponse[]
}

export interface GymSubscriptionsAdminResponse {
  gymId: number
  subscriptions: GymPlanItemAdminResponse[]
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

// V2 Interfaces
export interface GymStep1DataV2 {
  categoryIds: number[]
  name: string
  description: string
  phone: string
  email: string | null
}

export interface GymStep1PayloadV2 {
  categoryIds: number[]
  name: string
  description: string
  phone: string
  email: string | null
  lessonTypeIds: number[]
}

export interface RoomImageDtoV2 {
  id: number
  name: string
  imageUrl: string
  categoryId: number | null
}

export interface GymInfoAdminResponseV2 {
  id: number
  categories: Category[]
  name: string
  description: string
  coverImageUrl: string
  rooms: RoomImageDtoV2[]
  phone: string
  email: string
  city: string
  address: string
  latitude: number
  longitude: number
  status?: string
  createdAt: string
  lessonTypes?: { id: number; name: string }[]
}

export interface GymCreateStep6SubscriptionRequestV2 {
  packageId: number
  categoryId: number
  dailyPrice: number
  supportedServicesId: number[]
  customServices?: string[]
}

export interface GymCreateStep6RequestV2 {
  subscriptions: GymCreateStep6SubscriptionRequestV2[]
  serviceIcons?: File[]
}

export interface GymPlanItemAdminResponseV2 {
  packageId: number
  packageName: string
  categoryId: number
  dailyPrice: number
  benefits: GymPlanBenefitAdminResponse[]
}

export interface GymSubscriptionsAdminResponseV2 {
  gymId: number
  subscriptions: GymPlanItemAdminResponseV2[]
}

export interface GymInfoUpdateRequestV2 {
  categoryIds: number[]
  name: string
  description: string
  phone: string
  email: string
  city: string
  address: string
  latitude: number
  longitude: number
}