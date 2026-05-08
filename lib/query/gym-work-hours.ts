import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { IGymWorkHoursPayload, IWorkHoursResponse } from "../types/working-hours";

export const useAddGymWorkHours = () => {
  return useMutation({
    mutationFn: async (data: IGymWorkHoursPayload) => {
      const { gymId, ...body } = data;

      if (!gymId) {
        throw new Error("Zal ID tapılmadı (Step 1 və ya 2 tamamlanmayıb)");
      }

     
      return apiRequest<IWorkHoursResponse>(`/admin/gyms/${gymId}/step3`, {
        method: "POST",
        body: body, // generalWorkHours, workHoursWoman və s. burada gedir
        auth: true,
      });
    },
  });
};

export const useValidateGymWorkHours = () => {
  return useMutation({
    mutationFn: async (data: IGymWorkHoursPayload) => {
      const { gymId, ...body } = data;

      if (!gymId) {
        throw new Error("Zal ID tapılmadı (Step 1 və ya 2 tamamlanmayıb)");
      }

      return apiRequest<IWorkHoursResponse>(`/admin/gyms/${gymId}/step3/validate`, {
        method: "POST",
        body: body,
        auth: true,
      });
    },
  });
};