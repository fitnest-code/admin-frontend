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
import { useI18nStore } from '@/lib/i18n'

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
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.gyms.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getAdminGyms(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymsQuery(params?: GetGymsParams) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.gyms.list(params as Record<string, unknown> | undefined), locale],
    queryFn: () => getGyms(params),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymQuery(id: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: [...queryKeys.gyms.byId(id), locale],
    queryFn: () => getGymById(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymTrainersQuery(id: string, params?: { page?: number; page_size?: number; sort_dir?: 'ASC' | 'DESC' }) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gyms', id, 'trainers', params ?? {}, locale],
    queryFn: () => getGymTrainers(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymReviewsQuery(id: string, params?: { page?: number; page_size?: number; sort?: string }) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gyms', id, 'reviews', params ?? {}, locale],
    queryFn: () => getGymReviews(id, params),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymQrQuery(id: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gyms', id, 'qr', locale],
    queryFn: () => getGymQr(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymLocationQuery(id: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gyms', id, 'location', locale],
    queryFn: () => getGymLocation(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useGymReservationRulesQuery(id: string) {
  const locale = useI18nStore((s) => s.locale)
  return useQuery({
    queryKey: ['gyms', id, 'reservation-rules', locale],
    queryFn: () => getGymReservationRules(id),
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
