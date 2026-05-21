import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { queryKeys } from "./query-keys";

// --- Types ---

export interface LegalDocument {
  id: number;
  type: string;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocumentCreatePayload {
  type: string;
  title: string;
  content: string;
  version: string;
}

export interface LegalDocumentUpdatePayload {
  title?: string;
  content?: string;
  version?: string;
}

// --- Hooks ---

export function useLegalDocuments() {
  return useQuery({
    queryKey: queryKeys.legal.documents,
    queryFn: async () => {
      return apiGet<LegalDocument[]>("/api/v1/admin/legal/documents");
    },
  });
}

export function useCreateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LegalDocumentCreatePayload) => {
      return apiPost<LegalDocument>("/api/v1/admin/legal/documents", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.documents });
    },
  });
}

export function useUpdateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: LegalDocumentUpdatePayload }) => {
      return apiPut<LegalDocument>(`/api/v1/admin/legal/documents/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.documents });
    },
  });
}

export function useDeleteLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiDelete<void>(`/api/v1/admin/legal/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.documents });
    },
  });
}

export function useActivateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiPost<LegalDocument>(`/api/v1/admin/legal/documents/${id}/activate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.documents });
    },
  });
}

export function useDeactivateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiPost<LegalDocument>(`/api/v1/admin/legal/documents/${id}/deactivate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.documents });
    },
  });
}
