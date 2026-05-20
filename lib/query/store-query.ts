import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IStoreQueryParams, IStoreStep2Payload, IStoreStep3Payload } from "../types/stores";
import { StoreService } from "../services/StoreService";
import { useI18nStore } from "../i18n";

// Siyahı üçün mövcud hook-un
export const useStores = (params: IStoreQueryParams) => {
  const locale = useI18nStore((s) => s.locale);
  return useQuery({
    queryKey: ["stores", params, locale],
    queryFn: () => StoreService.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

// Yeni mağaza yaratmaq üçün mutation hook
export const useCreateStoreStep1 = () => {
  return useMutation({
    mutationFn: ({ name, photo }: { name: string; photo: File }) => 
      StoreService.createStep1(name, photo)
  });
};


export const useCreateStoreStep2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IStoreStep2Payload }) =>
      StoreService.createStep2(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useCreateStoreStep3 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IStoreStep3Payload }) =>
      StoreService.createStep3(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => StoreService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};