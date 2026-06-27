import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api/client" 
import { useI18nStore } from '@/lib/i18n' 
import { 
  CategoriesResponse, 
  GymStep1PayloadV2, 
  GymStep1Response,
  SupportedServiceResponse,
  SupportedServiceRequest,
  GymCreateStep6RequestV2,
  GymCreateStep7Request,
  GymInfoAdminResponseV2,
  GymInfoUpdateRequestV2,
  ITrainer,
  IProfession,
  PaginatedResponse,
  TrainerRequest,
  GymSubscriptionsAdminResponseV2,
  GymAnalyticsResponse
} from '../types/gym'
import { useGymStore } from '../store/gym-store'


// 1. Kateqoriyaları çəkmək üçün
export function useCategories() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: () => apiGet<CategoriesResponse>('/categories', { 
      params: { page: 1, size: 100 } 
    }),
    staleTime: 5 * 60 * 1000,
  })
}

// 2. Step 1: Zalı yaratmaq üçün
export function useCreateGymStep1() {
  const setGymId = useGymStore((state) => state.setGymId);

  return useMutation({
    mutationFn: (payload: GymStep1PayloadV2) =>
      apiPost<GymStep1Response>('/api/v2/admin/gyms/step1', payload),
    
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

// 2.1 Validation Hooks
export function useValidateGymStep1() {
  return useMutation({
    mutationFn: (payload: GymStep1PayloadV2) =>
      apiPost('/api/v2/admin/gyms/validate/step1', payload),
  });
}

export function useValidateGymStep2() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiPost('/admin/gyms/validate/step2', formData),
  });
}

export function useValidateGymStep3() {
  return useMutation({
    mutationFn: (payload: any) =>
      apiPost('/admin/gyms/validate/step3', payload),
  });
}

export function useValidateGymStep4() {
  return useMutation({
    mutationFn: (payload: any) =>
      apiPost('/admin/gyms/validate/step4', payload),
  });
}

export function useValidateGymStep5() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiPost('/api/v2/admin/gyms/validate/step5', formData),
  });
}

export function useValidateGymStep6() {
  return useMutation({
    mutationFn: ({ payload, serviceIcons }: { payload: GymCreateStep6RequestV2, serviceIcons?: File[] }) => {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (serviceIcons && serviceIcons.length > 0) {
        serviceIcons.forEach(file => {
          formData.append("serviceIcons", file);
        });
      }
      return apiPost('/api/v2/admin/gyms/validate/step6', formData);
    }
  });
}

export function useValidateGymStep7() {
  return useMutation({
    mutationFn: (payload: GymCreateStep7Request) =>
      apiPost('/admin/gyms/validate/step7', payload),
  });
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
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['supported-services', gymId, locale],
    queryFn: () => apiGet<SupportedServiceResponse[]>('/admin/gyms/services', {
      params: gymId ? { gymId } : {}
    }),
  });
}

// 5. Yeni xidmət əlavə etmək üçün
export function useCreateSupportedService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupportedServiceRequest | { payload: SupportedServiceRequest, icon?: File }) => {
      const formData = new FormData();
      let actualPayload: SupportedServiceRequest;
      let actualIcon: File | undefined;

      if ("payload" in payload) {
        actualPayload = (payload as any).payload;
        actualIcon = (payload as any).icon;
      } else {
        actualPayload = payload;
      }

      formData.append("data", new Blob([JSON.stringify(actualPayload)], { type: "application/json" }));
      if (actualIcon) {
        formData.append("icon", actualIcon);
      }
      return apiPost<SupportedServiceResponse>('/admin/gyms/services', formData);
    },
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
    mutationFn: ({ id, payload, serviceIcons }: { id: number, payload: GymCreateStep6RequestV2, serviceIcons?: File[] }) => {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (serviceIcons && serviceIcons.length > 0) {
        serviceIcons.forEach(file => {
          formData.append("serviceIcons", file);
        });
      }
      return apiPost(`/api/v2/admin/gyms/${id}/step6`, formData);
    }
  });
}

// 6.1 Abunəlikləri yeniləyin (DRAFT statusunda olmayan zallar üçün)
export function useUpdateGymSubscriptions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymCreateStep6RequestV2 }) =>
      apiPut(`/api/v2/admin/gyms/${id}/subscriptions`, payload),
    onSuccess: (_, variables) => {
      // Invalidate with partial key so all locale variants are refreshed
      queryClient.invalidateQueries({ queryKey: ['gym-subscriptions-admin', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    },
  });
}

// 7. Step 7: Zal admini yarat və aktivləşdir
export function useCreateGymStep7() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymCreateStep7Request }) =>
      apiPost(`/admin/gyms/${id}/step7`, payload),
  });
}

// 7.1 Complete Gym Creation (Single Request - All Steps)
export function useCreateGymComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      step1: GymStep1PayloadV2;
      step2: any; // LocalTrainer[]
      step3: any; // Step3Data
      step4: any; // Step4Data
      step5: any; // Step5Photos
      step6: GymCreateStep6RequestV2;
      step7: GymCreateStep7Request;
    }) => {
      const formData = new FormData();

      // Build combined JSON payload
      const jsonPayload = {
        // Step 1
        mainCategoryDetails: data.step1.mainCategoryDetails,
        subCategoryDetails: data.step1.subCategoryDetails,
        hasSubcategories: data.step1.hasSubcategories,
        name: data.step1.name,
        phone: data.step1.phone,
        description: data.step1.description,
        email: data.step1.email,
        lessonTypeIds: data.step1.lessonTypeIds,
        // Step 2 - trainer metadata only (photos are separate)
        trainers: data.step2.map((t: any) => ({
          name: t.name,
          surname: t.surname,
          professionId: t.professionId,
          email: t.email,
          phone: t.phone,
          lessonTypeIds: t.lessonTypeIds?.join(",") || ""
        })),
        // Step 3
        generalWorkHours: data.step3.generalWorkHours,
        workHoursWoman: data.step3.workHoursWoman,
        workHoursMan: data.step3.workHoursMan,
        restDays: data.step3.restDays,
        // Step 4
        latitude: data.step4.lat,
        longitude: data.step4.lng,
        // Step 5 - room names and category IDs (files are separate)
        roomNames: data.step5.rooms.map((r: any) => r.name),
        roomCategoryIds: data.step5.rooms.map((r: any) => r.categoryId),
        // Step 6
        subscriptions: data.step6.subscriptions,
        // Step 7
        admins: data.step7.admins
      };

      formData.append("data", new Blob([JSON.stringify(jsonPayload)], { type: "application/json" }));

      // Append cover photo
      if (data.step5.cover) {
        formData.append("coverPhoto", data.step5.cover);
      }

      // Append category covers
      if (data.step5.categoryCovers) {
        data.step5.categoryCovers.forEach((cc: any) => {
          formData.append("categoryCovers", cc.file);
          formData.append("categoryCoverCategoryIds", String(cc.categoryId));
        });
      }

      // Append trainer photos (in order matching trainers array)
      data.step2.forEach((t: any) => {
        if (t.photo) formData.append("trainerPhotos", t.photo);
      });

      // Append room photos (in order matching roomNames array)
      data.step5.rooms.forEach((r: any) => {
        formData.append("roomPhotos", r.file);
      });

      // Append service icons
      if (data.step6.serviceIcons) {
        data.step6.serviceIcons.forEach((file: File) => {
          formData.append("serviceIcons", file);
        });
      }

      const res = await apiPost<GymStep1Response>('/api/v2/admin/gyms/create-complete', formData);
      return res.gymId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    }
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
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gym-analytics', gymId ? Number(gymId) : null, params, locale],
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
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gym-details', gymId ? Number(gymId) : null, locale],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymInfoAdminResponseV2>(`/api/v2/admin/gyms/${gymId}/details`)
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 9.1 Zal abunəliklərini çəkmək üçün (Admin)
export function useGymSubscriptionsAdmin(gymId: number | string | null | undefined) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gym-subscriptions-admin', gymId ? Number(gymId) : null, locale],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<GymSubscriptionsAdminResponseV2>(`/api/v2/admin/gyms/${gymId}/subscriptions`)
    },
    enabled: !!gymId,
    staleTime: 60 * 1000,
  })
}

// 10. Zal məlumatlarını yeniləmək üçün
export function useUpdateGymDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: GymInfoUpdateRequestV2 }) =>
      apiPut(`/api/v2/admin/gyms/${id}/details`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    },
    onError: (err: any) => {
    }
  });
}

// 11. Məşqçiləri çəkmək üçün
export function useGymTrainers(gymId: number | string | null | undefined, params?: { page?: number, pageSize?: number, sort_dir?: string }, initialData?: any) {
  const normalizedParams = {
    ...params,
    sort_dir: params?.sort_dir?.toUpperCase() || 'DESC'
  };

  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gym-trainers', gymId ? Number(gymId) : null, normalizedParams, locale],
    queryFn: () => {
      if (!gymId) return Promise.resolve(null)
      return apiGet<PaginatedResponse<ITrainer>>(`/api/v2/admin/gyms/${gymId}/trainers`, { params: normalizedParams })
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
    },
    onError: (err: any) => {
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
    }
  });
}

// 14. Peşələri (Professions) çəkmək üçün
export function useProfessions() {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['professions', locale],
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
    },
  });
}

// 16.1 Zal adminini yeniləmək üçün
export function useUpdateGymAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, adminId, payload }: { gymId: number, adminId: number, payload: any }) =>
      apiPut(`/admin/gyms/${gymId}/admins/${adminId}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-admins', variables.gymId] });
    },
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
    },
  });
}

// 17.1 Zal admini şifrəsini birbaşa yeniləmək üçün
export function useResetGymAdminPassword() {
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number, payload: { newPassword: string } }) =>
      apiPost(`/admin/users/${userId}/password/reset`, payload),
  });
}

// 18. Zal rəylərini çəkmək üçün
export function useGymReviews(gymId: number | string | null | undefined, params?: { status?: string, search?: string, page?: number, pageSize?: number, sort?: string }) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-reviews', normalizedGymId, params],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve(null)
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.search) searchParams.append('search', params.search)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())
      if (params?.sort) searchParams.append('sort', params.sort)
      
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/reviews?${searchParams.toString()}`)
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
      apiPut(`/admin/gyms/reviews/${reviewId}/approve`, {}),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-detail', reviewId] });
    },
  });
}

// 21. Rəyi rədd etmək üçün
export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number | string) =>
      apiPut(`/admin/gyms/reviews/${reviewId}/reject`, {}),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['gym-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-detail', reviewId] });
    },
  });
}

// 22. Rezervasiyaları çəkmək üçün
export function useGymReservations(gymId: number | string | null | undefined, params?: { status?: string, page?: number, pageSize?: number }) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-reservations', normalizedGymId, params],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve(null)
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())
      
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/reservations?${searchParams.toString()}`)
    },
    enabled: !!gymId,
  })
}

// 23. Rezervasiya detallarını çəkmək üçün
export function useReservationDetail(reservationId: number | string | null) {
  return useQuery({
    queryKey: ['reservation-detail', reservationId],
    queryFn: () => {
      if (!reservationId) return Promise.resolve(null)
      return apiGet<any>(`/admin/gyms/reservations/${reservationId}`)
    },
    enabled: !!reservationId,
  })
}

// 24. Rezervasiya statusunu yeniləmək üçün
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reservationId, status, reason }: { reservationId: number | string, status: string, reason?: string }) => {
      const searchParams = new URLSearchParams()
      searchParams.append('status', status)
      if (reason) searchParams.append('reason', reason)
      // Note: Backend might expect PATCH, but apiPost/apiPut/apiPatch are available.
      // My backend uses @PatchMapping. I should use apiPatch if available or apiPost if it's configured to handle it.
      // Let's check api client.
      return apiPost(`/admin/gyms/reservations/${reservationId}/status?${searchParams.toString()}`, {})
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-detail', variables.reservationId] });
      queryClient.invalidateQueries({ queryKey: ['gym-reservation-stats', variables.reservationId] }); // Fixed key
    },
    onError: (err: any) => {
    }
  });
}

// 25. Rezervasiya statistikasını çəkmək üçün
export function useGymReservationStats(gymId: number | string | null | undefined) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-reservation-stats', normalizedGymId],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve(null)
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/reservations/stats`)
    },
    enabled: !!gymId,
  })
}

// 26. Dərs saatlarını çəkmək üçün
export function useGymLessonHours(
  gymId: number | string | null | undefined,
  params?: { page?: number; pageSize?: number; startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) {
  const normalizedParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
    startDate: params?.startDate || undefined,
    endDate: params?.endDate || undefined
  };

  const normalizedGymId = gymId ? Number(gymId) : null;

  return useQuery({
    queryKey: ['gym-lesson-hours', normalizedGymId, normalizedParams],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve({ items: [], total: 0, page: 1, pageSize: 10 })
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/lesson-hours`, { params: normalizedParams })
    },
    enabled: options?.enabled !== false && !!gymId,
  })
}

// 26.1 Arxiv dərs saatlarını çəkmək üçün
export function useGymLessonHoursArchive(
  gymId: number | string | null | undefined,
  params?: { page?: number; pageSize?: number },
  options?: { enabled?: boolean }
) {
  const normalizedParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 10
  };

  const normalizedGymId = gymId ? Number(gymId) : null;

  return useQuery({
    queryKey: ['gym-lesson-hours-archive', normalizedGymId, normalizedParams],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve({ items: [], total: 0, page: 1, pageSize: 10 })
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/lesson-hours/archive`, { params: normalizedParams })
    },
    enabled: options?.enabled !== false && !!gymId,
  })
}

// 27. Yeni dərs saatı əlavə etmək üçün
export function useAddLessonHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, payload }: { gymId: number, payload: any }) =>
      apiPost(`/admin/gyms/${gymId}/lesson-hours`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-lesson-hours', variables.gymId ? Number(variables.gymId) : null] });
    },
    onError: (err: any) => {
    }
  });
}

// 28. Dərs saatını silmək üçün
export function useDeleteLessonHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, lessonHourId }: { gymId: number, lessonHourId: number | string }) =>
      apiDelete(`/admin/gyms/lesson-hours/${lessonHourId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-lesson-hours', variables.gymId ? Number(variables.gymId) : null] });
    }
  });
}

// 29. Zalın dərs növlərini çəkmək üçün
export function useGymLessonTypes(gymId: number | string | null | undefined) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-lesson-types', normalizedGymId],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve([])
      return apiGet<any[]>(`/admin/reservations/gyms/${normalizedGymId}/lesson-types`)
    },
    enabled: !!gymId,
  })
}

// 30. Zalın iş saatlarını çəkmək üçün
export function useGymWorkHours(gymId: number | string | null | undefined) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-work-hours', normalizedGymId],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve(null)
      return apiGet<any>(`/admin/gyms/${normalizedGymId}/work-hours`)
    },
    enabled: !!gymId,
  })
}

// 31. Zalın iş saatlarını yeniləmək üçün
export function useUpdateGymWorkHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gymId, payload }: { gymId: number | string, payload: any }) =>
      apiPut(`/admin/gyms/${gymId}/work-hours`, payload),
    onSuccess: async (_, variables) => {
      const gymId = variables.gymId ? Number(variables.gymId) : null;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gym-work-hours', gymId] }),
      ]);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['gym-work-hours', gymId], exact: true }),
      ]);
    }
  });
}

// 32. Get gym reservation rules (direct / category / lesson rules)
export function useGymRulesQuery(gymId: number | string | null | undefined, categoryId?: number | string | null, lessonId?: number | string | null) {
  const normalizedGymId = gymId ? Number(gymId) : null;
  return useQuery({
    queryKey: ['gym-rules', normalizedGymId, categoryId ? Number(categoryId) : null, lessonId ? Number(lessonId) : null],
    queryFn: () => {
      if (!normalizedGymId) return Promise.resolve(null)
      const params = new URLSearchParams()
      if (categoryId) params.append('categoryId', categoryId.toString())
      if (lessonId) params.append('lessonId', lessonId.toString())
      return apiGet<any>(`/reservations/rules?gymId=${normalizedGymId}&${params.toString()}`)
    },
    enabled: !!gymId
  })
}

// 33. Save/Update gym rules (direct / gym-wide)
export function useUpdateGymRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ gymId, htmlContent }: { gymId: number, htmlContent: string }) =>
      apiPost(`/admin/reservations/gyms/${gymId}/rules`, { htmlContent }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-rules', variables.gymId ? Number(variables.gymId) : null] })
    },
    onError: (err: any) => {
    }
  })
}

// 34. Update gym cover photo
export function useUpdateGymCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiPost(`/admin/gyms/${id}/cover`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    }
  });
}

// 35. Add gym room photos
export function useAddGymRoomImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomNames, files }: { id: number; roomNames: string[]; files: File[] }) => {
      const formData = new FormData();
      roomNames.forEach(name => formData.append("roomNames", name));
      files.forEach(file => formData.append("files", file));
      return apiPost(`/admin/gyms/${id}/rooms`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    }
  });
}

// 36. Delete gym room by ID
export function useDeleteGymRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomId }: { id: number; roomId: number }) =>
      apiDelete(`/admin/gyms/${id}/rooms/${roomId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    }
  });
}

// 36.1 Update gym room name
export function useUpdateGymRoomName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomId, name }: { id: number; roomId: number; name: string }) =>
      apiPut(`/admin/gyms/${id}/rooms/${roomId}/name?name=${encodeURIComponent(name)}`, {}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    }
  });
}

// 36.2 Update Gym Step 5 images/covers
export function useUpdateGymStep5() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, coverPhoto, categoryCovers, categoryCoverCategoryIds, roomNames, roomCategoryIds, roomPhotos }: {
      id: number;
      coverPhoto?: File;
      categoryCovers?: File[];
      categoryCoverCategoryIds?: number[];
      roomNames?: string[];
      roomCategoryIds?: number[];
      roomPhotos?: File[];
    }) => {
      const formData = new FormData();
      if (coverPhoto) formData.append("coverPhoto", coverPhoto);
      if (categoryCovers && categoryCoverCategoryIds) {
        categoryCovers.forEach(file => formData.append("categoryCovers", file));
        categoryCoverCategoryIds.forEach(catId => formData.append("categoryCoverCategoryIds", String(catId)));
      }
      if (roomNames) roomNames.forEach(name => formData.append("roomNames", name));
      if (roomCategoryIds) roomCategoryIds.forEach(catId => formData.append("roomCategoryIds", String(catId)));
      if (roomPhotos) roomPhotos.forEach(file => formData.append("roomPhotos", file));

      return apiPost(`/api/v2/admin/gyms/${id}/step5`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-details', variables.id] });
    }
  });
}