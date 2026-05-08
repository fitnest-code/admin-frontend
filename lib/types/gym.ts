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

export interface ITrainersResponse {
  items: ITrainer[];
  total: number;
  page: number;
  pageSize: number;
}

interface TrainerState {
  searchQuery: string;
  page: number;
  pageSize: number;
  sortDir: "ASC" | "DESC";
  setSearchQuery: (q: string) => void;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  setSortDir: (d: "ASC" | "DESC") => void;
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