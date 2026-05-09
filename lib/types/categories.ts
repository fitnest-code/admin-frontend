/**
 * API-dan qayıdan əsas Kateqoriya obyekti
 */
export interface ICategory {
  id: number;
  name: string;
  photoUrl: string;
  iconUrl?: string;
}


export interface ICreateCategoryPayload {
  name: string;
  photo: File | null;
}


export interface IUpdateCategoryPayload {
  id: number;
  name: string;
  photo?: File | null;
}

/**
 * API-dan gələn xəta strukturu (Sənin ApiError klasın üçün)
 */
export interface IApiErrorPayload {
  message?: string;
  error?: {
    message?: string;
    details?: any;
  };
}

/**
 * Kateqoriya ID-si üçün tip (opsional, kodu daha oxunaqlı edir)
 */
export type CategoryId = number;