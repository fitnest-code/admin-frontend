import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { ICategory } from "../types/categories";

export const useCategories = () => {
  const queryClient = useQueryClient();

  // 1. Siyahı
  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<ICategory[]>("/categories"),
  });

  // 2. POST (Create)
  const createCategory = useMutation({
    mutationFn: async (data: { name: string; photo: File | null; lessonTypeIds?: number[] }) => {
      const formData = new FormData();
      if (data.photo) {
        formData.append("photo", data.photo);
      } 
      const params: Record<string, any> = { name: data.name };
      if (data.lessonTypeIds && data.lessonTypeIds.length > 0) {
        params.lessonTypeIds = data.lessonTypeIds.join(",");
      }

      return apiRequest("/admin/categories", {
        method: "POST",
        body: formData,
        params, 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      refetch();
    },
  });

  // 3. PUT (Update)
  const updateCategory = useMutation({
    mutationFn: async (data: { id: number; name: string; photo: File | null; lessonTypeIds?: number[] }) => {
      const params: Record<string, any> = { name: data.name };
      if (data.lessonTypeIds && data.lessonTypeIds.length > 0) {
        params.lessonTypeIds = data.lessonTypeIds.join(",");
      }

      if (!data.photo) {
        const formData = new FormData();
        return apiRequest(`/admin/categories/${data.id}`, {
          method: "PUT",
          body: formData,
          params,
        });
      }

      const formData = new FormData();
      formData.append("photo", data.photo);

      return apiRequest(`/admin/categories/${data.id}`, {
        method: "PUT",
        body: formData,
        params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      refetch();
    },
  });

  // 4. DELETE
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      refetch();
    },
  });

  return {
    categories,
    isLoading,
    refetch,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
  };
};