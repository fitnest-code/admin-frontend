import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './lib/auth/cookies'

const PUBLIC_PATHS = ['/login', '/select-environment']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  // Public routes — login-ə giriş icazəsi
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isSelectEnv = pathname.startsWith('/select-environment')

  if (!accessToken && !refreshToken && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // select-environment requires auth cookies
  if (isSelectEnv && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((accessToken || refreshToken) && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
