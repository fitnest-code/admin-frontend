import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, apiGet } from "../api/client"; // apiGet-i də əlavə etdim
import { ITrainerPayload, IProfession, ITrainersResponse } from "../types/gym";

// 1. BU HİSSƏDƏ EXPORT VARMI DEYƏ YOXLA:
export const useProfessionsQuery = () => {
  return useQuery({
    queryKey: ["professions"],
    queryFn: () => apiGet<IProfession[]>("/professions"),
  });
};

export const useAddTrainer = () => {
  return useMutation({
    mutationFn: async (data: ITrainerPayload) => {
      if (!data.id) {
        throw new Error("Zal ID tapılmadı");
      }

      const formData = new FormData();
      data.photos.forEach((file) => {
        if (file instanceof File) {
          formData.append("photos", file, file.name);
        }
      });

      return apiRequest<ITrainersResponse>(`/admin/gyms/${data.id}/step2`, {
        method: "POST",
        body: formData,
        params: {
          names: data.names,
          surnames: data.surnames,
          professionIds: data.professionIds,
          emails: data.emails,
          phones: data.phones,
          ...(data.lessonTypesPerTrainer ? { lessonTypesPerTrainer: data.lessonTypesPerTrainer } : {}),
        },
        auth: true,
      });
    },
  });
};
