import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { EventsListing } from '@/components/site/EventsListing'
import { getCategoryBySlug, type Category } from '@/config/categories'
import { getPlace, type Place } from '@/config/places'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { getWhenBySlug, paths, WHEN_SLUGS, type When } from '@/i18n/paths'
import { formatShortRange, overlaps, whenRange } from '@/lib/dates'
import { categoryHeading, upcomingFor, whenHeading } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'

/*
 * One route, two kinds of page under /<place>/<lang>/<events>/…
 *   …/konserler      a category page   (Turkish concerts in London)
 *   …/bu-hafta-sonu  a date page        (Turkish events in London this weekend)
 */

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

type Params = Promise<{ place: string; lang: string; category: string }>

type Resolved =
  | { kind: 'category'; place: Place; lang: Lang; category: Category }
  | { kind: 'when'; place: Place; lang: Lang; when: When }

async function resolve(params: Params): Promise<Resolved> {
  const { place: rawPlace, lang, category: raw } = await params
  const slug = decodeURIComponent(raw)
  const place = getPlace(rawPlace)
  if (!place || !isLang(lang)) notFound()
  const when = getWhenBySlug(slug)
  if (when) {
    if (WHEN_SLUGS[when.when][lang] !== slug) permanentRedirect(paths.when(place.slug, lang, when.when))
    return { kind: 'when', place, lang, when: when.when }
  }
  const found = getCategoryBySlug(slug)
  if (!found) notFound()
  // A Turkish category word on an English page (or the reverse): send to the right address.
  if (found.category.slug[lang] !== slug) permanentRedirect(paths.category(place.slug, lang, found.category))
  return { kind: 'category', place, lang, category: found.category }
}

async function eventsFor(r: Resolved) {
  const all = await upcomingFor(r.place, r.lang)
  if (r.kind === 'category') return { all, events: all.filter((e) => e.category === r.category.value) }
  const range = whenRange(r.when)
  return { all, events: all.filter((e) => overlaps({ start: e.dayStart, end: e.dayEnd }, range)), range }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const r = await resolve(params)
  const { events } = await eventsFor(r)
  const { place, lang } = r
  if (r.kind === 'when') {
    const heading = whenHeading(place, lang, r.when)
    const range = whenRange(r.when)
    const dates = formatShortRange(range.from, range.to, lang)
    return pageMetadata({
      lang,
      title: heading,
      description:
        lang === 'tr'
          ? `${heading} (${dates}): konserler, stand-up, partiler ve aile etkinlikleri, saat, mekan ve bilet bilgileriyle.`
          : `${heading} (${dates}): concerts, stand-up, parties and family events, with times, venues and tickets.`,
      path: paths.when(place.slug, lang, r.when),
      alternates: { tr: paths.when(place.slug, 'tr', r.when), en: paths.when(place.slug, 'en', r.when) },
      noindex: events.length === 0,
    })
  }
  const heading = categoryHeading(place, lang, r.category.phrase)
  return pageMetadata({
    lang,
    title: heading,
    description:
      lang === 'tr'
        ? `${heading}: tarih, mekan ve bilet bilgileriyle güncel liste.`
        : `${heading}: an up-to-date list with dates, venues and tickets.`,
    path: paths.category(place.slug, lang, r.category),
    alternates: { tr: paths.category(place.slug, 'tr', r.category), en: paths.category(place.slug, 'en', r.category) },
    noindex: events.length === 0,
  })
}

export default async function EventsSubPage({ params }: { params: Params }) {
  const r = await resolve(params)
  const { place, lang } = r
  const t = getDictionary(lang)
  const { all, events, range } = await eventsFor(r)
  const isUk = place.kind === 'country'
  const base = [
    { name: isUk ? (lang === 'tr' ? 'Birleşik Krallık' : 'UK') : place.name[lang], href: paths.home(place.slug, lang) },
    { name: t.nav.events, href: paths.events(place.slug, lang) },
  ]

  if (r.kind === 'when') {
    return (
      <EventsListing
        place={place}
        lang={lang}
        title={whenHeading(place, lang, r.when)}
        subtitle={range ? formatShortRange(range.from, range.to, lang) : undefined}
        crumbs={[...base, { name: t.when[r.when], href: paths.when(place.slug, lang, r.when) }]}
        events={events}
        allEvents={all}
        when={r.when}
      />
    )
  }

  return (
    <EventsListing
      place={place}
      lang={lang}
      title={categoryHeading(place, lang, r.category.phrase)}
      crumbs={[...base, { name: r.category.name[lang], href: paths.category(place.slug, lang, r.category) }]}
      events={events}
      allEvents={all}
      category={r.category}
    />
  )
}
