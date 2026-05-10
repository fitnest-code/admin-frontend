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
  TrainerRequest,
  GymSubscriptionsAdminResponse,
  GymAnalyticsResponse
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

// 5.1 Xidməti silmək üçün
export function useDeleteSupportedService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/admin/gyms/services/${id}`),
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

// 6.1 Abunəlikləri yeniləyin (DRAFT statusunda olmayan zallar üçün)
export function useUpdateGymSubscriptions() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymCreateStep6Request }) =>
      apiPut(`/admin/gyms/${id}/subscriptions`, payload),
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
    queryKey: ['gym-analytics', gymId ? Number(gymId) : null, params],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymAnalyticsResponse>(`/admin/gyms/${gymId}/analytics`, { params })
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 9. Zal məlumatlarını çəkmək üçün (Admin)
export function useGymDetailsAdmin(gymId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['gym-details', gymId ? Number(gymId) : null],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymInfoAdminResponse>(`/admin/gyms/${gymId}/details`)
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 9.1 Zal abunəliklərini çəkmək üçün (Admin)
export function useGymSubscriptionsAdmin(gymId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['gym-subscriptions-admin', gymId ? Number(gymId) : null],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymSubscriptionsAdminResponse>(`/admin/gyms/${gymId}/subscriptions`)
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 10. Zal məlumatlarını yeniləmək üçün
export function useUpdateGymDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymInfoUpdateRequest }) =>
      apiPut(`/admin/gyms/${id}/details`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
      toast.success('Məlumatlar uğurla yeniləndi');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Məlumatların yenilənməsində xəta baş verdi');
    }
  });
}

// 11. Məşqçiləri çəkmək üçün
export function useGymTrainers(gymId: number | string | null | undefined, params?: { page?: number, pageSize?: number, sort_dir?: string }, initialData?: any) {
  const normalizedParams = {
    ...params,
    sort_dir: params?.sort_dir?.toUpperCase() || 'DESC'
  };

  return useQuery({
    queryKey: ['gym-trainers', gymId ? Number(gymId) : null, normalizedParams],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<PaginatedResponse<ITrainer>>(`/admin/gyms/${gymId}/trainers`, { params: normalizedParams })
    },
    enabled: !!gymId,
    initialData: initialData
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
    onError: (err: any) => {
      toast.error(err?.message || 'Məşqçi əlavə edilərkən xəta baş verdi');
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

// 15. Zal adminlərini çəkmək üçün
export function useGymAdmins(gymId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['gym-admins', gymId ? Number(gymId) : null],
    queryFn: () => {
      if (!gymId) return Promise.resolve([])
      return apiGet<any[]>(`/admin/gyms/${gymId}/admins`)
    },
    enabled: !!gymId,
  })
}

// 16. Zal admini əlavə etmək üçün
export function useAddGymAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, payload }: { gymId: number, payload: any }) =>
      apiPost(`/admin/gyms/${gymId}/admins`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-admins', variables.gymId] });
      toast.success('Admin uğurla əlavə edildi');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Xəta baş verdi');
    }
  });
}

// 17. Zal admini silmək üçün
export function useDeleteGymAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, adminId }: { gymId: number, adminId: number }) =>
      apiDelete(`/admin/gyms/${gymId}/admins/${adminId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-admins', variables.gymId] });
      toast.success('Admin silindi');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Silinmə zamanı xəta baş verdi');
    }
  });
}

// 18. Zal rəylərini çəkmək üçün
export function useGymReviews(gymId: number | string | null | undefined, params?: { status?: string, page?: number, pageSize?: number, sort?: string }) {
  return useQuery({
    queryKey: ['gym-reviews', gymId, params],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())
      if (params?.sort) searchParams.append('sort', params.sort)
      
      return apiGet<any>(`/admin/gyms/${gymId}/reviews?${searchParams.toString()}`)
    },
    enabled: !!gymId,
  })
}

// 19. Rəy detallarını çəkmək üçün
export function useReviewDetail(reviewId: number | string | null) {
  return useQuery({
    queryKey: ['review-detail', reviewId],
    queryFn: () => {
      if (!reviewId) return Promise.resolve(null)
      return apiGet<any>(`/admin/gyms/reviews/${reviewId}`)
    },
    enabled: !!reviewId,
  })
}

// 20. Rəyi təsdiqləmək üçün
export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number | string) =>
      apiPost(`/admin/gyms/reviews/${reviewId}/approve`, {}),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-detail', reviewId] });
      toast.success('Rəy təsdiq edildi');
    },
  });
}

// 21. Rəyi rədd etmək üçün
export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number | string) =>
      apiPost(`/admin/gyms/reviews/${reviewId}/reject`, {}),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-detail', reviewId] });
      toast.success('Rəy rədd edildi');
    },
  });
}