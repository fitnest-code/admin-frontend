import { useMutation, useQuery } from '@tanstack/react-query'
import { apiRequest, apiGet } from '@/lib/api/client'
import { ITrainerPayload, IProfession } from '../types/gym'

// Ixtisaslar (Professions) Query
export const useProfessionsQuery = () => {
  return useQuery({
    queryKey: ['professions'],
    queryFn: () => apiGet<IProfession[]>('/professions'),
  })
}

// Add Trainer Mutation
export const useAddTrainer = () => {
  return useMutation({
    mutationFn: async (data: ITrainerPayload) => {
      if (!data.gymId) {
        throw new Error('Zal ID tapılmadı (Step 1 tamamlanmayıb)')
      }

      // Swagger-də names, surnames və s. query parameter kimi göründüyü üçün:
      const params = new URLSearchParams()
      data.names.forEach((v) => params.append('names', v))
      data.surnames.forEach((v) => params.append('surnames', v))
      data.professionIds.forEach((v) => params.append('professionIds', String(v)))
      data.emails.filter(Boolean).forEach((v) => params.append('emails', v))
      data.phones.filter(Boolean).forEach((v) => params.append('phones', v))

      // Şəkillər isə Multipart (Body) olaraq göndərilməlidir
      const formData = new FormData()
      data.photos.forEach((file) => formData.append('photos', file))

      // API: /admin/gyms/{id}/step2?names=...&surnames=...
      return apiRequest(
        `/admin/gyms/${data.gymId}/step2?${params.toString()}`,
        {
          method: 'POST',
          body: formData, // Şəkillər Body-də
          auth: true,
        }
      )
    },
  })
}