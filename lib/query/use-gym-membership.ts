"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiGet, apiPut } from "@/lib/api/client";
import { useI18nStore } from "@/lib/i18n";
import type {
  MembershipPolicy,
  PolicyUpdate,
  PrimaryGymStatus,
  SubscriberPage,
  MembershipQuote,
} from "@/lib/types/membership";

export const membershipKey = (gymId: number) =>
  ["gym-membership-v4", gymId] as const;
export function useMembershipPolicy(gymId: number) {
  return useQuery({
    queryKey: membershipKey(gymId),
    enabled: gymId > 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        return await apiGet<MembershipPolicy>(
          `/api/v4/admin/gyms/${gymId}/membership-policy`,
        );
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });
}
export function useSaveMembership(gymId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (update: PolicyUpdate) =>
      apiPut<MembershipPolicy>(
        `/api/v4/admin/gyms/${gymId}/membership-policy`,
        update,
      ),
    onSuccess: (data) => {
      client.setQueryData(membershipKey(gymId), data);
      client.invalidateQueries({ queryKey: ["primary-gym-v4"] });
      client.invalidateQueries({ queryKey: ["primary-subscribers-v4", gymId] });
    },
  });
}
export function usePrimarySubscribers(
  gymId: number,
  search: string,
  page: number,
  enabled: boolean,
  affectedIds: number[],
) {
  const locale = useI18nStore((s) => s.locale);
  return useQuery({
    queryKey: [
      "primary-subscribers-v4",
      gymId,
      search,
      [...affectedIds].sort().join(","),
      locale,
    ],
    enabled,
    retry: false,
    queryFn: async ({ signal }) => {
      const rows: SubscriberPage["content"] = [];
      let serverPage = 0;
      let total = 0;
      do {
        const result = await apiGet<SubscriberPage>(
          `/api/v4/admin/gyms/${gymId}/primary-subscribers`,
          { signal, params: { q: search, page: serverPage, size: 100 } },
        );
        rows.push(
          ...result.content.filter((s) => affectedIds.includes(s.packageId)),
        );
        total = result.total;
        serverPage++;
        if (!result.content.length) break;
      } while (serverPage * 100 < total);
      return [...new Map(rows.map((s) => [s.subscriptionId, s])).values()];
    },
    select: (rows) => ({
      content: rows.slice(page * 10, (page + 1) * 10),
      total: rows.length,
      page,
      size: 10,
    }),
  });
}
export function usePrimaryGym(userId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["primary-gym-v4", userId],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        return await apiGet<PrimaryGymStatus>(
          `/api/v4/admin/users/${userId}/primary-gym`,
        );
      } catch (e) {
        if (
          e instanceof ApiError &&
          e.status === 409 &&
          errorCode(e) === "NO_ACTIVE_SUBSCRIPTION"
        )
          return null;
        throw e;
      }
    },
  });
}
export function useChangePrimaryGym(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (gymId: number) =>
      apiPut<PrimaryGymStatus>(`/api/v4/admin/users/${userId}/primary-gym`, {
        gymId,
      }),
    onSuccess: (data) => {
      client.setQueryData(["primary-gym-v4", userId], data);
      client.invalidateQueries({ queryKey: ["primary-subscribers-v4"] });
    },
  });
}
export function useMembershipQuote(gymId: number | null, packageId: number) {
  return useQuery({
    queryKey: ["membership-quote-v4", gymId, packageId],
    enabled: !!gymId && packageId > 0,
    retry: false,
    staleTime: 0,
    queryFn: () =>
      apiGet<MembershipQuote>(`/api/v4/gyms/${gymId}/membership-quote`, {
        params: { packageId },
      }),
  });
}
export function errorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.payload as {
    error?: { code?: string };
    code?: string;
  } | null;
  return body?.error?.code ?? body?.code ?? null;
}
