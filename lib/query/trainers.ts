import { useQuery, useMutation } from "@tanstack/react-query";
import { apiGet, apiRequest } from "@/lib/api/client";
import { ITrainer, PaginatedResponse } from "../types/gym";

export const useGymTrainersQuery = (
  gymId: number, 
  page: number, 
  pageSize: number, 
  sortDir: string,
  options: any = {}
) => {
  return useQuery({
    queryKey: ["gym-trainers", gymId, page, pageSize, sortDir],
    queryFn: () =>
      apiGet<PaginatedResponse<ITrainer>>(`/api/v2/admin/gyms/${gymId}/trainers`, {
        params: {
          page,
          pageSize,
          sortDir,
        },
      }),
    ...options
  });
};

export const useCreateTrainer = (gymId: number) => {
  return useMutation({
    mutationFn: async (data: { name: string; surname: string; professionId?: number; phone?: string; email?: string; photo?: File; lessonTypeIds?: number[] }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("surname", data.surname);
      if (data.professionId !== undefined) {
        formData.append("professionId", data.professionId.toString());
      }
      if (data.phone) formData.append("phone", data.phone);
      if (data.email) formData.append("email", data.email);
      if (data.photo) formData.append("photo", data.photo);
      if (data.lessonTypeIds && data.lessonTypeIds.length > 0) {
        data.lessonTypeIds.forEach((id) => formData.append("lessonTypeIds", id.toString()));
      }

      return apiRequest(`/admin/gyms/${gymId}/trainers`, {
        method: "POST",
        body: formData,
        auth: true,
      });
    },
  });
};

export const useUpdateTrainer = (gymId: number) => {
  return useMutation({
    mutationFn: async ({ trainerId, data }: { trainerId: number, data: { name: string; surname: string; professionId?: number; phone?: string; email?: string; photo?: File; lessonTypeIds?: number[] } }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("surname", data.surname);
      if (data.professionId !== undefined) {
        formData.append("professionId", data.professionId.toString());
      }
      if (data.phone) formData.append("phone", data.phone);
      if (data.email) formData.append("email", data.email);
      if (data.photo) formData.append("photo", data.photo);
      if (data.lessonTypeIds && data.lessonTypeIds.length > 0) {
        data.lessonTypeIds.forEach((id) => formData.append("lessonTypeIds", id.toString()));
      }

      return apiRequest(`/admin/gyms/${gymId}/trainers/${trainerId}`, {
        method: "PUT",
        body: formData,
        auth: true,
      });
    },
  });
};

export const useDeleteTrainer = (gymId: number) => {
  return useMutation({
    mutationFn: async (trainerId: number) => {
      return apiRequest(`/admin/gyms/${gymId}/trainers/${trainerId}`, {
        method: "DELETE",
        auth: true,
      });
    },
  });
};