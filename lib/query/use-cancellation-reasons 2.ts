import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface CancelReason {
  code: string;
  label: string;
  requiresComment: boolean;
}

export function useCancellationReasons() {
  const queryClient = useQueryClient();

  const { data: reasons = [], isLoading } = useQuery<CancelReason[]>({
    queryKey: ["cancellation-reasons"],
    queryFn: () => apiRequest<CancelReason[]>("/admin/reservations/cancel-reasons"),
  });

  const { mutateAsync: createReason } = useMutation({
    mutationFn: (payload: CancelReason) =>
      apiRequest<void>("/admin/reservations/cancel-reasons", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-reasons"] });
    },
  });

  const { mutateAsync: updateReason } = useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: CancelReason }) =>
      apiRequest<void>(`/admin/reservations/cancel-reasons/${code}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-reasons"] });
    },
  });

  const { mutateAsync: deleteReason } = useMutation({
    mutationFn: (code: string) =>
      apiRequest<void>(`/admin/reservations/cancel-reasons/${code}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cancellation-reasons"] });
    },
  });

  return { reasons, isLoading, createReason, updateReason, deleteReason };
}
