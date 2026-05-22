import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import { queryKeys } from "./query-keys";

// --- Types ---

export interface ContactDetails {
  email: string;
  mobileNumber: string;
}

export interface ContactDetailsUpdateRequest {
  email: string;
  mobileNumber: string;
}

// --- Hooks ---

export function useContactDetails() {
  return useQuery({
    queryKey: queryKeys.support.contactDetails,
    queryFn: async () => {
      return apiGet<ContactDetails>("/api/v1/support/contactDetails");
    },
    retry: false, // Don't retry if 404
  });
}

export function useCreateContactDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ContactDetailsUpdateRequest) => {
      return apiPost<ContactDetails>("/api/v1/admin/support/contact-details", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.contactDetails });
    },
  });
}

export function useUpdateContactDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ContactDetailsUpdateRequest) => {
      return apiPut<ContactDetails>("/api/v1/admin/support/contact-details", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.support.contactDetails });
    },
  });
}
