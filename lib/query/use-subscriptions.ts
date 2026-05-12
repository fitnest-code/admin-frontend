import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { SubPackage, PriceTier } from "../subscription-data";

export interface BackendPackageOption {
  option_id?: number;
  duration_months?: number;
  price_standard?: number;
  price_discounted?: number;
  entry_limit?: number;
  is_active?: boolean;
}

export interface BackendPackageResponse {
  package_id?: number;
  name?: string;
  is_active?: boolean;
  sort_order?: number;
  entry_limit?: number;
  benefits?: string[];
  duration_options?: BackendPackageOption[];
}

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  // 1. Get grouped packages mapped to SubPackage array
  const { data: packagesData, isLoading, refetch } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await apiRequest<BackendPackageResponse[]>("/admin/subscription-packages");
      if (!Array.isArray(res)) return [];
      
      return res.map((pkg): SubPackage => {
        const idStr = String(pkg.package_id || `temp-${Math.random()}`);
        return {
          id: idStr,
          name: pkg.name || "Bronze",
          status: pkg.is_active !== false ? "active" : "inactive",
          entryLimit: pkg.entry_limit || 12,
          services: Array.isArray(pkg.benefits) ? pkg.benefits : [],
          priceTiers: Array.isArray(pkg.duration_options) 
            ? pkg.duration_options.map((opt): PriceTier => ({
                duration: opt.duration_months ? `${opt.duration_months} ay` : "1 ay",
                price: Number(opt.price_standard) || 0,
                discountPrice: Number(opt.price_discounted) || 0,
                entryLimit: opt.entry_limit || 12,
              }))
            : [{ duration: "1 ay", price: 0, discountPrice: 0, entryLimit: 12 }]
        };
      });
    },
  });

  // 2. Get flat options (as requested by user)
  const { data: flatOptions } = useQuery({
    queryKey: ["subscription-options"],
    queryFn: () => apiRequest<any[]>("/admin/subscription-packages/options"),
  });

  // 3. Create Package with options
  const createPackage = useMutation({
    mutationFn: async (input: {
      name: string;
      status: "active" | "inactive";
      entryLimit: number;
      services: string[];
      priceTiers: PriceTier[];
    }) => {
      const payload = {
        name: input.name,
        isActive: input.status === "active",
        sortOrder: 1,
        entryLimit: input.entryLimit,
        benefits: input.services.map((s) => ({ description: s })),
        options: input.priceTiers.map((t) => {
          const durationMonths = parseInt(t.duration) || 1;
          return {
            durationMonths,
            priceStandard: t.price,
            priceDiscounted: t.discountPrice || t.price,
            entryLimit: Number(t.entryLimit) || 12,
            isActive: true,
          };
        }),
      };

      return apiRequest("/admin/subscription-packages", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-options"] });
      refetch();
    },
  });

  // 4. Update Package with options atomically
  const updatePackage = useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      status: "active" | "inactive";
      entryLimit: number;
      services: string[];
      priceTiers: PriceTier[];
    }) => {
      const payload = {
        name: input.name,
        isActive: input.status === "active",
        sortOrder: 1,
        entryLimit: input.entryLimit,
        benefits: input.services.map((s) => ({ description: s })),
        options: input.priceTiers.map((t) => {
          const durationMonths = parseInt(t.duration) || 1;
          return {
            durationMonths,
            priceStandard: t.price,
            priceDiscounted: t.discountPrice || t.price,
            entryLimit: Number(t.entryLimit) || 12,
            isActive: true,
          };
        }),
      };

      return apiRequest(`/admin/subscription-packages/${input.id}`, {
        method: "PUT",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-options"] });
      refetch();
    },
  });

  // 5. Delete Package
  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/admin/subscription-packages/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-options"] });
      refetch();
    },
  });

  // 6. Dedicated benefit POST
  const addBenefit = useMutation({
    mutationFn: async ({ packageId, description }: { packageId: string; description: string }) => {
      return apiRequest(`/admin/subscription-packages/${packageId}/benefits`, {
        method: "POST",
        params: { description },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      refetch();
    },
  });

  // 7. Dedicated benefit DELETE
  const deleteBenefit = useMutation({
    mutationFn: async ({ packageId, description }: { packageId: string; description: string }) => {
      return apiRequest(`/admin/subscription-packages/${packageId}/benefits`, {
        method: "DELETE",
        params: { description },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      refetch();
    },
  });

  return {
    packages: packagesData || [],
    flatOptions: flatOptions || [],
    isLoading,
    refetch,
    createPackage: createPackage.mutateAsync,
    updatePackage: updatePackage.mutateAsync,
    deletePackage: deletePackage.mutateAsync,
    addBenefit: addBenefit.mutateAsync,
    deleteBenefit: deleteBenefit.mutateAsync,
  };
};
