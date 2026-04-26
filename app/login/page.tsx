'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import { useLoginMutation } from '@/modules/auth'
import { cn } from '@/lib/utils'

// ── Inner component — needs useSearchParams, must be inside Suspense ──────────
function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [mobile,   setMobile]   = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const loginMutation = useLoginMutation()
  const loading = loginMutation.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!mobile.trim() || !password.trim()) {
      setError('Mobil nömrə və şifrə boş ola bilməz.')
      return
    }

    try {
      await loginMutation.mutateAsync({ mobile: mobile.trim(), password: password.trim() })

      const from = searchParams.get('from') ?? '/'
      router.replace(from)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Mobil nömrə və ya şifrə yanlışdır.')
        } else if (err.status === 429) {
          setError('Çox sayda giriş cəhdi var. Bir az sonra yenidən yoxlayın.')
        } else {
          setError(err.message || 'Giriş zamanı xəta baş verdi. Yenidən cəhd edin.')
        }
      } else {
        setError('Giriş zamanı xəta baş verdi. Yenidən cəhd edin.')
      }
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00B4CC]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-foreground">FitNest</span>
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold text-foreground">Hesabınıza daxil olun</h2>
        <p className="text-sm text-muted-foreground">Mobil nömrə və şifrənizi daxil edin</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobil nömrə</label>
          <input
            id="mobile"
            type="tel"
            autoComplete="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="0500000000"
            className={cn(
              'h-11 rounded-xl border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground',
              error ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-[#00B4CC]',
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">Şifrə</label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={cn(
                'h-11 w-full rounded-xl border bg-background pl-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                error ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-[#00B4CC]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPwd ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00B4CC] text-sm font-semibold text-white transition-colors hover:bg-[#008799] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Giriş edilir...
            </>
          ) : 'Daxil ol'}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Giriş problemləri üçün sistem administratoru ilə əlaqə saxlayın.
      </p>
    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0A1628] p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00B4CC]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#00B4CC]/8 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B4CC]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FitNest</span>
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center self-start rounded-full border border-[#00B4CC]/30 bg-[#00B4CC]/10 px-3 py-1 text-xs font-semibold text-[#00B4CC] tracking-wide uppercase">
              Admin Panel
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight text-balance">
              FitNest-ə<br />xoş gəlmisiniz
            </h1>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Zalları, abunəlikləri, müştəriləri və ödənişləri bir platformadan idarə edin.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: '240+', label: 'Aktiv zal'        },
              { value: '18K',  label: 'Müştəri'          },
              { value: '99%',  label: 'Sistem işləkliyi' },
              { value: '24/7', label: 'Dəstək'           },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
                <span className="text-2xl font-bold text-white">{s.value}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          &copy; {new Date().getFullYear()} FitNest. Bütün hüquqlar qorunur.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Suspense fallback={<div className="h-11 w-full max-w-md animate-pulse rounded-xl bg-secondary" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
