import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiDelete, apiGet, apiPut } from '@/lib/api/client'

export type CoinTermsAdmin = {
  htmlContentAz: string
  htmlContentEn: string
  htmlContentRu: string
}

export function useCoinTerms() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['coin-terms'],
    queryFn: () => apiGet<CoinTermsAdmin>('/api/v1/admin/coins/terms'),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: CoinTermsAdmin) =>
      apiPut<CoinTermsAdmin>('/api/v1/admin/coins/terms', payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['coin-terms'], data)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete('/api/v1/admin/coins/terms'),
    onSuccess: () => {
      queryClient.setQueryData(['coin-terms'], {
        htmlContentAz: '',
        htmlContentEn: '',
        htmlContentRu: '',
      } satisfies CoinTermsAdmin)
    },
  })

  return {
    terms: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    saveTerms: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteTerms: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
