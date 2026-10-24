import { HoverLink as Link } from './HoverLink'
import { CATEGORIES } from '@/config/categories'
import { CITIES, type Place } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import type { ListEvent } from '@/lib/events'

const pill = (active: boolean) =>
  `ui shrink-0 rounded-full px-3.5 py-1.5 text-[0.95rem] ${
    active ? 'bg-cini text-ayran' : 'bg-tas text-gece hover:bg-tas-deep'
  }`

/** Links to category pages for this place. Only categories with events, plus the current one. */
export function CategoryNav({
  place,
  lang,
  events,
  active,
}: {
  place: Place
  lang: Lang
  events: ListEvent[]
  active?: string
}) {
  const t = getDictionary(lang)
  const present = new Set(events.map((e) => e.category))
  const list = CATEGORIES.filter((c) => present.has(c.value) || c.value === active)
  return (
    <nav aria-label={t.list.categoryLabel} className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      <Link href={paths.events(place.slug, lang)} className={pill(!active)} aria-current={!active ? 'page' : undefined}>
        {t.list.allCategories}
      </Link>
      {list.map((c) => (
        <Link
          key={c.value}
          href={paths.category(place.slug, lang, c)}
          className={pill(active === c.value)}
          aria-current={active === c.value ? 'page' : undefined}
        >
          {c.name[lang]}
        </Link>
      ))}
    </nav>
  )
}

/** On UK-wide lists: jump to a city's own list. */
export function CityLinks({ lang, events, href }: { lang: Lang; events: ListEvent[]; href: (p: Place) => string }) {
  const t = getDictionary(lang)
  const counts = new Map<string, number>()
  for (const e of events) counts.set(e.city, (counts.get(e.city) ?? 0) + 1)
  const cities = CITIES.filter((c) => counts.has(c.slug)).sort((a, b) => (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0))
  if (!cities.length) return null
  return (
    <nav aria-label={t.list.byCity} className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
      <span className="ui text-[0.95rem] text-muted">{t.list.byCity}</span>
      {cities.map((c) => (
        <Link
          key={c.slug}
          href={href(c)}
          className="ui text-[0.95rem] text-cini underline-offset-4 hover:underline"
        >
          {c.name[lang]} <span className="text-muted">{counts.get(c.slug)}</span>
        </Link>
      ))}
    </nav>
  )
}
