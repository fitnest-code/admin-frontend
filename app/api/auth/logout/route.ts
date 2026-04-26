import { NextRequest, NextResponse } from 'next/server'
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/cookies'
import { assertAuthEnv, buildBackendUrl, clearAuthCookies } from '@/lib/auth/server-tokens'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 })

  try {
    assertAuthEnv()
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

    if (refreshToken) {
      await fetch(buildBackendUrl('/api/v1/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      }).catch(() => null)
    }
  } catch {
    // Cookie cleanup below still runs for local logout guarantee.
  }

  clearAuthCookies(response)
  return response
}
