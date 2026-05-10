import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api/client" 
import { 
  CategoriesResponse, 
  GymStep1Payload, 
  GymStep1Response,
  SupportedServiceResponse,
  SupportedServiceRequest,
  GymCreateStep6Request,
  GymCreateStep7Request,
  GymInfoAdminResponse,
  GymInfoUpdateRequest,
  ITrainer,
  IProfession,
  PaginatedResponse,
  TrainerRequest
} from '../types/gym'
import { useGymStore } from '../store/gym-store'
import { toast } from 'sonner'

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

// 3. Zalı silmək üçün
export function useDeleteGym() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiDelete(`/admin/gyms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    }
  });
}

// 4. Dəstəklənən xidmətləri çəkmək üçün
export function useSupportedServices(gymId?: number) {
  return useQuery({
    queryKey: ['supported-services', gymId],
    queryFn: () => apiGet<SupportedServiceResponse[]>('/admin/gyms/services', {
      params: gymId ? { gymId } : {}
    }),
  });
}

// 5. Yeni xidmət əlavə etmək üçün
export function useCreateSupportedService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupportedServiceRequest) =>
      apiPost('/admin/gyms/services', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supported-services'] });
    }
  });
}

// 6. Step 6: Abunəlik və xidmətləri aktivləşdirin
export function useCreateGymStep6() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymCreateStep6Request }) =>
      apiPost(`/admin/gyms/${id}/step6`, payload),
  });
}

// 7. Step 7: Zal admini yarat və aktivləşdir
export function useCreateGymStep7() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymCreateStep7Request }) =>
      apiPost(`/admin/gyms/${id}/step7`, payload),
  });
}

// 8. Analitik məlumatları çəkmək üçün
export function useGymAnalytics(
  gymId: number | string | null | undefined, 
  params?: {
    startDate?: string,
    endDate?: string,
    status?: string,
    sort?: string,
    page?: number,
    pageSize?: number
  }
) {
  return useQuery({
    queryKey: ['gym-analytics', gymId, params],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymAnalyticsResponse>(`/admin/gyms/${gymId}/analytics`, { params })
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 9. Zal məlumatlarını çəkmək üçün
export function useGymInfoAdmin(gymId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['gym-info', gymId],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymInfoAdminResponse>(`/admin/gyms/${gymId}/info`)
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 10. Zal məlumatlarını yeniləmək üçün
export function useUpdateGymInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymInfoUpdateRequest }) =>
      apiPut(`/admin/gyms/${id}/info`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-info', variables.id] });
      toast.success('Məlumatlar uğurla yeniləndi');
    },
    onError: () => {
      toast.error('Məlumatların yenilənməsində xəta baş verdi');
    }
  });
}

// 11. Məşqçiləri çəkmək üçün
export function useGymTrainers(gymId: number | string | null | undefined, params?: { page?: number, size?: number, sortDir?: string }) {
  return useQuery({
    queryKey: ['gym-trainers', gymId, params],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<PaginatedResponse<ITrainer>>(`/admin/gyms/${gymId}/trainers`, { params })
    },
    enabled: !!gymId,
  })
}

// 12. Yeni məşqçi əlavə etmək üçün
export function useAddTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gymId, payload }: { gymId: number, payload: TrainerRequest }) => {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('surname', payload.surname);
      formData.append('professionId', String(payload.professionId));
      formData.append('phone', payload.phone);
      formData.append('email', payload.email);
      if (payload.photo) {
        formData.append('photo', payload.photo);
      }
      return apiPost(`/admin/gyms/${gymId}/trainers`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-trainers', variables.gymId] });
      toast.success('Məşqçi uğurla əlavə edildi');
    },
    onError: () => {
      toast.error('Məşqçi əlavə edilərkən xəta baş verdi');
    }
  });
}

// 13. Məşqçi silmək üçün
export function useDeleteTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gymId, trainerId }: { gymId: number, trainerId: string | number }) => 
      apiDelete(`/admin/gyms/${gymId}/trainers/${trainerId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-trainers', variables.gymId] });
      toast.success('Məşqçi silindi');
    }
  });
}

// 14. Peşələri (Professions) çəkmək üçün
export function useProfessions() {
  return useQuery({
    queryKey: ['professions'],
    queryFn: () => apiGet<IProfession[]>('/professions'),
    staleTime: 10 * 60 * 1000,
  });
}