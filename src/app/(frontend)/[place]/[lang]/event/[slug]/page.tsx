import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { EventDetail } from '@/components/site/EventDetail'
import { getCity, getPlace } from '@/config/places'
import { isLang, otherLang, type Lang } from '@/i18n/config'
import { paths } from '@/i18n/paths'
import { dateTile, formatDateFull } from '@/lib/dates'
import { shareImagePath, toImage, toListEvent } from '@/lib/events'
import { has, lexicalPlainText, pick, truncate } from '@/lib/localize'
import { getEventBySlug, getUpcomingEvents } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

type Params = Promise<{ place: string; lang: string; slug: string }>

async function load(params: Params) {
  const { place: rawPlace, lang, slug } = await params
  if (!getPlace(rawPlace) || !isLang(lang)) notFound()
  const raw = await getEventBySlug(decodeURIComponent(slug))
  if (!raw) notFound()
  // Events live under their own city: /uk/tr/etkinlik/x → /london/tr/etkinlik/x
  if (raw.city !== rawPlace || raw.slug !== slug) permanentRedirect(paths.event(raw.city, lang, raw.slug || slug))
  return { raw, lang: lang as Lang }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { raw, lang } = await load(params)
  const e = toListEvent(raw, lang)
  const city = getCity(raw.city)
  const tile = dateTile(e.startsAt, lang)
  const title = pick<string>(raw.metaTitle, lang) || `${e.title}, ${city?.name[lang] ?? raw.city} ${tile.day} ${tile.month}`
  const description =
    pick<string>(raw.metaDescription, lang) ||
    truncate(
      e.summary ||
        lexicalPlainText(pick(raw.description, lang)) ||
        `${formatDateFull(e.startsAt, lang)}, ${e.venueName ?? e.cityName}.`,
      160,
    )
  const translatedHere = has(raw.title, lang)
  const translatedThere = has(raw.title, otherLang(lang))
  const ended = Date.parse(e.activeUntil) < Date.now() - 183 * 24 * 3600 * 1000
  const image = toImage(raw.image, lang, e.title)
  return pageMetadata({
    lang,
    title,
    description,
    path: e.href,
    alternates: {
      ...(has(raw.title, 'tr') ? { tr: paths.event(raw.city, 'tr', e.slug) } : {}),
      ...(has(raw.title, 'en') ? { en: paths.event(raw.city, 'en', e.slug) } : {}),
    },
    // An untranslated page points search engines at the language it was written in.
    canonical: !translatedHere && translatedThere ? paths.event(raw.city, otherLang(lang), e.slug) : undefined,
    noindex: e.isSample || ended || (!translatedHere && translatedThere),
    // A photo's 1200×630 crop, or the generated poster card when there's no photo.
    image: image?.og ?? shareImagePath(raw, lang),
    type: 'article',
  })
}

export default async function EventPage({ params }: { params: Params }) {
  const { raw, lang } = await load(params)
  const more = (await getUpcomingEvents(raw.city))
    .filter((m) => m.id !== raw.id)
    .slice(0, 4)
    .map((m) => toListEvent(m, lang))
  return <EventDetail raw={raw} lang={lang} more={more} />
}
