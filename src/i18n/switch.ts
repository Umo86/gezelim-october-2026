import { getCategoryBySlug } from '@/config/categories'
import { EN_TO_FOLDER, SEGMENTS, TR_TO_FOLDER, isLang, type Lang } from './config'
import { getWhenBySlug, WHEN_SLUGS } from './paths'

function segmentKey(word: string | undefined) {
  if (!word) return undefined
  return TR_TO_FOLDER[word] ?? EN_TO_FOLDER[word]
}

/** Same page in the other language: /london/tr/etkinlikler/konserler → /london/en/events/concerts */
export function switchLangPath(pathname: string, to: Lang): string {
  const parts = pathname.split('/').filter(Boolean)
  const place = parts[0] || 'uk'
  if (parts.length < 2 || !isLang(parts[1])) return `/${place}/${to}`
  const out = [place, to]
  const key = segmentKey(parts[2])
  if (key) {
    out.push(SEGMENTS[key][to])
    if (key === 'events' && parts[3]) {
      const found = getCategoryBySlug(parts[3])
      const when = getWhenBySlug(parts[3])
      out.push(found ? found.category.slug[to] : when ? WHEN_SLUGS[when.when][to] : parts[3])
    } else {
      out.push(...parts.slice(3))
    }
  } else {
    out.push(...parts.slice(2))
  }
  return `/${out.join('/')}`
}

/** Same section in another city. Event and organiser pages go to the city's home page. */
export function switchPlacePath(pathname: string, toPlace: string): string {
  const parts = pathname.split('/').filter(Boolean)
  const lang: Lang = isLang(parts[1]) ? parts[1] : 'tr'
  const key = segmentKey(parts[2])
  if (key === 'events') {
    return `/${[toPlace, lang, parts[2], parts[3]].filter(Boolean).join('/')}`
  }
  return `/${toPlace}/${lang}`
}
