import { readFile } from 'fs/promises'
import path from 'path'
import { getR2Object, MEDIA_PREFIX, r2Configured } from '@/lib/storage'

/*
 * gezelim.co/img/<file>: every photo is served from the site's own domain.
 * File names contain a hash of their content, so each response is cached by
 * Vercel's CDN and the browser for a year; R2 is read once per file per region.
 */

const YEAR = 'public, max-age=31536000, immutable'
const MISSING = 'public, max-age=60'

const TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

function notFound() {
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': MISSING } })
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params
  const name = parts.map(decodeURIComponent).join('/')
  if (!/^[\w\-.]+(\/[\w\-.]+)*$/.test(name) || name.includes('..')) return notFound()
  const type = TYPES[path.extname(name).toLowerCase()]
  if (!type) return notFound()

  if (r2Configured()) {
    const range = request.headers.get('range') ?? undefined
    try {
      const object = await getR2Object(`${MEDIA_PREFIX}/${name}`, range)
      if (!object.Body) return notFound()
      const headers = new Headers({
        'Content-Type': type,
        'Cache-Control': YEAR,
        'CDN-Cache-Control': YEAR,
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
      })
      if (object.ContentLength != null) headers.set('Content-Length', String(object.ContentLength))
      if (object.ETag) headers.set('ETag', object.ETag)
      if (object.ContentRange) headers.set('Content-Range', object.ContentRange)
      return new Response(object.Body.transformToWebStream(), {
        status: range && object.ContentRange ? 206 : 200,
        headers,
      })
    } catch (error) {
      const code = (error as { name?: string; $metadata?: { httpStatusCode?: number } }) ?? {}
      if (code.name === 'NoSuchKey' || code.$metadata?.httpStatusCode === 404) return notFound()
      throw error
    }
  }

  // Local development: Payload writes uploads to ./media
  try {
    const data = await readFile(path.join(process.cwd(), 'media', name))
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch {
    return notFound()
  }
}
