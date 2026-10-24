import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { EventCard } from '@/components/site/EventCard'
import { EventArt } from '@/components/site/EventArt'
import { ExternalIcon, VerifiedIcon } from '@/components/site/icons'
import { JsonLd } from '@/components/site/JsonLd'
import { RefreshIfStale } from '@/components/site/RefreshIfStale'
import { getPlace } from '@/config/places'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { toImage, toListEvent } from '@/lib/events'
import { has, pick, truncate } from '@/lib/localize'
import { getOrganiser } from '@/lib/queries'
import { pageMetadata } from '@/lib/seo'
import { absoluteUrl, instagramUrl, webUrl } from '@/lib/site'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

type Params = Promise<{ place: string; lang: string; slug: string }>

async function load(params: Params) {
  const { place, lang, slug } = await params
  if (!getPlace(place) || !isLang(lang)) notFound()
  if (place !== 'uk') permanentRedirect(paths.organiser(lang, slug))
  const data = await getOrganiser(decodeURIComponent(slug))
  if (!data) notFound()
  return { ...data, lang: lang as Lang }
}


export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { organiser, upcoming, lang } = await load(params)
  // Only a bio written in this language; the other language's would mislabel the page.
  const bio = has(organiser.bio, lang) ? pick<string>(organiser.bio, lang) : undefined
  const description =
    truncate(bio || '', 160) ||
    (lang === 'tr'
      ? `${organiser.name} tarafından düzenlenen Türk etkinlikleri: yaklaşan tarihler, mekanlar ve biletler.`
      : `Turkish events by ${organiser.name}: upcoming dates, venues and tickets.`)
  return pageMetadata({
    lang,
    title: lang === 'tr' ? `${organiser.name} etkinlikleri` : `${organiser.name} events`,
    description,
    path: paths.organiser(lang, organiser.slug || ''),
    alternates: { tr: paths.organiser('tr', organiser.slug || ''), en: paths.organiser('en', organiser.slug || '') },
    noindex: Boolean(organiser.isSample) || upcoming.length === 0,
  })
}

export default async function OrganiserPage({ params }: { params: Params }) {
  const { organiser, upcoming, pastCount, lang } = await load(params)
  const t = getDictionary(lang)
  const bio = pick<string>(organiser.bio, lang)
  const logo = toImage(organiser.logo as never, lang, organiser.name)
  const events = upcoming.map((e) => toListEvent(e, lang))
  const website = webUrl(organiser.website)
  const instagram = organiser.instagram ? instagramUrl(organiser.instagram) : null
  // Rendered once per cache period; the browser compares this with its own clock.
  // eslint-disable-next-line react-hooks/purity
  const builtAt = Date.now()

  return (
    <div className="wrap pt-8 md:pt-12">
      <RefreshIfStale builtAt={builtAt} />
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
          { name: organiser.name, href: paths.organiser(lang, organiser.slug || '') },
        ]}
      />
      <header className="mt-6 grid items-start gap-6 sm:grid-cols-[8rem_1fr] md:grid-cols-[11rem_1fr] md:gap-10">
        <div className="relative aspect-square w-32 overflow-hidden rounded-[8px] bg-tas md:w-44">
          {logo?.card ? (
            <img src={logo.card} alt={logo.alt} width={320} height={320} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <EventArt seed={organiser.slug || organiser.name} motif="rosette" className="absolute inset-0" />
          )}
        </div>
        <div>
          <p className="ui text-[1rem] text-muted">{t.organiser.label}</p>
          <h1 className="display mt-1 text-[3rem] md:text-[4.6rem]">{organiser.name}</h1>
          {organiser.verified ? (
            <p className="ui mt-2 inline-flex items-center gap-1.5 text-fistik-deep">
              <VerifiedIcon width={18} height={18} />
              {t.event.verified}
            </p>
          ) : null}
          {bio ? (
            <p className="mt-4 max-w-[60ch] text-[1.1rem]" lang={has(organiser.bio, lang) ? undefined : lang === 'tr' ? 'en' : 'tr'}>
              {bio}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-4">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="ui inline-flex items-center gap-1.5 text-cini hover:underline">
                {t.organiser.website}
                <ExternalIcon width={16} height={16} />
              </a>
            ) : null}
            {instagram ? (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="ui inline-flex items-center gap-1.5 text-cini hover:underline">
                {t.organiser.instagram}
                <ExternalIcon width={16} height={16} />
              </a>
            ) : null}
          </div>
          {pastCount > 0 ? <p className="ui mt-3 text-[0.95rem] text-muted">{t.organiser.pastCount(pastCount)}</p> : null}
        </div>
      </header>

      <section className="mt-14" aria-labelledby="organiser-upcoming">
        <h2 id="organiser-upcoming" className="display border-b-2 border-gece pb-3 text-[2.2rem] md:text-[3rem]">
          {t.organiser.upcoming}
        </h2>
        {events.length ? (
          <div className="mt-6 grid grid-cols-1 gap-8 xs:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} lang={lang} showCity />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted">{t.organiser.none}</p>
        )}
      </section>

      {!organiser.isSample ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: organiser.name,
            url: absoluteUrl(paths.organiser(lang, organiser.slug || '')),
            ...(website || instagram ? { sameAs: [website, instagram].filter(Boolean) } : {}),
          }}
        />
      ) : null}
    </div>
  )
}
