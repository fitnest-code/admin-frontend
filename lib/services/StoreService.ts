import { apiGet, apiPost } from "../api/client";
import {
  IStoreResponse,
  IStoreQueryParams,
  IStoreStep2Response,
  IStoreStep2Payload,
  ICreateStoreResponse,
  IStoreStep3Payload,
  IStoreStep3Response,
} from "../types/stores";

/** Boş / çox uzun / qeyri-ASCII fayl adları bəzi backend multipart parserlərini sıradan çıxarır. */
function safeCoverFilename(file: File): string {
  let name = (file.name || "").trim();
  name = name.replace(/[^\w.\-()+]/g, "_").slice(0, 120);
  const hasImageExt = /\.(jpe?g|png|gif|webp)$/i.test(name);
  if (!name || name === "." || !hasImageExt) {
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    return `store-cover.${ext}`;
  }
  return name;
}

export const StoreService = {
  getAll: (params: IStoreQueryParams) =>
    apiGet<IStoreResponse>("/admin/stores/list", { params }),

  createStep1: async (name: string, photo: File) => {
    const formData = new FormData();
    formData.append("photo", photo, safeCoverFilename(photo));

    return apiPost<ICreateStoreResponse>("/admin/stores/step1", formData, {
      params: { name: name.trim() },
    });
  },
  createStep2: async (id: number, data: IStoreStep2Payload) => {
    return apiPost<IStoreStep2Response>(`/admin/stores/${id}/step2`, data);
  },

  createStep3: async (id: number, data: IStoreStep3Payload) => {
    return apiPost<IStoreStep3Response>(`/admin/stores/${id}/step3`, data);
  },
};