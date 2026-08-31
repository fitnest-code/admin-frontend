'use client'

import { Suspense, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore, type AuthUser } from '@/lib/store/auth-store'

function toAuthUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') return null
  const user = raw as Record<string, unknown>
  const userId = user.user_id ?? user.userId ?? user.id
  if (userId == null || userId === '') return null
  const firstName = String(user.first_name ?? user.firstName ?? '')
  const lastName = String(user.last_name ?? user.lastName ?? '')
  return {
    id: String(userId),
    name: `${firstName} ${lastName}`.trim() || String(user.email ?? user.mobile ?? 'User'),
    email: String(user.email ?? ''),
    role: String(user.role ?? ''),
  }
}

function AcceptHandoffInner() {
  const setSession = useAuthStore((s) => s.setSession)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash
        if (!hash) {
          throw new Error('Giriş məlumatı tapılmadı')
        }

        const params = new URLSearchParams(hash)
        const packed = params.get('p')
        let accessToken = params.get('access_token') || params.get('a') || ''
        let refreshToken = params.get('refresh_token') || params.get('r') || ''
        let user: unknown = null

        if (packed) {
          const decoded = JSON.parse(atob(packed.replace(/-/g, '+').replace(/_/g, '/')))
          accessToken = String(decoded.access_token ?? decoded.accessToken ?? '')
          refreshToken = String(decoded.refresh_token ?? decoded.refreshToken ?? '')
          user = decoded.user ?? null
        }

        if (!accessToken || !refreshToken) {
          throw new Error('Tokenlər natamamdır')
        }

        const res = await fetch('/api/auth/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            user,
          }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.message || 'Sessiya yaradıla bilmədi')
        }

        const authUser = toAuthUser(data?.user ?? user)
        if (authUser) {
          setSession({ user: authUser })
        }

        // Drop tokens from the address bar before navigating.
        window.history.replaceState(null, '', '/auth/accept')
        if (!cancelled) {
          window.location.replace('/')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Keçid uğursuz oldu')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [setSession])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <a href="/login" className="text-sm font-medium text-[#00B4CC] hover:underline">
          Yenidən daxil ol
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
      <p className="text-sm text-muted-foreground">Development mühitinə keçid edilir…</p>
    </div>
  )
}

export default function AcceptHandoffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#00B4CC]" />
        </div>
      }
    >
      <AcceptHandoffInner />
    </Suspense>
  )
}
