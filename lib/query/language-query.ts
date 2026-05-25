import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface ILanguage {
  code: string;
}

export const useLanguages = () => {
  const queryClient = useQueryClient();

  const { data: languages, isLoading, refetch } = useQuery<ILanguage[]>({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await apiRequest<{ data: ILanguage[] }>("/languages");
      // The backend returns an ApiResponse wrapper where the actual array is inside data
      return res.data || (res as unknown as ILanguage[]);
    },
  });

  const createLanguage = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest<ILanguage>("/languages", {
        method: "POST",
        body: { code: code.trim().toUpperCase() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  const deleteLanguage = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest<void>(`/languages/${code.trim().toUpperCase()}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  return {
    languages,
    isLoading,
    refetch,
    createLanguage: createLanguage.mutateAsync,
    isCreating: createLanguage.isPending,
    deleteLanguage: deleteLanguage.mutateAsync,
    isDeleting: deleteLanguage.isPending,
  };
};
