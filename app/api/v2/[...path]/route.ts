import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/cookies'
import { assertAuthEnv, buildBackendUrl } from '@/lib/auth/server-tokens'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function buildTargetPath(pathParts: string[]) {
  const clean = pathParts.filter(Boolean).join('/')
  return `/api/v2/${clean}`
}

function pickForwardHeaders(
  request: NextRequest,
  options?: { omitContentType?: boolean },
) {
  const headers = new Headers()
  headers.set('Accept', request.headers.get('accept') ?? 'application/json')

  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    headers.set('Accept-Language', acceptLanguage)
  }

  if (!options?.omitContentType) {
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers.set('Content-Type', contentType)
    }
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
    const rawContentType = request.headers.get('content-type') ?? ''
    const isMultipart = rawContentType.toLowerCase().includes('multipart/form-data')

    let body: BodyInit | undefined
    let useStreamDuplex = false

    if (method === 'GET' || method === 'HEAD') {
      body = undefined
    } else if (isMultipart) {
      const incoming = await request.formData()
      const outgoing = new FormData()
      for (const [key, value] of incoming.entries()) {
        if (value instanceof File) {
          outgoing.append(key, value, value.name || 'upload.bin')
        } else {
          outgoing.append(key, value as string)
        }
      }
      body = outgoing
    } else {
      body = request.body ?? undefined
      useStreamDuplex = body != null
    }

    const forwardHeaders = pickForwardHeaders(request, {
      omitContentType: isMultipart,
    })

    const backendResponse = await fetch(targetUrl.toString(), {
      method,
      headers: forwardHeaders,
      body,
      cache: 'no-store',
      ...(useStreamDuplex ? { duplex: 'half' } : {}),
    } as RequestInit & { duplex?: string })

    const status = backendResponse.status
    if (status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const responseHeaders = new Headers()
    const responseType = backendResponse.headers.get('content-type')
    if (responseType) {
      responseHeaders.set('content-type', responseType)
      return new NextResponse(backendResponse.body, {
        status,
        headers: responseHeaders
      })
    }

    const arrayBuffer = await backendResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, { 
      status, 
      headers: responseHeaders 
    })
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
