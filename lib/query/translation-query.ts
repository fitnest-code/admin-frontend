import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface Translation {
  id: number;
  entityType: string;
  entityId: string;
  languageCode: string;
  fieldName: string;
  fieldValue: string;
}

export const useTranslations = (filters?: {
  entityType?: string;
  entityId?: string;
  fieldName?: string;
  languageCode?: string;
}) => {
  const queryClient = useQueryClient();

  const { data: translations = [], isLoading, refetch } = useQuery<Translation[]>({
    queryKey: ["translations", filters],
    queryFn: () => {
      const params: Record<string, any> = {};
      if (filters?.entityType) params.entityType = filters.entityType;
      if (filters?.entityId) params.entityId = filters.entityId;
      if (filters?.fieldName) params.fieldName = filters.fieldName;
      if (filters?.languageCode) params.languageCode = filters.languageCode;

      return apiRequest<Translation[]>("/admin/translations", {
        params,
      });
    },
  });

  const saveTranslation = useMutation({
    mutationFn: async (data: Omit<Translation, "id">) => {
      return apiRequest<Translation>("/admin/translations", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
  });

  const deleteTranslation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest<void>(`/admin/translations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
  });

  return {
    translations,
    isLoading,
    refetch,
    saveTranslation: saveTranslation.mutateAsync,
    deleteTranslation: deleteTranslation.mutateAsync,
  };
};
