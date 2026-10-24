import type { Category } from '@/config/categories'
import type { Place } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths, WHEN_VALUES, type When } from '@/i18n/paths'
import type { ListEvent } from '@/lib/events'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { CategoryNav, CityLinks } from './CategoryNav'
import { EventsExplorer } from './EventsExplorer'
import { OrganiserCta } from './OrganiserCta'
import { RefreshIfStale } from './RefreshIfStale'

type Props = {
  place: Place
  lang: Lang
  title: string
  /** A line under the heading, e.g. the date range of a date page. */
  subtitle?: string
  crumbs: Crumb[]
  /** Events shown in the list. */
  events: ListEvent[]
  /** Every upcoming event in the place, used to decide which category links to show. */
  allEvents: ListEvent[]
  category?: Category
  when?: When
}

/** Shared layout for the events list, category pages and date pages. */
export function EventsListing({ place, lang, title, subtitle, crumbs, events, allEvents, category, when }: Props) {
  const t = getDictionary(lang)
  const isUk = place.kind === 'country'
  // Date chips are links on the main list and on date pages; on category pages they filter in place.
  const dateLinks = category
    ? undefined
    : (Object.fromEntries([
        ['all', paths.events(place.slug, lang)],
        ...WHEN_VALUES.map((w) => [w, paths.when(place.slug, lang, w)]),
      ]) as Record<When | 'all', string>)

  // Rendered once per cache period; the browser compares this with its own clock.
  // eslint-disable-next-line react-hooks/purity
  const builtAt = Date.now()

  return (
    <>
      <RefreshIfStale builtAt={builtAt} />
      <div className="wrap pt-8 md:pt-12">
        <Breadcrumbs label={t.nav.breadcrumb} items={crumbs} />
        <h1 className="display mt-4 max-w-[18ch] text-[2.9rem] md:text-[5.2rem]">{title}</h1>
        {subtitle ? <p className="ui mt-3 text-[1.15rem] text-muted">{subtitle}</p> : null}
        <CategoryNav place={place} lang={lang} events={allEvents} active={category?.value} />
        {isUk ? (
          <CityLinks
            lang={lang}
            events={events}
            href={(p) =>
              category ? paths.category(p.slug, lang, category) : when ? paths.when(p.slug, lang, when) : paths.events(p.slug, lang)
            }
          />
        ) : null}
        <EventsExplorer
          events={events}
          lang={lang}
          showCity={isUk}
          showCategory={!category}
          dateLinks={dateLinks}
          activeWhen={when ?? 'all'}
        />
      </div>
      <OrganiserCta lang={lang} city={isUk ? undefined : place.slug} />
    </>
  )
}
