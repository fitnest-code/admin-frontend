"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/lib/api/client";
import type {
  GymCategoryAnalyticsResponse,
  GymCategoryPriceRequest,
  GymCategoryPriceRow,
  GymCategoryServiceItem,
  GymCategoryServicesRequest,
  GymCategoryWorkHour,
  GymCategoryWorkHoursRequest,
} from "@/lib/types/category-offerings";

export const categoryPricesKey = (gymId: number, categoryId: number) =>
  ["gym-category-prices", gymId, categoryId] as const;
export const categoryHoursKey = (gymId: number, categoryId: number) =>
  ["gym-category-hours", gymId, categoryId] as const;
export const categoryServicesKey = (gymId: number, categoryId: number) =>
  ["gym-category-services", gymId, categoryId] as const;
export const categoryAnalyticsKey = (
  gymId: number,
  startDate?: string,
  endDate?: string,
) => ["gym-category-analytics", gymId, startDate ?? "", endDate ?? ""] as const;

function base(gymId: number, categoryId: number) {
  return `/api/v1/admin/gyms/${gymId}/categories/${categoryId}`;
}

export function useCategoryPrices(gymId: number, categoryId: number) {
  return useQuery({
    queryKey: categoryPricesKey(gymId, categoryId),
    enabled: gymId > 0 && categoryId > 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      apiGet<GymCategoryPriceRow[]>(`${base(gymId, categoryId)}/prices`),
  });
}

export function useSaveCategoryPrice(gymId: number, categoryId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: GymCategoryPriceRequest) =>
      apiPut<GymCategoryPriceRow>(`${base(gymId, categoryId)}/prices`, body),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: categoryPricesKey(gymId, categoryId) });
    },
  });
}

export function useCategoryWorkHours(gymId: number, categoryId: number) {
  return useQuery({
    queryKey: categoryHoursKey(gymId, categoryId),
    enabled: gymId > 0 && categoryId > 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      apiGet<GymCategoryWorkHour[]>(`${base(gymId, categoryId)}/work-hours`),
  });
}

export function useSaveCategoryWorkHours(gymId: number, categoryId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: GymCategoryWorkHoursRequest) =>
      apiPut<GymCategoryWorkHour[]>(`${base(gymId, categoryId)}/work-hours`, body),
    onSuccess: (data) => {
      client.setQueryData(categoryHoursKey(gymId, categoryId), data);
    },
  });
}

export function useCategoryServices(gymId: number, categoryId: number) {
  return useQuery({
    queryKey: categoryServicesKey(gymId, categoryId),
    enabled: gymId > 0 && categoryId > 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      apiGet<GymCategoryServiceItem[]>(`${base(gymId, categoryId)}/services`),
  });
}

export function useSaveCategoryServices(gymId: number, categoryId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: GymCategoryServicesRequest) =>
      apiPut<GymCategoryServiceItem[]>(`${base(gymId, categoryId)}/services`, body),
    onSuccess: (data) => {
      client.setQueryData(categoryServicesKey(gymId, categoryId), data);
    },
  });
}

/** Analitika filters use yyyy-MM-dd; catalog expects ISO LocalDateTime. */
function toDateTimeParam(value: string | undefined, endOfDay: boolean) {
  if (!value) return undefined;
  if (value.includes("T")) return value;
  return endOfDay ? `${value}T23:59:59` : `${value}T00:00:00`;
}

export function useCategoryAnalytics(
  gymId: number,
  startDate?: string,
  endDate?: string,
) {
  const start = toDateTimeParam(startDate, false);
  const end = toDateTimeParam(endDate, true);
  return useQuery({
    queryKey: categoryAnalyticsKey(gymId, start ?? "", end ?? ""),
    enabled: gymId > 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      apiGet<GymCategoryAnalyticsResponse>(
        `/api/v2/admin/gyms/${gymId}/analytics/by-category`,
        {
          params: {
            ...(start ? { startDate: start } : {}),
            ...(end ? { endDate: end } : {}),
          },
        },
      ),
  });
}
