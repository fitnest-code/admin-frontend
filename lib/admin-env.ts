/**
 * Resolve which admin deployment this browser is on.
 * Prefer hostname at runtime — NEXT_PUBLIC_* is inlined at build time and
 * both branches can ship the same client bundle defaulting to "production".
 */
export function getAdminEnv(): 'production' | 'development' {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    if (host.startsWith('admin-dev.') || host === 'admin-dev.fitnest.az') {
      return 'development'
    }
    if (host === 'admin.fitnest.az' || host.startsWith('admin.')) {
      return 'production'
    }
  }

  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_ENV || '').toLowerCase()
  if (fromEnv === 'development') return 'development'
  return 'production'
}

export function isProductionAdmin(): boolean {
  return getAdminEnv() === 'production'
}
