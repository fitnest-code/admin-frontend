import { apiPost } from '@/lib/api/client'
import type { AuthUser } from '@/lib/store/auth-store'
import type { LoginRequest, LoginResponse } from '@/modules/auth/types/auth.types'

function extractUser(response: LoginResponse) {
  const raw = (response.user ?? response.data?.user) as Record<string, any> | undefined
  if (!raw) return null

  const userId = raw.user_id ?? raw.userId ?? raw.id ?? ''
  const firstName = raw.first_name ?? raw.firstName ?? ''
  const lastName = raw.last_name ?? raw.lastName ?? ''

  return {
    id: String(userId),
    name: `${firstName} ${lastName}`.trim() || raw.email || 'User',
    email: raw.email ?? '',
    role: raw.role ?? '',
  } satisfies AuthUser
}

export async function loginRequest(payload: LoginRequest) {
  const response = await apiPost<LoginResponse>('/api/auth/login', payload, { auth: false })
  const user = extractUser(response)

  return { user, raw: response }
}
