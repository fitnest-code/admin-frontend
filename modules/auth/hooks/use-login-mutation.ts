'use client'

import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { loginRequest } from '@/modules/auth/api/auth.service'
import type { LoginRequest } from '@/modules/auth/types/auth.types'

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginRequest(payload),
    onSuccess: ({ user }) => {
      setSession({ user })
    },
  })
}
