import { HoverLink as Link } from '@/components/site/HoverLink'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { EventCard } from '@/components/site/EventCard'
import { mapsUrl } from '@/components/site/EventDetail'
import { ExternalIcon, PinIcon } from '@/components/site/icons'
import { JsonLd } from '@/components/site/JsonLd'
import { getCity, getPlace } from '@/config/places'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { formatDateFull } from '@/lib/dates'
import { toListEvent } from '@/lib/events'
import { getVenue } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

type Params = Promise<{ place: string; lang: string; slug: string }>

async function load(params: Params) {
  const { place, lang, slug } = await params
  if (!getPlace(place) || !isLang(lang)) notFound()
  const data = await getVenue(decodeURIComponent(slug))
  if (!data) notFound()
  if (data.venue.city !== place) permanentRedirect(paths.venue(data.venue.city, lang, data.venue.slug || slug))
  return { ...data, lang: lang as Lang }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { venue, upcoming, past, lang } = await load(params)
  const t = getDictionary(lang)
  const city = getCity(venue.city)
  const cityName = city?.name[lang] ?? venue.city
  const area = venue.town && venue.town !== cityName ? `${venue.town}, ${cityName}` : cityName
  return pageMetadata({
    lang,
    title: `${venue.name}, ${cityName}: ${t.venue.titleSuffix}`,
    description: t.venue.description(venue.name, area),
    path: paths.venue(venue.city, lang, venue.slug || ''),
    alternates: { tr: paths.venue(venue.city, 'tr', venue.slug || ''), en: paths.venue(venue.city, 'en', venue.slug || '') },
    noindex: Boolean(venue.isSample) || (upcoming.length === 0 && past.length < 3),
  })
}

export default async function VenuePage({ params }: { params: Params }) {
  const { venue, upcoming, past, lang } = await load(params)
  const t = getDictionary(lang)
  const city = getCity(venue.city)
  const cityName = city?.name[lang] ?? venue.city
  const address = [venue.address, venue.town, venue.postcode].filter(Boolean).join(', ')
  const directions = mapsUrl(venue, cityName)
  const events = upcoming.map((e) => toListEvent(e, lang))
  const earlier = past.map((e) => toListEvent(e, lang))
  const url = absoluteUrl(paths.venue(venue.city, lang, venue.slug || ''))

  return (
    <div className="wrap pt-8 md:pt-12">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
          { name: cityName, href: paths.home(venue.city, lang) },
          { name: venue.name, href: paths.venue(venue.city, lang, venue.slug || '') },
        ]}
      />
      <p className="ui mt-6 text-[1rem] text-muted">{t.venue.label}</p>
      <h1 className="display mt-1 text-[3rem] md:text-[5rem]">{venue.name}</h1>
      <p className="mt-3 text-[1.15rem]">
        {address ? `${address}, ` : ''}
        {cityName}
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        {directions ? (
          <a href={directions} target="_blank" rel="noopener noreferrer" className="ui inline-flex items-center gap-1.5 text-cini hover:underline">
            <PinIcon width={18} height={18} />
            {t.event.directions}
          </a>
        ) : null}
        {venue.website ? (
          <a href={venue.website} target="_blank" rel="noopener noreferrer" className="ui inline-flex items-center gap-1.5 text-cini hover:underline">
            {t.venue.website}
            <ExternalIcon width={16} height={16} />
          </a>
        ) : null}
      </div>

      <section className="mt-14" aria-labelledby="venue-upcoming">
        <h2 id="venue-upcoming" className="display border-b-2 border-gece pb-3 text-[2.2rem] md:text-[3rem]">
          {t.venue.upcoming}
        </h2>
        {events.length ? (
          <div className="mt-6 grid grid-cols-1 gap-8 xs:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted">{t.venue.none}</p>
        )}
      </section>

      {earlier.length ? (
        <section className="mt-14" aria-labelledby="venue-past">
          <h2 id="venue-past" className="display border-b-2 border-gece pb-3 text-[2rem] md:text-[2.4rem]">
            {t.venue.past}
          </h2>
          <ul className="divide-y divide-gece/10">
            {earlier.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <Link href={e.href} className="font-semibold hover:text-cini hover:underline">
                  {e.title}
                </Link>
                <span className="ui text-[0.95rem] text-muted">{formatDateFull(e.startsAt, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!venue.isSample ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: venue.name,
            url,
            address: {
              '@type': 'PostalAddress',
              ...(venue.address ? { streetAddress: venue.address } : {}),
              addressLocality: venue.town || city?.name.en || cityName,
              ...(venue.postcode ? { postalCode: venue.postcode } : {}),
              addressCountry: 'GB',
            },
            ...(venue.lat != null && venue.lng != null
              ? { geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng } }
              : {}),
            ...(venue.website ? { sameAs: [venue.website] } : {}),
          }}
        />
      ) : null}
    </div>
  )
}
