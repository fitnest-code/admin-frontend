'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/query-keys'
import {
  getAdminGyms,
  getGymById,
  getGymLocation,
  getGymQr,
  getGymReservationRules,
  getGymReviews,
  getGyms,
  getGymTrainers,
  toggleGymStatus,
} from '@/modules/gyms/api/gyms.service'
import type { GetAdminGymsParams, GetGymsParams } from '@/modules/gyms/types/gym.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
export function useToggleGymStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => 
      toggleGymStatus(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gyms.all })
    },
    onError: (error: any) => {
      console.error(error)
    }
  })
}

export function useAdminGymsQuery(params?: GetAdminGymsParams) {
  return useQuery({
    queryKey: queryKeys.gyms.list(params as Record<string, unknown> | undefined),
    queryFn: () => getAdminGyms(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymsQuery(params?: GetGymsParams) {
  return useQuery({
    queryKey: queryKeys.gyms.list(params as Record<string, unknown> | undefined),
    queryFn: () => getGyms(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.gyms.byId(id),
    queryFn: () => getGymById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymTrainersQuery(id: string, params?: { page?: number; page_size?: number; sort_dir?: 'ASC' | 'DESC' }) {
  return useQuery({
    queryKey: ['gyms', id, 'trainers', params ?? {}],
    queryFn: () => getGymTrainers(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymReviewsQuery(id: string, params?: { page?: number; page_size?: number; sort?: string }) {
  return useQuery({
    queryKey: ['gyms', id, 'reviews', params ?? {}],
    queryFn: () => getGymReviews(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymQrQuery(id: string) {
  return useQuery({
    queryKey: ['gyms', id, 'qr'],
    queryFn: () => getGymQr(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymLocationQuery(id: string) {
  return useQuery({
    queryKey: ['gyms', id, 'location'],
    queryFn: () => getGymLocation(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymReservationRulesQuery(id: string) {
  return useQuery({
    queryKey: ['gyms', id, 'reservation-rules'],
    queryFn: () => getGymReservationRules(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
