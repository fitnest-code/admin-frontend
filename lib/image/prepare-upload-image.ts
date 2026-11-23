/**
 * Client-side image prep for admin uploads (gym wizard, etc.).
 * Why: nginx proxy-body-size is ~64MB and gateway timeouts are short — raw phone
 * photos (and HEIC) routinely blow past that as multipart FormData.
 */

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
const HEIC_MIME = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'])

const EXT_OK = /\.(jpe?g|png|webp)$/i
const EXT_HEIC = /\.(heic|heif)$/i

export const MAX_SOURCE_BYTES = 50 * 1024 * 1024
/** Keep aggregate multipart under typical 64m ingress (with headroom). */
export const MAX_TOTAL_UPLOAD_BYTES = 48 * 1024 * 1024

export class ImagePrepareError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImagePrepareError'
  }
}

function sniffType(file: File): string {
  const t = (file.type || '').toLowerCase()
  if (t) return t
  const n = file.name.toLowerCase()
  if (n.endsWith('.png')) return 'image/png'
  if (n.endsWith('.webp')) return 'image/webp'
  if (n.endsWith('.heic') || n.endsWith('.heif')) return 'image/heic'
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg'
  return ''
}

function isAllowedRaster(file: File): boolean {
  const type = sniffType(file)
  if (ALLOWED_MIME.has(type)) return true
  if (EXT_OK.test(file.name) && (!type || type === 'application/octet-stream')) return true
  return false
}

function isHeic(file: File): boolean {
  const type = sniffType(file)
  return HEIC_MIME.has(type) || EXT_HEIC.test(file.name)
}

async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // Optional dep — dynamic import so builds without it still work; we add it to package.json.
    const heic2any = (await import('heic2any')).default
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.82 })
    const blob = Array.isArray(result) ? result[0] : result
    const name = file.name.replace(/\.[^/.]+$/, '.jpg')
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    throw new ImagePrepareError(
      'iPhone HEIC şəkli çevrilə bilmədi. Zəhmət olmasa JPG və ya PNG göndərin.',
    )
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new ImagePrepareError('Şəkil oxuna bilmədi. Başqa format sınayın (JPG/PNG).'))
    img.src = src
  })
}

/** Resize + JPEG compress. Falls back to original if canvas fails. */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.72,
): Promise<File> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    let { width, height } = img
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    // White fill so PNG transparency becomes JPEG-safe.
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    )
    if (!blob) return file

    // Keep compressed only when it actually helps (or we forced JPEG from HEIC/PNG).
    if (blob.size >= file.size && file.type === 'image/jpeg') return file

    const newName = file.name.replace(/\.[^/.]+$/, '.jpg')
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export type PrepareImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSourceBytes?: number
}

/**
 * Validate type/size → optional HEIC convert → compress for upload.
 */
export async function prepareUploadImage(
  file: File,
  options: PrepareImageOptions = {},
): Promise<File> {
  const maxSource = options.maxSourceBytes ?? MAX_SOURCE_BYTES
  if (file.size > maxSource) {
    throw new ImagePrepareError(`Şəkil ölçüsü max ${Math.round(maxSource / (1024 * 1024))}MB ola bilər`)
  }

  let working = file
  if (isHeic(file)) {
    working = await convertHeicToJpeg(file)
  } else if (!isAllowedRaster(file)) {
    throw new ImagePrepareError('Yalnız JPG, PNG, WEBP və ya HEIC şəkilləri qəbul olunur')
  }

  return compressImage(
    working,
    options.maxWidth ?? 1600,
    options.maxHeight ?? 1200,
    options.quality ?? 0.72,
  )
}

export function totalFileBytes(files: Array<File | null | undefined>): number {
  return files.reduce((sum, f) => sum + (f?.size ?? 0), 0)
}
