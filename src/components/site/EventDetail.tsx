import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { HoverLink as Link } from './HoverLink'
import { getCategory } from '@/config/categories'
import { getCity } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { formatDateFull, formatShortRange, formatTimeRange, londonTime, toLondonISO } from '@/lib/dates'
import { shareImagePath, toImage, toListEvent, type ListEvent, type RawEvent, type RawOrganiser, type RawVenue } from '@/lib/events'
import { has, lexicalPlainText, pick, truncate } from '@/lib/localize'
import { absoluteUrl, CONTACT_EMAIL } from '@/lib/site'
import { Breadcrumbs } from './Breadcrumbs'
import { EventArt } from './EventArt'
import { EventCard } from './EventCard'
import { CalendarMenu, ShareButtons } from './EventActions'
import { ExternalIcon, PinIcon, VerifiedIcon } from './icons'
import { JsonLd } from './JsonLd'

const STATUS_URL: Record<string, string> = {
  scheduled: 'https://schema.org/EventScheduled',
  cancelled: 'https://schema.org/EventCancelled',
  postponed: 'https://schema.org/EventPostponed',
  rescheduled: 'https://schema.org/EventRescheduled',
}

/** Images inside descriptions load from /img like every other photo. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    const value = (node as { value?: { filename?: string; alt?: string; width?: number; height?: number } }).value
    if (!value || typeof value !== 'object' || !value.filename) return null
    const size = (value as { sizes?: { poster?: { filename?: string } } }).sizes?.poster?.filename ?? value.filename
    return (
      <img
        src={`/img/${encodeURIComponent(size)}`}
        alt={value.alt ?? ''}
        loading="lazy"
        decoding="async"
        className="h-auto max-w-full rounded-[6px]"
      />
    )
  },
})

export function venueAddress(venue: RawVenue | null, cityName: string): string {
  if (!venue) return cityName
  return [venue.name, venue.address, venue.town, venue.postcode, cityName].filter(Boolean).join(', ')
}

export function mapsUrl(venue: RawVenue | null, cityName: string): string | null {
  if (!venue) return null
  const query = venue.lat != null && venue.lng != null ? `${venue.lat},${venue.lng}` : venueAddress(venue, cityName)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

type Props = {
  raw: RawEvent
  lang: Lang
  more: ListEvent[]
  /** Staff preview of a draft: no structured data, a banner on top. */
  preview?: boolean
}

export function EventDetail({ raw, lang, more, preview = false }: Props) {
  const t = getDictionary(lang)
  const e = toListEvent(raw, lang)
  const category = getCategory(raw.category)
  const city = getCity(raw.city)
  const cityName = city?.name[lang] ?? raw.city
  const venue = raw.venue && typeof raw.venue === 'object' ? (raw.venue as RawVenue) : null
  const organiser = raw.organiser && typeof raw.organiser === 'object' ? (raw.organiser as RawOrganiser) : null
  const description = pick<{ root: unknown }>(raw.description, lang)
  const descriptionText = description ? lexicalPlainText(description) : ''
  const translated = has(raw.title, lang)
  // Server component, rendered once per cache period: reading the clock here is intended.
  // eslint-disable-next-line react-hooks/purity
  const ended = Date.parse(e.activeUntil) < Date.now()
  const image = toImage(raw.image, lang, e.title)
  const url = absoluteUrl(e.href)
  const multiDay = e.dayStart !== e.dayEnd
  const directions = mapsUrl(venue, cityName)
  const ageLabel = raw.ageLimit && raw.ageLimit !== 'all' ? t.age[raw.ageLimit] : t.age.all
  const ticketLabel = e.isFree ? t.event.register : t.event.tickets
  const showTickets = Boolean(raw.ticketUrl) && !ended && e.status !== 'cancelled'
  const performers = (raw.performers ?? []).filter((p) => p?.name)

  const notices: Array<{ text: string; tone: string }> = []
  if (preview) notices.push({ text: t.preview.banner, tone: 'bg-gece text-ayran' })
  if (e.isSample) notices.push({ text: t.event.sample, tone: 'bg-tas text-gece' })
  if (e.status === 'cancelled') notices.push({ text: t.event.cancelled, tone: 'bg-mercan text-gece' })
  else if (e.status === 'postponed') notices.push({ text: t.event.postponed, tone: 'bg-mercan text-gece' })
  else if (e.status === 'rescheduled') notices.push({ text: t.event.rescheduled, tone: 'bg-cini-soft text-gece' })
  if (ended) notices.push({ text: t.event.ended, tone: 'bg-tas text-gece' })
  if (!translated) notices.push({ text: t.event.notTranslated, tone: 'bg-cini-soft text-gece' })

  const jsonLd =
    preview || e.isSample
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': category?.schemaType ?? 'Event',
          name: e.title,
          description: truncate(e.summary || descriptionText || e.title, 300),
          url,
          startDate: toLondonISO(e.startsAt),
          ...(e.endsAt ? { endDate: toLondonISO(e.endsAt) } : {}),
          eventStatus: STATUS_URL[e.status],
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: venue?.name ?? cityName,
            address: {
              '@type': 'PostalAddress',
              ...(venue?.address ? { streetAddress: venue.address } : {}),
              addressLocality: venue?.town || city?.name.en || cityName,
              ...(venue?.postcode ? { postalCode: venue.postcode } : {}),
              addressCountry: 'GB',
            },
            ...(venue?.lat != null && venue?.lng != null
              ? { geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng } }
              : {}),
          },
          image: image
            ? [image.og, image.card, image.poster].filter(Boolean).map((u) => absoluteUrl(u as string))
            : [absoluteUrl(shareImagePath(raw, lang))],
          ...(organiser
            ? {
                organizer: {
                  '@type': 'Organization',
                  name: organiser.name,
                  url: organiser.website || absoluteUrl(paths.organiser(lang, organiser.slug || '')),
                },
              }
            : {}),
          ...(e.isFree || raw.priceFrom != null || raw.ticketUrl
            ? {
                offers: {
                  '@type': 'Offer',
                  url: raw.ticketUrl || url,
                  price: e.isFree ? 0 : (raw.priceFrom ?? 0),
                  priceCurrency: 'GBP',
                  availability: e.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
                },
              }
            : {}),
          ...(performers.length
            ? {
                performer: performers.map((p) => ({
                  '@type': p.kind === 'group' ? 'PerformingGroup' : 'Person',
                  name: p.name,
                })),
              }
            : {}),
          ...(e.spoken === 'tr' || e.spoken === 'en' ? { inLanguage: e.spoken } : {}),
          ...(e.isFree ? { isAccessibleForFree: true } : {}),
        }

  const crumbs = [
    { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
    { name: cityName, href: paths.home(raw.city, lang) },
    ...(category ? [{ name: category.name[lang], href: paths.category(raw.city, lang, category) }] : []),
    { name: e.title, href: e.href },
  ]

  return (
    <article className="pb-24 md:pb-0">
      <div className="wrap pt-6 md:pt-10">
        <Breadcrumbs items={crumbs} label={t.nav.breadcrumb} />

        {notices.length ? (
          <div className="mt-4 space-y-2">
            {notices.map((n) => (
              <p key={n.text} className={`ui rounded-[6px] px-4 py-3 text-[0.95rem] ${n.tone}`}>
                {n.text}
              </p>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:sticky md:top-24 md:col-span-5 md:self-start">
            {image?.poster ? (
              <img
                src={image.poster}
                alt={image.alt}
                width={image.posterWidth ?? 1080}
                height={image.posterHeight ?? 1350}
                fetchPriority="high"
                decoding="async"
                className="h-auto w-full rounded-[6px] bg-tas"
              />
            ) : (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[6px]">
                <EventArt seed={e.slug} motif={e.motif} title={e.title} className="absolute inset-0" />
              </div>
            )}
          </div>

          <div className="md:col-span-7">
            {category ? (
              <Link href={paths.category(raw.city, lang, category)} className="ui text-[1rem] text-cini hover:underline">
                {category.name[lang]}
              </Link>
            ) : null}
            <h1 className="display mt-2 text-[2.9rem] sm:text-[3.6rem] lg:text-[4.6rem]">{e.title}</h1>
            {e.summary ? <p className="mt-4 max-w-[52ch] text-[1.2rem] leading-snug text-muted">{e.summary}</p> : null}

            <dl className="mt-8 divide-y divide-gece/10 border-y-2 border-gece">
              {performers.length ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                  <dt className="ui text-[0.95rem] text-muted">{t.event.lineup}</dt>
                  <dd className="text-[1.1rem] font-semibold">{performers.map((p) => p.name).join(', ')}</dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="ui text-[0.95rem] text-muted">{t.event.date}</dt>
                <dd>
                  <span className="display block text-[1.6rem]">
                    {multiDay ? formatShortRange(e.dayStart, e.dayEnd, lang) : formatDateFull(e.startsAt, lang)}
                  </span>
                  <span className="ui text-[1rem]">
                    {multiDay ? `${londonTime(e.startsAt)}` : formatTimeRange(e.startsAt, e.endsAt)}
                  </span>
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="ui text-[0.95rem] text-muted">{t.event.venue}</dt>
                <dd>
                  {venue?.slug ? (
                    <Link href={paths.venue(venue.city, lang, venue.slug)} className="block font-semibold text-cini hover:underline">
                      {venue.name}
                    </Link>
                  ) : (
                    <span className="block font-semibold">{venue?.name ?? cityName}</span>
                  )}
                  {venue ? (
                    <span className="block text-muted">
                      {[venue.address, venue.town, venue.postcode].filter(Boolean).join(', ')}
                      {venue.address || venue.town || venue.postcode ? ', ' : ''}
                      {cityName}
                    </span>
                  ) : null}
                  {directions ? (
                    <a
                      href={directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ui mt-1 inline-flex items-center gap-1.5 text-[0.95rem] text-cini hover:underline"
                    >
                      <PinIcon width={16} height={16} />
                      {t.event.directions}
                    </a>
                  ) : null}
                </dd>
              </div>
              {e.price || e.soldOut ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                  <dt className="ui text-[0.95rem] text-muted">{t.event.price}</dt>
                  <dd className="ui text-[1.05rem]">
                    <span className={e.isFree ? 'text-fistik-deep' : ''}>{e.price}</span>
                    {e.soldOut ? <span className="ml-3 rounded-full bg-gece px-2.5 py-0.5 text-[0.8rem] text-ayran">{t.card.soldOut}</span> : null}
                  </dd>
                </div>
              ) : null}
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="ui text-[0.95rem] text-muted">{t.event.language}</dt>
                <dd>{t.spoken[e.spoken]}</dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="ui text-[0.95rem] text-muted">{t.event.age}</dt>
                <dd>{ageLabel}</dd>
              </div>
              {organiser ? (
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr]">
                  <dt className="ui text-[0.95rem] text-muted">{t.event.organiser}</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    {organiser.slug ? (
                      <Link href={paths.organiser(lang, organiser.slug)} className="font-semibold text-cini hover:underline">
                        {organiser.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{organiser.name}</span>
                    )}
                    {organiser.verified ? (
                      <span className="ui inline-flex items-center gap-1 text-[0.85rem] text-fistik-deep" title={t.event.verified}>
                        <VerifiedIcon width={16} height={16} />
                        {t.event.verified}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {showTickets ? (
                <a
                  href={raw.ticketUrl as string}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="ui inline-flex items-center gap-2 rounded-full bg-cini px-6 py-3 text-[1.05rem] text-ayran hover:bg-cini-deep"
                >
                  {ticketLabel}
                  <ExternalIcon width={18} height={18} />
                </a>
              ) : null}
              {!ended ? (
                <CalendarMenu
                  lang={lang}
                  event={{
                    id: e.id,
                    title: e.title,
                    startsAt: e.startsAt,
                    endsAt: e.endsAt,
                    location: venueAddress(venue, cityName),
                    url,
                  }}
                />
              ) : null}
              <ShareButtons url={url} title={e.title} lang={lang} />
            </div>
            {showTickets ? <p className="mt-3 text-[0.9rem] text-muted">{t.event.ticketsInfo}</p> : null}
          </div>
        </div>

        {description && descriptionText ? (
          <section className="mt-14 grid md:grid-cols-12 md:gap-12" aria-labelledby="about-event">
            <div className="md:col-span-7 md:col-start-6">
              <h2 id="about-event" className="display text-[2rem] md:text-[2.6rem]">
                {t.event.about}
              </h2>
              <div className="prose-gz mt-4">
                <RichText data={description as never} converters={converters} disableContainer />
              </div>
              <p className="mt-8 text-[0.95rem] text-muted">
                {t.event.reportMistake}{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${e.title} (${e.slug})`)}`}
                  className="text-cini underline underline-offset-4"
                >
                  {t.event.reportLink}
                </a>
              </p>
            </div>
          </section>
        ) : null}
      </div>

      {more.length ? (
        <section className="wrap mt-16" aria-labelledby="more-events">
          <h2 id="more-events" className="display border-b-2 border-gece pb-3 text-[2.2rem] md:text-[3rem]">
            {t.event.moreInCity(lang === 'tr' ? (city?.inTr ?? cityName) : (city?.inEn ?? cityName))}
          </h2>
          <div className="rail mt-6">
            {more.map((m) => (
              <EventCard key={m.id} event={m} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      {showTickets ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-gece/15 bg-ayran/95 px-4 py-3 backdrop-blur-sm md:hidden">
          <div className="min-w-0">
            <p className="ui truncate text-[0.95rem]">{e.title}</p>
            <p className="ui text-[0.85rem] text-muted">{e.price}</p>
          </div>
          <a
            href={raw.ticketUrl as string}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="ui shrink-0 rounded-full bg-cini px-5 py-2.5 text-ayran"
          >
            {ticketLabel}
          </a>
        </div>
      ) : null}

      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </article>
  )
}
