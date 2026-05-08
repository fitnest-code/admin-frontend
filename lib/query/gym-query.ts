import { useQuery, useMutation } from '@tanstack/react-query'
import { apiGet, apiPost } from "@/lib/api/client" 
import { 
  CategoriesResponse, 
  GymStep1Payload, 
  GymStep1Response 
} from '../types/gym'
import { useGymStore } from '../store/gym-store'

// 1. Kateqoriyaları çəkmək üçün
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<CategoriesResponse>('/categories', { 
      params: { page: 1, size: 10 } 
    }),
    staleTime: 5 * 60 * 1000,
  })
}

// 2. Step 1: Zalı yaratmaq üçün
export function useCreateGymStep1() {
  const setGymId = useGymStore((state) => state.setGymId);

  return useMutation({
    mutationFn: (payload: GymStep1Payload) =>
      apiPost<GymStep1Response>('/admin/gyms/step1', payload),
    
    onSuccess: (data) => {
      if (data?.gymId) {
        setGymId(Number(data.gymId));
        console.log("Zal uğurla yaradıldı, ID Store-a yazıldı:", data.gymId);
      }
    },
    
    onError: (error: any) => {
      console.error('Gym step1 error:', error);
    },
  })
}