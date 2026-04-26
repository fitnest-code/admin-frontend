import { apiPost } from '@/lib/api/client'
import type { AuthUser } from '@/lib/store/auth-store'
import type { LoginRequest, LoginResponse } from '@/modules/auth/types/auth.types'

function extractUser(response: LoginResponse) {
  const raw = response.user ?? response.data?.user
  if (!raw) return null

  return {
    id: String(raw.user_id),
    name: `${raw.first_name} ${raw.last_name}`.trim(),
    email: raw.email,
    role: raw.role,
  } satisfies AuthUser
}

export async function loginRequest(payload: LoginRequest) {
  const response = await apiPost<LoginResponse>('/api/auth/login', payload, { auth: false })
  const user = extractUser(response)

  return { user, raw: response }
}
