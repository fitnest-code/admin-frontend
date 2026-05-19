import { apiDelete, apiGet, apiPost, apiPut } from "../api/client";
import { ICategory, ICreateCategoryPayload, IUpdateCategoryPayload } from "../types/categories";


export const CategoryService = {
  // 1. Siyahını gətirmək
  getAll: () => apiGet<ICategory[]>("/categories", { params: { size: 100 } }),

  // 2. Yaratmaq (POST)
  // name -> query (?name=...), photo -> body (FormData)
  create: (payload: ICreateCategoryPayload) => {
    const formData = new FormData();
    if (payload.photo) formData.append("photo", payload.photo);

    return apiPost<ICategory>("/admin/categories", formData, {
      params: { name: payload.name }
    });
  },

  // 3. Yeniləmək (PUT)
  // id -> path (/id), name -> query, photo -> body
  update: (payload: IUpdateCategoryPayload) => {
    const formData = new FormData();
    if (payload.photo) formData.append("photo", payload.photo);

    return apiPut<ICategory>(`/admin/categories/${payload.id}`, formData, {
      params: { name: payload.name }
    });
  },

  // 4. Silmək (DELETE)
  delete: (id: number) => apiDelete(`/admin/categories/${id}`)
};