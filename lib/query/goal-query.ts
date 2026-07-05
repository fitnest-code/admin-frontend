import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, apiPost } from "../api/client";

export interface IGoal {
  code: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export const useGoals = (lang: string = "AZ") => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading, refetch } = useQuery({
    queryKey: ["goals", lang],
    queryFn: async () => {
      const res = await apiRequest<{ data: IGoal[] }>("/goals", {
        headers: {
          "Accept-Language": lang,
        },
      });
      return res.data || res;
    },
  });

  const createGoal = useMutation({
    mutationFn: async (data: { code: string; title: string; subtitle?: string; image: File | null }) => {
      const formData = new FormData();
      if (data.image) {
        formData.append("image", data.image);
      }
      
      const params: Record<string, string> = {
        code: data.code,
        title: data.title,
      };
      if (data.subtitle) {
        params.subtitle = data.subtitle;
      }

      return apiRequest("/admin/goals", {
        method: "POST",
        body: formData,
        params, 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (data: { code: string; title: string; subtitle?: string; image: File | null }) => {
      const formData = new FormData();
      if (data.image) {
        formData.append("image", data.image);
      }
      
      const params: Record<string, string> = {
        title: data.title,
      };
      if (data.subtitle) {
        params.subtitle = data.subtitle;
      }

      return apiRequest(`/admin/goals/${data.code}`, {
        method: "PUT",
        body: formData,
        params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest(`/admin/goals/${code}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateTranslations = useMutation({
    mutationFn: async (payload: any[]) => {
      return apiPost<any[]>("/translations/bulk", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  return {
    goals,
    isLoading,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    updateTranslations,
  };
};
