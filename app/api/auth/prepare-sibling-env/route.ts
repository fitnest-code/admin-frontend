import { NextRequest, NextResponse } from 'next/server'

const STAFF_ROLES = new Set(['ROLE_ADMIN', 'ROLE_FITNEST_STAFF'])

function normalizeRole(role: string | undefined | null): string {
  if (!role) return ''
  const trimmed = role.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('ROLE_') ? trimmed : `ROLE_${trimmed}`
}

/**
 * Ensures the signed-in staff user exists in the sibling (development) identity DB
 * with the same mobile/password/role, then returns the sibling admin URL to open.
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
        { message: 'Only Fitnest staff/admin can sync environments' },
        { status: 403 },
      )
    }

    const siblingApi = process.env.SIBLING_API_BASE_URL?.trim()
    const syncSecret = process.env.ENV_SYNC_SECRET?.trim()
    const siblingAdminUrl =
      process.env.NEXT_PUBLIC_SIBLING_ADMIN_URL?.trim() || 'https://admin-dev.fitnest.az'

    if (!siblingApi || !syncSecret) {
      return NextResponse.json(
        {
          message:
            'Sibling environment is not configured (SIBLING_API_BASE_URL / ENV_SYNC_SECRET)',
        },
        { status: 503 },
      )
    }

    const syncUrl = `${siblingApi.replace(/\/$/, '')}/api/v1/internal/env-sync/upsert-staff`
    const syncResponse = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Env-Sync-Secret': syncSecret,
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

    const payload = await syncResponse.json().catch(() => null)
    if (!syncResponse.ok) {
      return NextResponse.json(
        {
          message:
            payload?.message ||
            payload?.error?.message ||
            'Failed to sync user to development',
        },
        { status: syncResponse.status || 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      redirectUrl: `${siblingAdminUrl.replace(/\/$/, '')}/login`,
      user: payload,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected sync error' },
      { status: 500 },
    )
  }
}
