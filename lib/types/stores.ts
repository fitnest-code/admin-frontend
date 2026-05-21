export interface IStore {
  id: number;
  name: string;
  fullAddress: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE"; // Status dəyərlərini backend-ə uyğun genişləndirə bilərsən
}

export interface IStoreResponse {
  items: IStore[];
  total: number;
  page: number;
  pageSize: number;
  message: string;
}

export interface IStoreQueryParams {
  query?: string;
  sort?: "name_asc" | "name_desc" | "address_asc" | "newest";
  page?: number;
  pageSize?: number;
}

// Mağaza yaratma sorğusu üçün parametr tipi
export interface ICreateStoreStep1Params {
  name: string;
  photo: File;
}

/** POST /admin/stores/step1 — Swagger: yalnız yaradılmış mağazanın id-si. */
export interface ICreateStoreResponse {
  id: number;
}

export interface IWorkHours {
  from: string;
  to: string;
}

export interface IStoreStep2Payload {
  latitude: number;
  longitude: number;
  address?: string;
  phone: string;
  email: string;
  socialUrl: string;
  workHours: IWorkHours;
}

export interface IStoreStep2Response {
  id: number;
  message?: string;
}

/** POST /admin/stores/{id}/step3 — paket endirimləri, mağaza ACTIVE olur. */
export interface IStoreStep3DiscountItem {
  packageId: number;
  discountPercent: number;
}

export interface IStoreStep3Payload {
  discounts: IStoreStep3DiscountItem[];
}

export interface IStoreStep3Response {
  id?: number;
  message?: string;
}