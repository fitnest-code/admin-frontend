import { NextRequest, NextResponse } from 'next/server'
import { applyAuthCookies, parseAuthPayload } from '@/lib/auth/server-tokens'

/**
 * Accepts access/refresh tokens issued for this environment and sets auth cookies.
 * Used by the production → development environment switch handoff.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = parseAuthPayload({
      access_token: body.accessToken ?? body.access_token,
      refresh_token: body.refreshToken ?? body.refresh_token,
      user: body.user,
      expires_in: body.expiresIn ?? body.expires_in,
      refresh_expires_in: body.refreshExpiresIn ?? body.refresh_expires_in,
    })

    const response = NextResponse.json(
      {
        ok: true,
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
        user: parsed.user,
      },
      { status: 200 },
    )
    applyAuthCookies(response, parsed)
    return response
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid handoff tokens' },
      { status: 400 },
    )
  }
}
