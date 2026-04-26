import { NextRequest, NextResponse } from 'next/server'
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/cookies'
import {
  applyAuthCookies,
  assertAuthEnv,
  clearAuthCookies,
  requestTokenRefresh,
} from '@/lib/auth/server-tokens'

export async function POST(request: NextRequest) {
  try {
    assertAuthEnv()
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

    if (!refreshToken) {
      const response = NextResponse.json({ message: 'Refresh token missing' }, { status: 401 })
      clearAuthCookies(response)
      return response
    }

    const refreshResult = await requestTokenRefresh(refreshToken)
    if (!refreshResult.ok) {
      const response = NextResponse.json({ message: refreshResult.message }, { status: refreshResult.status })
      clearAuthCookies(response)
      return response
    }

    const response = NextResponse.json(
      {
        access_token: refreshResult.payload.accessToken,
        refresh_token: refreshResult.payload.refreshToken,
      },
      { status: 200 },
    )
    applyAuthCookies(response, refreshResult.payload)
    return response
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected refresh error' },
      { status: 500 },
    )
  }
}
