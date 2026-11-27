"use client";

import { useMemo } from "react";
import { useGymDetailsAdmin } from "@/lib/query/gym-query";
import type { GymCategoryChip } from "@/lib/types/category-offerings";

export function useGymCategoryChips(gymId: number) {
  const details = useGymDetailsAdmin(gymId);
  const chips = useMemo(() => {
    const out: GymCategoryChip[] = [];
    const seen = new Set<number>();
    for (const c of details.data?.mainCategories ?? []) {
      if (!c?.id || seen.has(c.id)) continue;
      seen.add(c.id);
      out.push({ categoryId: c.id, name: c.name, role: "MAIN" });
    }
    for (const c of details.data?.subCategories ?? []) {
      if (!c?.id || seen.has(c.id)) continue;
      seen.add(c.id);
      out.push({ categoryId: c.id, name: c.name, role: "SUB" });
    }
    return out;
  }, [details.data?.mainCategories, details.data?.subCategories]);

  return {
    chips,
    isLoading: details.isLoading,
    isError: details.isError,
    hasSubs: chips.some((c) => c.role === "SUB"),
  };
}
