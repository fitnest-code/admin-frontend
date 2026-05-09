import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { ICategory } from "../types/categories";

export const useCategories = () => {
  const queryClient = useQueryClient();

  // 1. Siyahı
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<ICategory[]>("/categories"),
  });

  // 2. POST (Create)
  const createCategory = useMutation({
    mutationFn: async (data: { name: string; photo: File | null }) => {
      const formData = new FormData();
      if (data.photo) {
        formData.append("photo", data.photo);
      } 

      return apiRequest("/admin/categories", {
        method: "POST",
        body: formData,
        params: { name: data.name }, 
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  // 3. PUT (Update)
  const updateCategory = useMutation({
    mutationFn: async (data: { id: number; name: string; photo: File | null }) => {
      if (!data.photo) {
        return apiRequest(`/admin/categories/${data.id}/name`, {
          method: "PUT",
          params: { name: data.name },
        });
      }

      const formData = new FormData();
      formData.append("photo", data.photo);

      return apiRequest(`/admin/categories/${data.id}`, {
        method: "PUT",
        body: formData,
        params: { name: data.name },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  // 4. DELETE
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return {
    categories,
    isLoading,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
  };
};