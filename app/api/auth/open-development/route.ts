import { NextRequest, NextResponse } from 'next/server'

const STAFF_ROLES = new Set(['ROLE_ADMIN', 'ROLE_FITNEST_STAFF'])

function normalizeRole(role: string | undefined | null): string {
  if (!role) return ''
  const trimmed = role.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('ROLE_') ? trimmed : `ROLE_${trimmed}`
}

function developmentIdentityUrl(): string | undefined {
  return (
    process.env.DEVELOPMENT_IDENTITY_URL?.trim() ||
    process.env.SIBLING_API_BASE_URL?.trim() ||
    undefined
  )
}

function staffAccessSecret(): string | undefined {
  return (
    process.env.STAFF_ACCESS_SECRET?.trim() ||
    process.env.ENV_SYNC_SECRET?.trim() ||
    undefined
  )
}

function developmentAdminUrl(): string {
  return (
    process.env.NEXT_PUBLIC_DEVELOPMENT_ADMIN_URL?.trim() ||
    process.env.NEXT_PUBLIC_SIBLING_ADMIN_URL?.trim() ||
    'https://admin-dev.fitnest.az'
  )
}

/**
 * Ensures the signed-in Fitnest staff user exists in development identity,
 * then returns the development admin login URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mobile = String(body.mobile ?? '').trim()
    const password = String(body.password ?? '')
    const role = normalizeRole(body.role)
    const firstName = body.firstName ? String(body.firstName) : undefined
    const lastName = body.lastName ? String(body.lastName) : undefined

    if (!mobile || !password) {
      return NextResponse.json({ message: 'mobile and password are required' }, { status: 400 })
    }
    if (!STAFF_ROLES.has(role)) {
      return NextResponse.json(
        { message: 'Only Fitnest staff can open the development admin' },
        { status: 403 },
      )
    }

    const identityBase = developmentIdentityUrl()
    const secret = staffAccessSecret()
    const adminUrl = developmentAdminUrl()

    if (!identityBase || !secret) {
      return NextResponse.json(
        {
          message:
            'Development access is not configured (DEVELOPMENT_IDENTITY_URL / STAFF_ACCESS_SECRET)',
        },
        { status: 503 },
      )
    }

    const ensureUrl = `${identityBase.replace(/\/$/, '')}/api/v1/internal/staff-access/ensure`
    let ensureResponse: Response
    try {
      ensureResponse = await fetch(ensureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Staff-Access-Secret': secret,
        },
        body: JSON.stringify({
          mobile,
          password,
          role,
          firstName,
          lastName,
        }),
        cache: 'no-store',
      })
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'connection failed'
      return NextResponse.json(
        { message: `Could not reach development identity: ${detail}` },
        { status: 502 },
      )
    }

    const payload = await ensureResponse.json().catch(() => null)
    if (!ensureResponse.ok) {
      return NextResponse.json(
        {
          message:
            payload?.message ||
            payload?.error?.message ||
            'Failed to prepare your development login',
        },
        { status: ensureResponse.status || 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      redirectUrl: `${adminUrl.replace(/\/$/, '')}/login`,
      user: payload,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected error opening development' },
      { status: 500 },
    )
  }
}
