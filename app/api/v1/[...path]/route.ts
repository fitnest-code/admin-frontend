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

function pickForwardHeaders(
  request: NextRequest,
  options?: { omitContentType?: boolean },
) {
  const headers = new Headers()
  headers.set('Accept', request.headers.get('accept') ?? 'application/json')

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

function sniffContentType(buffer: Buffer, pathParts: string[]): string | null {
  if (buffer.length === 0) return null

  // 1. Check magic bytes for common image formats
  if (buffer.length >= 4) {
    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png'
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'image/jpeg'
    }
    // GIF: 47 49 46 38 ('GIF8')
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return 'image/gif'
    }
    // WEBP: RIFF .... WEBP
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'image/webp'
      }
    }
  }

  // 2. Check text prefix (HTML, SVG, JSON)
  const textStart = buffer.slice(0, 500).toString('utf8').trim().toLowerCase()
  
  if (textStart.startsWith('<svg') || textStart.startsWith('<?xml') || textStart.includes('<svg')) {
    return 'image/svg+xml'
  }
  if (textStart.startsWith('<!doctype html') || textStart.startsWith('<html')) {
    return 'text/html'
  }
  if (textStart.startsWith('{') || textStart.startsWith('[')) {
    return 'application/json'
  }

  // 3. Fallback based on extension
  const lastPart = pathParts[pathParts.length - 1] || ''
  if (lastPart.endsWith('.svg')) return 'image/svg+xml'
  if (lastPart.endsWith('.png')) return 'image/png'
  if (lastPart.endsWith('.jpg') || lastPart.endsWith('.jpeg')) return 'image/jpeg'
  if (lastPart.endsWith('.gif')) return 'image/gif'
  if (lastPart.endsWith('.webp')) return 'image/webp'
  if (lastPart.endsWith('.json')) return 'application/json'

  // 4. Fallback based on folder keywords
  if (pathParts.includes('images') || pathParts.includes('image') || pathParts.includes('photo') || pathParts.includes('avatar') || pathParts.includes('cover')) {
    if (textStart.startsWith('<') || textStart.includes('svg')) {
      return 'image/svg+xml'
    }
    return 'image/png'
  }

  return null
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
      // Stream ilə birbaşa request.body ötürmək multipart boundary-ni poza bilər;
      // FormData yenidən yığılır, fetch öz boundary Content-Type yazar.
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
    }

    // Read response body as buffer to prevent corruption and allow content-type sniffing
    const arrayBuffer = await backendResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (!responseHeaders.has('content-type')) {
      const sniffed = sniffContentType(buffer, path)
      if (sniffed) {
        responseHeaders.set('content-type', sniffed)
      }
    }

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
