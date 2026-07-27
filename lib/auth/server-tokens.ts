import { env } from '@/lib/config/env'
import { NextResponse } from 'next/server'
import { ACCESS_MAX_AGE_SEC, ACCESS_TOKEN_COOKIE, REFRESH_MAX_AGE_SEC, REFRESH_TOKEN_COOKIE } from './cookies'

const IS_PROD = process.env.NODE_ENV === 'production'

interface RawTokenResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  token?: string
  data?: {
    accessToken?: string
    access_token?: string
    refreshToken?: string
    refresh_token?: string
    token?: string
    user?: unknown
  }
  user?: unknown
  expiresIn?: number
  expires_in?: number
  refreshExpiresIn?: number
  refresh_expires_in?: number
}

export interface ParsedAuthPayload {
  accessToken: string
  refreshToken: string
  accessMaxAge: number
  refreshMaxAge: number
  user: unknown
}

export function buildBackendUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${env.apiBaseUrl}${normalized}`
}

export function parseAuthPayload(raw: RawTokenResponse): ParsedAuthPayload {
  const accessToken =
    raw.accessToken ?? raw.access_token ?? raw.token ?? raw.data?.accessToken ?? raw.data?.access_token ?? raw.data?.token
  const refreshToken = raw.refreshToken ?? raw.refresh_token ?? raw.data?.refreshToken ?? raw.data?.refresh_token

  if (!accessToken || !refreshToken) {
    throw new Error('Auth endpoint did not return access/refresh token pair.')
  }

  return {
    accessToken,
    refreshToken,
    accessMaxAge: raw.expiresIn ?? raw.expires_in ?? ACCESS_MAX_AGE_SEC,
    refreshMaxAge: raw.refreshExpiresIn ?? raw.refresh_expires_in ?? REFRESH_MAX_AGE_SEC,
    user: raw.user ?? raw.data?.user ?? null,
  }
}

export function extractApiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null) {
    if ('message' in payload) return String((payload as { message: unknown }).message)
    if ('error' in payload && typeof (payload as { error: unknown }).error === 'object' && (payload as { error: unknown }).error !== null) {
      const errorObj = (payload as { error: { message?: unknown } }).error
      if ('message' in errorObj && errorObj.message) return String(errorObj.message)
    }
  }
  return fallback
}

export function applyAuthCookies(response: NextResponse, payload: ParsedAuthPayload) {
  const secure = IS_PROD
  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: payload.accessMaxAge,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: payload.refreshMaxAge,
  })
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function assertAuthEnv() {
  if (!env.apiBaseUrl) {
    throw new Error('API_BASE_URL is required for auth proxy routes.')
  }
}

export async function requestTokenRefresh(refreshToken: string) {
  const response = await fetch(buildBackendUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload) {
    return {
      ok: false as const,
      status: response.status || 401,
      message: extractApiErrorMessage(payload, 'Token refresh failed'),
    }
  }

  try {
    const parsed = parseAuthPayload(payload)
    return { ok: true as const, payload: parsed }
  } catch (error) {
    return {
      ok: false as const,
      status: 401,
      message: error instanceof Error ? error.message : 'Token refresh parse failed',
    }
  }
}
