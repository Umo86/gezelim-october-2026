import { after } from 'next/server'
import { getCategory } from '@/config/categories'
import { LANGS } from '@/i18n/config'
import { paths } from '@/i18n/paths'
import { absoluteUrl, isProductionSite, siteUrl } from './site'

/*
 * IndexNow tells Bing, Yandex, Seznam, Naver and others the moment a page
 * changes, instead of waiting for them to crawl. (Google doesn't take part;
 * it finds changes through the sitemap and Search Console.)
 * Set INDEXNOW_KEY to any 32-character hex string; the key is served at /indexnow-key.txt.
 */

export async function pingIndexNow(pathsOrUrls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  if (!key || !isProductionSite() || pathsOrUrls.length === 0) return
  const urlList = [...new Set(pathsOrUrls.map((p) => absoluteUrl(p)))].slice(0, 10000)
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(siteUrl()).host,
        key,
        keyLocation: absoluteUrl('/indexnow-key.txt'),
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Search engines will still find the change through the sitemap.
  }
}

/** Runs after the response is sent when possible, so editors never wait for it. */
export function notifySearchEngines(pathsOrUrls: string[]): void {
  try {
    after(() => pingIndexNow(pathsOrUrls))
  } catch {
    void pingIndexNow(pathsOrUrls)
  }
}

type EventLike = {
  slug?: string | null
  city?: string | null
  category?: string | null
  venue?: number | { slug?: string | null; city?: string | null } | null
}

/** Every public page that changes when this event is published, edited or removed. */
export function pagesForEvent(doc: EventLike): string[] {
  if (!doc.slug || !doc.city) return []
  const category = getCategory(doc.category)
  const venue = doc.venue && typeof doc.venue === 'object' ? doc.venue : null
  const out: string[] = []
  for (const lang of LANGS) {
    out.push(paths.event(doc.city, lang, doc.slug))
    out.push(paths.home(doc.city, lang), paths.events(doc.city, lang))
    out.push(paths.home('uk', lang), paths.events('uk', lang))
    if (category) out.push(paths.category(doc.city, lang, category), paths.category('uk', lang, category))
    if (venue?.slug) out.push(paths.venue(venue.city || doc.city, lang, venue.slug))
  }
  return out
}
