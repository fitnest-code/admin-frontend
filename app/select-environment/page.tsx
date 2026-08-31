'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FlaskConical, Loader2, Rocket, Shield } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'

const STAFF_ROLES = new Set(['ROLE_ADMIN', 'ROLE_FITNEST_STAFF', 'ADMIN', 'FITNEST_STAFF'])

function isStaffRole(role: string | undefined | null): boolean {
  if (!role) return false
  const normalized = role.startsWith('ROLE_') ? role : `ROLE_${role}`
  return STAFF_ROLES.has(normalized) || STAFF_ROLES.has(role)
}

function SelectEnvironmentInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const [error, setError] = useState<string | null>(null)
  const [loadingEnv, setLoadingEnv] = useState<'production' | 'development' | null>(null)

  const from = searchParams.get('from') ?? '/'
  const adminEnv = (process.env.NEXT_PUBLIC_ADMIN_ENV || 'production').toLowerCase()
  const showPicker = adminEnv === 'production' && isStaffRole(user?.role)

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }
    // Gym admins / non-staff, or already on development deploy → skip picker
    if (!showPicker) {
      window.location.assign(from)
    }
  }, [user, showPicker, from, router])

  async function chooseProduction() {
    setError(null)
    setLoadingEnv('production')
    window.location.assign(from)
  }

  async function chooseDevelopment() {
    setError(null)
    setLoadingEnv('development')

    const mobile = sessionStorage.getItem('fn_dev_switch_mobile')
      || sessionStorage.getItem('fn_env_mobile')
      || ''
    const password = sessionStorage.getItem('fn_dev_switch_password')
      || sessionStorage.getItem('fn_env_password')
      || ''

    if (!mobile || !password) {
      setError('Sessiya məlumatı tapılmadı. Yenidən daxil olun.')
      setLoadingEnv(null)
      return
    }

    try {
      const nameParts = (user?.name || '').trim().split(/\s+/)
      const res = await fetch('/api/auth/open-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          password,
          role: user?.role,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.slice(1).join(' ') || undefined,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || 'Development mühitinə keçid alınmadı')
      }

      sessionStorage.removeItem('fn_dev_switch_mobile')
      sessionStorage.removeItem('fn_dev_switch_password')
      sessionStorage.removeItem('fn_env_mobile')
      sessionStorage.removeItem('fn_env_password')
      window.location.assign(data.redirectUrl || 'https://admin-dev.fitnest.az/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi')
      setLoadingEnv(null)
    }
  }

  if (!user || !showPicker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex bg-background">
      <div className="hidden lg:flex w-[40%] flex-col justify-between bg-[#0A1628] p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#00B4CC]/10 blur-3xl" />
        </div>
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B4CC]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FitNest</span>
        </div>
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex self-start rounded-full border border-[#00B4CC]/30 bg-[#00B4CC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00B4CC]">
            Environment
          </span>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Hansı mühitə<br />daxil olmaq istəyirsiniz?
          </h1>
          <p className="max-w-sm text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Salam {user.name}. Production canlı məlumatlardır; Development test mühitidir.
          </p>
        </div>
        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          &copy; {new Date().getFullYear()} FitNest
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="lg:hidden flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-foreground">Mühit seçin</h2>
            <p className="text-sm text-muted-foreground">Salam {user.name}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={loadingEnv !== null}
              onClick={chooseProduction}
              className={cn(
                'group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-[#00B4CC] hover:shadow-lg hover:shadow-[#00B4CC]/10 disabled:opacity-60',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                {loadingEnv === 'production' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Rocket className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-foreground">Production</span>
                <span className="text-sm text-muted-foreground">
                  Canlı admin panel — admin.fitnest.az
                </span>
              </div>
            </button>

            <button
              type="button"
              disabled={loadingEnv !== null}
              onClick={chooseDevelopment}
              className={cn(
                'group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-[#00B4CC] hover:shadow-lg hover:shadow-[#00B4CC]/10 disabled:opacity-60',
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
                {loadingEnv === 'development' ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <FlaskConical className="h-6 w-6" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-foreground">Development</span>
                <span className="text-sm text-muted-foreground">
                  Test mühiti — admin-dev.fitnest.az
                </span>
              </div>
            </button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function SelectEnvironmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
        </div>
      }
    >
      <SelectEnvironmentInner />
    </Suspense>
  )
}
