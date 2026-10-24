import { NextResponse, type NextRequest } from 'next/server'
import { isPlaceSlug } from '@/config/places'
import { DEFAULT_LANG, EN_TO_FOLDER, LANG_COOKIE, TR_TO_FOLDER, isLang, type Lang } from '@/i18n/config'
import { switchLangPath } from '@/i18n/switch'

/*
 * URL rules (no database calls here, so it's cheap on every request):
 *   /                       → /uk/<saved language, default tr>          (307)
 *   /london                 → /london/<saved language>                   (307)
 *   /london/tr/etkinlikler  → served by the app's /london/tr/events folder (rewrite)
 *   /london/tr/events       → /london/tr/etkinlikler                     (308, one URL per page)
 *   /london/en/etkinlikler/konserler → /london/en/events/concerts        (308, in one hop)
 *   /london/en/organizatorler/x → /uk/en/organisers/x                    (308, site-wide pages live under /uk)
 *   any page on another host (e.g. *.vercel.app) once the site has launched → the same page
 *   on NEXT_PUBLIC_SITE_URL (308), so search engines only ever see one address
 * No redirects by IP or browser language: Google crawls from the US with no language set.
 */

const SITE_WIDE = new Set(['organisers', 'about', 'privacy'])

function canonicalHost(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (!site || process.env.VERCEL_ENV !== 'production') return null
  try {
    return new URL(site).host
  } catch {
    return null
  }
}

function redirect(request: NextRequest, pathname: string, status: 307 | 308) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url, status)
}

export function proxy(request: NextRequest) {
  const host = canonicalHost()
  if (host && request.nextUrl.host !== host) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    url.host = host
    url.port = ''
    return NextResponse.redirect(url, 308)
  }

  const parts = request.nextUrl.pathname.split('/').filter(Boolean)
  const saved = request.cookies.get(LANG_COOKIE)?.value
  const preferred: Lang = isLang(saved) ? saved : DEFAULT_LANG

  if (parts.length === 0) return redirect(request, `/uk/${preferred}`, 307)

  const [place, lang, word, ...rest] = parts
  if (!isPlaceSlug(place)) return NextResponse.next()
  if (!lang) return redirect(request, `/${place}/${preferred}`, 307)
  if (!isLang(lang) || !word) return NextResponse.next()

  if (lang === 'tr') {
    const folder = TR_TO_FOLDER[word]
    if (folder) {
      const url = request.nextUrl.clone()
      url.pathname = `/${[place, 'tr', folder, ...rest].join('/')}`
      return NextResponse.rewrite(url)
    }
    const english = EN_TO_FOLDER[word]
    if (english) return redirect(request, fixedPath(place, 'tr', english, parts), 308)
    return NextResponse.next()
  }

  // English: the URL word is the folder name already.
  if (EN_TO_FOLDER[word]) return NextResponse.next()
  const turkish = TR_TO_FOLDER[word]
  if (turkish) return redirect(request, fixedPath(place, 'en', turkish, parts), 308)
  return NextResponse.next()
}

/** The whole address in the page's language (section, category and date words), in one redirect. */
function fixedPath(place: string, lang: Lang, section: string, parts: string[]): string {
  const translated = switchLangPath(`/${parts.join('/')}`, lang)
  return SITE_WIDE.has(section) && place !== 'uk' ? translated.replace(`/${place}/`, '/uk/') : translated
}

export const config = {
  matcher: [
    '/((?!_next/|api/|admin|img/|og/|brand/|favicon\\.ico|icon\\.svg|apple-icon\\.png|sitemap\\.xml|robots\\.txt).*)',
  ],
}
