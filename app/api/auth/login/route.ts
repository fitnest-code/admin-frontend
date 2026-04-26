import { NextRequest, NextResponse } from 'next/server'
import {
  applyAuthCookies,
  assertAuthEnv,
  buildBackendUrl,
  extractApiErrorMessage,
  parseAuthPayload,
} from '@/lib/auth/server-tokens'

export async function POST(request: NextRequest) {
  try {
    assertAuthEnv()
    const credentials = await request.json()

    const backendResponse = await fetch(buildBackendUrl('/api/v1/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    })

    const payload = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok || !payload) {
      return NextResponse.json(
        { message: extractApiErrorMessage(payload, 'Login failed') },
        { status: backendResponse.status || 401 },
      )
    }

    const parsed = parseAuthPayload(payload)
    const response = NextResponse.json(
      {
        access_token: parsed.accessToken,
        user: parsed.user,
      },
      { status: 200 },
    )
    applyAuthCookies(response, parsed)
    return response
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected auth error' },
      { status: 500 },
    )
  }
}
