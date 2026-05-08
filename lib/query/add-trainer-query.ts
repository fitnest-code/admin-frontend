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

      // Dataları FormData-ya append edirik
      data.names.forEach((v) => formData.append("names", v));
      data.surnames.forEach((v) => formData.append("surnames", v));
      data.professionIds.forEach((v) =>
        formData.append("professionIds", String(v)),
      );

      data.emails.filter(Boolean).forEach((v) => formData.append("emails", v));
      data.phones.filter(Boolean).forEach((v) => formData.append("phones", v));

     data.photos.forEach((file) => {
  if (file instanceof File) {
    console.log("PHOTO DEBUG:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    formData.append("photos", file, file.name);
  }
});

      return apiRequest<ITrainersResponse>(`/admin/gyms/${data.id}/step2`, {
        method: "POST",
        body: formData,
        auth: true,
      });
    },
  });
};
