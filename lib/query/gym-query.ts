import { useQuery, useMutation } from '@tanstack/react-query'
import { apiGet, apiPost } from "@/lib/api/client" 

export interface Category {
  id: number
  name: string
  photoUrl: string
  iconUrl: string
}

interface CategoriesResponse {
  items: Category[]
  total: number
  page: number
  pageSize: number
}

export interface GymStep1Payload {
  categoryId: number
  name: string
  dailyPrice: number
  contractPrice: number
  description: string
  phone: string
  email: string
}

export interface GymStep1Response {
  id: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<CategoriesResponse>('/categories', { params: { page: 1, size: 10 } }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGymStep1() {
  return useMutation({
    mutationFn: (payload: GymStep1Payload) =>
      apiPost<GymStep1Response>('/admin/gyms/step1', payload),
  })
}