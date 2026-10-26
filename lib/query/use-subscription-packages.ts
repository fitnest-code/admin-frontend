import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

export interface PackageNameResponse {
  id: number;
  name: string;
}

export function useSubscriptionPackages() {
  return useQuery<PackageNameResponse[]>({
    queryKey: ["subscription-packages-names"],
    queryFn: async () => {
      const res = await apiGet<PackageNameResponse[] | { items?: PackageNameResponse[] }>(
        "/api/v1/admin/subscription-packages/names",
      )
      if (Array.isArray(res)) return res
      if (res && Array.isArray(res.items)) return res.items
      return []
    },
  });
}
