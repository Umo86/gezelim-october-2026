import { HoverLink as Link } from '@/components/site/HoverLink'
import type { Metadata } from 'next'
import { EventArt } from '@/components/site/EventArt'
import { EventCard } from '@/components/site/EventCard'
import { EventRow } from '@/components/site/EventRow'
import { EventVisual } from '@/components/site/EventVisual'
import { Frieze } from '@/components/site/Frieze'
import { JsonLd } from '@/components/site/JsonLd'
import { OrganiserCta } from '@/components/site/OrganiserCta'
import { RefreshIfStale } from '@/components/site/RefreshIfStale'
import { CATEGORIES } from '@/config/categories'
import { CITIES } from '@/config/places'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { formatDayLong, formatShortRange, londonDayKey, overlaps, whenRange } from '@/lib/dates'
import type { ListEvent } from '@/lib/events'
import { placeIsIndexable } from '@/lib/indexing'
import { placeHeading, resolveRoute, upcomingFor, type RouteParams } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'
import { fitLongestWord } from '@/lib/fit'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { place, lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  const events = await upcomingFor(place, lang)
  const heading = placeHeading(place, lang)
  const description =
    place.kind === 'country'
      ? t.site.description
      : lang === 'tr'
        ? `${place.inTr}ki Türk konserleri, stand-up gösterileri, festivaller ve topluluk etkinlikleri. Bu hafta sonu ne var, hepsi tek listede.`
        : `Turkish concerts, stand-up, festivals and community events ${place.inEn}. See what's on this weekend, all in one list.`
  return pageMetadata({
    lang,
    title: place.kind === 'country' ? `Gezelim · ${heading}` : heading,
    absoluteTitle: place.kind === 'country',
    description,
    path: paths.home(place.slug, lang),
    alternates: { tr: paths.home(place.slug, 'tr'), en: paths.home(place.slug, 'en') },
    noindex: place.kind === 'city' && !placeIsIndexable(events),
  })
}

function SectionHead({ title, aside, link }: { title: string; aside?: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-gece pb-3">
      <h2 className="display text-[2.5rem] md:text-[3.6rem]">
        {title}
        {aside ? <span className="ui ml-3 align-middle text-[1rem] text-muted md:text-[1.15rem]">{aside}</span> : null}
      </h2>
      {link ? (
        <Link href={link.href} className="ui text-[0.95rem] text-cini underline-offset-4 hover:underline">
          {link.label}
        </Link>
      ) : null}
    </div>
  )
}

export default async function PlaceHome({ params }: { params: RouteParams }) {
  const { place, lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  const events = await upcomingFor(place, lang)
  const isUk = place.kind === 'country'
  const now = new Date()
  const today = londonDayKey(now)

  const weekend = whenRange('weekend', now)
  const weekendEvents = events.filter((e) => overlaps({ start: e.dayStart, end: e.dayEnd }, weekend)).slice(0, 8)
  const weekendIds = new Set(weekendEvents.map((e) => e.id))
  const featured = events.filter((e) => e.featured && !weekendIds.has(e.id)).slice(0, 4)
  const shown = new Set([...weekendIds, ...featured.map((e) => e.id)])
  const comingUp = events.filter((e) => !shown.has(e.id)).slice(0, 10)

  const categoryCounts = CATEGORIES.map((c) => ({ c, n: events.filter((e) => e.category === c.value).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  const cityCounts = CITIES.map((c) => ({ c, n: events.filter((e) => e.city === c.slug).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)

  // Group "coming up" by day for a calendar-like read.
  const groups = new Map<string, ListEvent[]>()
  for (const e of comingUp) {
    const key = e.dayStart < today ? today : e.dayStart
    groups.set(key, [...(groups.get(key) ?? []), e])
  }

  // Three posters for the hero, photos first: the weekend, then featured, then what's next.
  const posterPool = [...new Map([...weekendEvents, ...featured, ...events].map((e) => [e.id, e])).values()]
  const heroPosters = [...posterPool.filter((e) => e.image), ...posterPool.filter((e) => !e.image)].slice(0, 3)
  const POSTER_SPOTS = [
    { left: '22%', top: '7.5rem', rotate: '-2deg', z: 3 },
    { left: '0%', top: '1rem', rotate: '-7deg', z: 1 },
    { left: '44%', top: '0rem', rotate: '5deg', z: 2 },
  ]

  const heading = isUk ? t.home.titleUk : placeHeading(place, lang)
  const quick = (['today', 'tomorrow', 'weekend', 'week'] as const).map((w) => ({
    href: paths.when(place.slug, lang, w),
    label: t.when[w],
  }))

  return (
    <>
      <RefreshIfStale builtAt={now.getTime()} />
      <section className="bg-cini text-ayran">
        <div className="wrap grid items-center gap-10 pb-10 pt-8 md:pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem]">
          <div className="@container min-w-0">
          <h1
            style={fitLongestWord(heading)}
            className="display max-w-[max(13ch,var(--word))] text-[length:min(3.3rem,var(--fit))] xs:text-[length:min(3.9rem,var(--fit))] sm:text-[length:min(5rem,var(--fit))] md:text-[length:min(6.6rem,var(--fit))] lg:text-[length:min(6.4rem,var(--fit))] xl:text-[length:min(7.4rem,var(--fit))]"
          >
            {heading}
          </h1>
          <p className="mt-5 max-w-[44ch] text-[1.15rem] text-ayran/90 md:text-[1.3rem]">
            {isUk ? t.home.lead : t.home.leadCity}
          </p>
          <nav aria-label={t.list.dateLabel} className="mt-8 flex flex-wrap gap-2">
            {quick.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="ui rounded-full bg-ayran px-4 py-2 text-[1rem] text-gece hover:bg-white"
              >
                {q.label}
              </Link>
            ))}
          </nav>
          {isUk ? (
            <nav aria-label={t.footer.cities} className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {CITIES.filter((c) => c.major).map((c) => (
                <Link key={c.slug} href={paths.home(c.slug, lang)} className="ui text-[1rem] text-ayran underline-offset-4 hover:underline">
                  {c.name[lang]}
                </Link>
              ))}
            </nav>
          ) : null}
          </div>
          {heroPosters.length >= 2 ? (
            <div className="relative hidden h-[32rem] lg:block">
              {heroPosters.map((e, i) => (
                <Link
                  key={e.id}
                  href={e.href}
                  aria-label={e.title}
                  className="absolute w-[14rem] transition-transform duration-200 hover:-translate-y-1.5 xl:w-[16rem]"
                  style={{ left: POSTER_SPOTS[i].left, top: POSTER_SPOTS[i].top, rotate: POSTER_SPOTS[i].rotate, zIndex: POSTER_SPOTS[i].z }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] shadow-[0_28px_50px_-18px_rgba(5,10,30,0.65)]">
                    <EventVisual event={e} variant="card" sizes="256px" instance="hero" />
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <Frieze />
      </section>

      {events.length === 0 ? (
        <section className="wrap mt-14">
          <p className="max-w-[52ch] text-[1.2rem]">{isUk ? t.list.empty : t.home.noEventsCity(place.name[lang])}</p>
          {!isUk ? (
            <Link href={paths.home('uk', lang)} className="ui mt-4 inline-block text-cini underline underline-offset-4">
              {t.home.browseUk}
            </Link>
          ) : null}
        </section>
      ) : (
        <>
          <section className="wrap mt-12 md:mt-16" aria-labelledby="weekend">
            <div id="weekend">
              <SectionHead
                title={t.home.weekend}
                aside={formatShortRange(weekend.from, weekend.to, lang)}
                link={{ href: paths.when(place.slug, lang, 'weekend'), label: t.home.seeWeekend }}
              />
            </div>
            {weekendEvents.length ? (
              <div className="rail mt-6" data-group>
                {weekendEvents.map((e, i) => (
                  <EventCard key={e.id} event={e} lang={lang} priority={i < 2} showCity={isUk} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-[1.05rem] text-muted">{t.home.noWeekend}</p>
            )}
          </section>

          {featured.length ? (
            <section className="wrap mt-16" aria-labelledby="featured">
              <div id="featured">
                <SectionHead title={t.home.featured} />
              </div>
              <div className="rail mt-6" data-group>
                {featured.map((e) => (
                  <EventCard key={e.id} event={e} lang={lang} showCity={isUk} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="wrap mt-16" aria-labelledby="categories">
            <div id="categories">
              <SectionHead title={t.home.categories} />
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
              {categoryCounts.map(({ c, n }, i) => (
                <li key={c.value} className="group relative">
                  <div className="relative aspect-square overflow-hidden rounded-[6px]">
                    <EventArt seed={c.value} motif={c.motif} scheme={i % 6} scale={1.5} className="absolute inset-0" />
                  </div>
                  <h3 className="display mt-2.5 text-[1.35rem]">
                    <Link
                      href={paths.category(place.slug, lang, c)}
                      className="after:absolute after:inset-0 after:content-[''] group-hover:underline"
                    >
                      {c.name[lang]}
                    </Link>
                  </h3>
                  <p className="ui text-[0.9rem] text-muted">{t.home.eventsCount(n)}</p>
                </li>
              ))}
            </ul>
          </section>

          {isUk && cityCounts.length ? (
            <section className="wrap mt-16" aria-labelledby="cities">
              <div id="cities">
                <SectionHead title={t.home.cities} />
              </div>
              <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                {cityCounts.map(({ c, n }) => (
                  <li key={c.slug} className="border-b border-gece/15">
                    <Link
                      href={paths.home(c.slug, lang)}
                      className="group flex items-baseline justify-between gap-4 py-3"
                    >
                      <span className="display text-[2rem] group-hover:text-cini group-hover:underline">{c.name[lang]}</span>
                      <span className="ui text-[0.95rem] text-muted">{t.home.eventsCount(n)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {comingUp.length ? (
            <section className="wrap mt-16" aria-labelledby="coming-up">
              <div id="coming-up">
                <SectionHead title={t.home.comingUp} link={{ href: paths.events(place.slug, lang), label: t.home.seeAll }} />
              </div>
              <div className="mt-2">
                {[...groups.entries()].map(([day, list]) => (
                  <div key={day} data-group className="grid gap-x-8 border-b border-gece/15 py-2 md:grid-cols-[13rem_1fr]">
                    <h3 className="ui pt-4 text-[1rem] text-gece md:pt-6">
                      {day === today ? t.list.today : formatDayLong(day, lang)}
                    </h3>
                    <ul className="divide-y divide-gece/10">
                      {list.map((e) => (
                        <li key={e.id} data-item>
                          <EventRow event={e} lang={lang} showCity={isUk} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link
                href={paths.events(place.slug, lang)}
                className="ui mt-8 inline-block rounded-full border-2 border-gece px-5 py-2.5 text-gece hover:bg-gece hover:text-ayran"
              >
                {t.home.seeAll}
              </Link>
            </section>
          ) : null}
        </>
      )}

      <OrganiserCta lang={lang} city={isUk ? undefined : place.slug} />

      {isUk ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': absoluteUrl('/#organization'),
                name: 'Gezelim',
                url: absoluteUrl('/'),
                logo: absoluteUrl('/brand/icon-512.png'),
              },
              {
                '@type': 'WebSite',
                '@id': absoluteUrl('/#website'),
                name: 'Gezelim',
                url: absoluteUrl('/'),
                inLanguage: lang,
                publisher: { '@id': absoluteUrl('/#organization') },
              },
            ],
          }}
        />
      ) : null}
    </>
  )
}
