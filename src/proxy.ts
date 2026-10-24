import { NextResponse, type NextRequest } from 'next/server'
import { isPlaceSlug } from '@/config/places'
import { DEFAULT_LANG, EN_TO_FOLDER, LANG_COOKIE, SEGMENTS, TR_TO_FOLDER, isLang, type Lang } from '@/i18n/config'

/*
 * URL rules (no database calls here, so it's cheap on every request):
 *   /                       → /uk/<saved language, default tr>          (307)
 *   /london                 → /london/<saved language>                   (307)
 *   /london/tr/etkinlikler  → served by the app's /london/tr/events folder (rewrite)
 *   /london/tr/events       → /london/tr/etkinlikler                     (308, one URL per page)
 *   /london/en/etkinlikler  → /london/en/events                          (308)
 * No redirects by IP or browser language: Google crawls from the US with no language set.
 */

function redirect(request: NextRequest, pathname: string, status: 307 | 308) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url, status)
}

export function proxy(request: NextRequest) {
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
    if (english) return redirect(request, `/${[place, 'tr', SEGMENTS[english].tr, ...rest].join('/')}`, 308)
    return NextResponse.next()
  }

  // English: the URL word is the folder name already.
  if (EN_TO_FOLDER[word]) return NextResponse.next()
  const turkish = TR_TO_FOLDER[word]
  if (turkish) return redirect(request, `/${[place, 'en', SEGMENTS[turkish].en, ...rest].join('/')}`, 308)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/|api/|admin|img/|og/|brand/|favicon\\.ico|icon\\.svg|apple-icon\\.png|sitemap\\.xml|robots\\.txt).*)',
  ],
}
