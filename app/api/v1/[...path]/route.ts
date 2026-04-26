import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/cookies'
import { assertAuthEnv, buildBackendUrl } from '@/lib/auth/server-tokens'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function buildTargetPath(pathParts: string[]) {
  const clean = pathParts.filter(Boolean).join('/')
  return `/api/v1/${clean}`
}

function pickForwardHeaders(request: NextRequest) {
  const headers = new Headers()
  headers.set('Accept', request.headers.get('accept') ?? 'application/json')

  const contentType = request.headers.get('content-type')
  if (contentType) {
    headers.set('Content-Type', contentType)
  }

  const authorization =
    request.headers.get('authorization') ??
    (() => {
      const accessFromCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
      if (!accessFromCookie) return null
      return `Bearer ${accessFromCookie}`
    })()

  if (authorization) {
    headers.set('Authorization', authorization)
  }

  return headers
}

async function forward(request: NextRequest, context: RouteContext) {
  try {
    assertAuthEnv()
    const { path } = await context.params
    const targetPath = buildTargetPath(path)

    const targetUrl = new URL(buildBackendUrl(targetPath))
    targetUrl.search = request.nextUrl.search

    const method = request.method.toUpperCase()
    const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text()

    const backendResponse = await fetch(targetUrl.toString(), {
      method,
      headers: pickForwardHeaders(request),
      body,
      cache: 'no-store',
    })

    const responseBody = await backendResponse.text()
    const response = new NextResponse(responseBody, { status: backendResponse.status })

    const responseType = backendResponse.headers.get('content-type')
    if (responseType) {
      response.headers.set('content-type', responseType)
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Proxy error' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return forward(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return forward(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return forward(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context)
}
