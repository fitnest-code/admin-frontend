import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { ICategory } from "../types/categories";

export const useCategories = (lang: string = "AZ", page: number = 1, pageSize: number = 100) => {
  const queryClient = useQueryClient();

  // 1. Siyahı
  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories", lang, page, pageSize],
    queryFn: () => apiRequest<any>("/categories", {
      headers: {
        "Accept-Language": lang,
      },
      params: { page, size: pageSize }
    }),
  });

  // 2. POST (Create)
  const createCategory = useMutation({
    mutationFn: async (data: { name: string; photo: File | null; icon: File | null; lessonTypeIds?: number[] }) => {
      const formData = new FormData();
      if (data.photo) {
        formData.append("photo", data.photo);
      }
      if (data.icon) {
        formData.append("icon", data.icon);
      }
      const params: Record<string, any> = { 
        name: data.name
      };
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
    },
  });

  // 3. PUT (Update)
  const updateCategory = useMutation({
    mutationFn: async (data: { id: number; name: string; photo: File | null; icon: File | null; lessonTypeIds?: number[] }) => {
      const params: Record<string, any> = { 
        name: data.name
      };
      if (data.lessonTypeIds && data.lessonTypeIds.length > 0) {
        params.lessonTypeIds = data.lessonTypeIds.join(",");
      }

      const formData = new FormData();
      if (data.photo) {
        formData.append("photo", data.photo);
      }
      if (data.icon) {
        formData.append("icon", data.icon);
      }

      return apiRequest(`/admin/categories/${data.id}`, {
        method: "PUT",
        body: formData,
        params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // 4. DELETE
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData(["categories"]);

      // Optimistically update to the new value by filtering out the deleted category
      queryClient.setQueriesData({ queryKey: ["categories"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) {
          return oldData.filter((item: any) => item.id !== deletedId);
        }
        if (oldData.items && Array.isArray(oldData.items)) {
          return {
            ...oldData,
            items: oldData.items.filter((item: any) => item.id !== deletedId),
            total: Math.max(0, (oldData.total || 0) - 1)
          };
        }
        return oldData;
      });

      // Return context for rollback
      return { previousCategories };
    },
    onError: (err, newTodo, context) => {
      // If mutation fails, invalidate to restore actual state
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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