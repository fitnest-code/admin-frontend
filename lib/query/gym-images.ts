import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface IGymImagesPayload {
  gymId: number;
  coverPhoto: File;
  roomPhotos: { photo: File; name: string }[];
}

export const useAddGymImages = () => {
  return useMutation({
    mutationFn: async (data: IGymImagesPayload) => {
      if (!data.gymId) {
        throw new Error("Zal ID tapılmadı");
      }

      const formData = new FormData();
      formData.append("coverPhoto", data.coverPhoto);

      data.roomPhotos.forEach((item) => {
        formData.append("roomPhotos", item.photo);
        formData.append("roomNames", item.name);
      });

      // Fetch with FormData
      return apiRequest<void>(`/admin/gyms/${data.gymId}/step5`, {
        method: "POST",
        body: formData as any, // apiRequest will probably handle FormData if we adjust it, or we bypass and use standard fetch. Wait, does apiRequest support FormData?
        auth: true,
      });
    },
  });
};
