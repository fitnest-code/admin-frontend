import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { ITrainersResponse } from "../types/gym";

export const useGymTrainersQuery = (
  gymId: number, 
  page: number, 
  pageSize: number, 
  sortDir: string,
  options: any = {}
) => {
  return useQuery({
    queryKey: ["gym-trainers", gymId, page, pageSize, sortDir],
    queryFn: () =>
      apiGet<ITrainersResponse>(`/gyms/${gymId}/trainers`, {
        params: {
          page,
          page_size: pageSize,
          sort_dir: sortDir,
        },
      }),
    ...options
  });
};