import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

export interface PackageNameResponse {
  id: number;
  name: string;
}

export function useSubscriptionPackages() {
  return useQuery<PackageNameResponse[]>({
    queryKey: ["subscription-packages-names"],
    queryFn: () => apiGet("/subscription-packages/names"),
  });
}
