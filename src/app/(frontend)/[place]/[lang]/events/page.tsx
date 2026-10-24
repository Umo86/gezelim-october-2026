import type { Metadata } from 'next'
import { EventsListing } from '@/components/site/EventsListing'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { placeHeading, resolveRoute, upcomingFor, type RouteParams } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { place, lang } = await resolveRoute(params)
  const events = await upcomingFor(place, lang)
  const heading = placeHeading(place, lang)
  const description =
    lang === 'tr'
      ? `${heading}: tarih, mekan ve bilet bilgileriyle tam liste. Bugün, yarın ve bu hafta sonu ne var, hemen gör.`
      : `${heading}: the full list with dates, venues and tickets. See what's on today, tomorrow and this weekend.`
  return pageMetadata({
    lang,
    title: heading,
    description,
    path: paths.events(place.slug, lang),
    alternates: { tr: paths.events(place.slug, 'tr'), en: paths.events(place.slug, 'en') },
    noindex: events.length === 0,
  })
}

export default async function EventsPage({ params }: { params: RouteParams }) {
  const { place, lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  const events = await upcomingFor(place, lang)
  const isUk = place.kind === 'country'
  return (
    <EventsListing
      place={place}
      lang={lang}
      title={placeHeading(place, lang)}
      crumbs={[
        { name: isUk ? (lang === 'tr' ? 'Birleşik Krallık' : 'UK') : place.name[lang], href: paths.home(place.slug, lang) },
        { name: t.nav.events, href: paths.events(place.slug, lang) },
      ]}
      events={events}
      allEvents={events}
    />
  )
}
