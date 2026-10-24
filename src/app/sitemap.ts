import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/config/categories'
import { CITIES } from '@/config/places'
import { LANGS, type Lang } from '@/i18n/config'
import { paths, type When } from '@/i18n/paths'
import { eventDayRange, overlaps, whenRange } from '@/lib/dates'
import { toImage, type RawEvent, type RawOrganiser, type RawVenue } from '@/lib/events'
import { has } from '@/lib/localize'
import { getSitemapEntries, getUpcomingEvents } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

/*
 * One sitemap for Google, Bing and the rest: every live page in both languages,
 * each entry listing its translation (hreflang) and, for events, the poster image.
 * Sample events, empty pages and untranslated copies are left out.
 */

export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

function pair(build: (lang: Lang) => string, opts: Partial<Entry> = {}, langs: readonly Lang[] = LANGS): Entry[] {
  const languages = Object.fromEntries(langs.map((l) => [l, absoluteUrl(build(l))]))
  return langs.map((lang) => ({
    url: absoluteUrl(build(lang)),
    alternates: langs.length > 1 ? { languages } : undefined,
    ...opts,
  }))
}

const latest = (events: RawEvent[]): Date | undefined => {
  const times = events.map((e) => (e.updatedAt ? Date.parse(e.updatedAt) : 0)).filter(Boolean)
  return times.length ? new Date(Math.max(...times)) : undefined
}

// Date pages worth listing; "today" and "tomorrow" change too fast to be useful in a sitemap.
const SITEMAP_WHENS: When[] = ['weekend', 'week', 'next-week']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = [
    ...pair((l) => paths.addEvent(l), { changeFrequency: 'monthly', priority: 0.4 }),
    ...pair((l) => paths.about(l), { changeFrequency: 'monthly', priority: 0.3 }),
  ]

  try {
    const upcoming = (await getUpcomingEvents(null)).filter((e) => !e.isSample) as RawEvent[]
    const now = new Date()

    const places = [{ slug: 'uk', events: upcoming }, ...CITIES.map((c) => ({ slug: c.slug, events: upcoming.filter((e) => e.city === c.slug) }))]
    for (const place of places) {
      if (place.slug !== 'uk' && place.events.length === 0) continue
      const lastModified = latest(place.events)
      entries.push(...pair((l) => paths.home(place.slug, l), { lastModified, changeFrequency: 'daily', priority: place.slug === 'uk' ? 1 : 0.8 }))
      entries.push(...pair((l) => paths.events(place.slug, l), { lastModified, changeFrequency: 'daily', priority: 0.8 }))
      for (const when of SITEMAP_WHENS) {
        const range = whenRange(when, now)
        const inRange = place.events.filter((e) => overlaps(eventDayRange(e.startsAt, e.endsAt), range))
        if (inRange.length) {
          entries.push(...pair((l) => paths.when(place.slug, l, when), { lastModified: latest(inRange), changeFrequency: 'daily', priority: 0.7 }))
        }
      }
      for (const category of CATEGORIES) {
        const inCategory = place.events.filter((e) => e.category === category.value)
        if (inCategory.length) {
          entries.push(
            ...pair((l) => paths.category(place.slug, l, category), {
              lastModified: latest(inCategory),
              changeFrequency: 'daily',
              priority: 0.6,
            }),
          )
        }
      }
    }

    const organisers = new Set<string>()
    const venues = new Map<string, string>()
    for (const e of upcoming) {
      const o = e.organiser as RawOrganiser | null
      if (o && typeof o === 'object' && o.slug) organisers.add(o.slug)
      const v = e.venue as RawVenue | null
      if (v && typeof v === 'object' && v.slug) venues.set(v.slug, v.city)
    }
    for (const slug of organisers) {
      entries.push(...pair((l) => paths.organiser(l, slug), { changeFrequency: 'weekly', priority: 0.4 }))
    }
    for (const [slug, city] of venues) {
      entries.push(...pair((l) => paths.venue(city, l, slug), { changeFrequency: 'weekly', priority: 0.5 }))
    }

    const { events } = await getSitemapEntries()
    for (const e of events) {
      if (e.isSample || !e.slug) continue
      const langs = LANGS.filter((l) => has(e.title, l))
      if (!langs.length) continue
      const ended = e.activeUntil ? Date.parse(e.activeUntil) < Date.now() : false
      const image = toImage(e.image, 'tr', '')
      const imageUrl = image?.card ?? image?.poster
      entries.push(
        ...pair(
          (l) => paths.event(e.city, l, e.slug as string),
          {
            lastModified: e.updatedAt ? new Date(e.updatedAt) : undefined,
            changeFrequency: ended ? 'yearly' : 'weekly',
            priority: ended ? 0.2 : 0.9,
            images: imageUrl ? [absoluteUrl(imageUrl)] : undefined,
          },
          langs,
        ),
      )
    }
  } catch {
    // Database unreachable (e.g. a build without one): ship the static part,
    // with the home pages so the sitemap is never empty.
    entries.push(...pair((l) => paths.home('uk', l)), ...pair((l) => paths.events('uk', l)))
  }

  return entries
}
