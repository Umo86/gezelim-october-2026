import { HoverLink as Link } from './HoverLink'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { dateTile, formatShortRange, formatTimeRange, formatWeekdayShort } from '@/lib/dates'
import type { ListEvent } from '@/lib/events'
import { EventVisual } from './EventVisual'
import { StatusPill } from './StatusPill'

type Props = {
  event: ListEvent
  lang: Lang
  priority?: boolean
  /** Show the city name (useful on UK-wide lists). */
  showCity?: boolean
}

/** Poster card used in rails and grids. The whole card is one link. */
export function EventCard({ event, lang, priority, showCity = false }: Props) {
  const t = getDictionary(lang)
  const tile = dateTile(event.startsAt, lang)
  const multiDay = event.dayStart !== event.dayEnd
  const when = multiDay
    ? formatShortRange(event.dayStart, event.dayEnd, lang)
    : `${formatWeekdayShort(event.startsAt, lang)} ${formatTimeRange(event.startsAt, event.endsAt)}`
  const where = showCity ? event.place : (event.venueName ?? event.place)

  return (
    <article className="group relative" data-until={event.activeUntil}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-tas">
        <EventVisual event={event} variant="card" priority={priority} />
        <div className="absolute left-2.5 top-2.5 flex min-w-[3.1rem] flex-col items-center rounded-[4px] bg-ayran px-2 pb-1.5 pt-1 text-gece shadow-[0_1px_0_rgba(15,26,51,0.25)]">
          <span className="display text-[1.85rem] leading-none">{tile.day}</span>
          <span className="ui text-[0.8rem] leading-tight">{tile.month}</span>
        </div>
        <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1.5">
          <StatusPill event={event} lang={lang} />
          {event.isSample ? (
            <span className="ui rounded-full bg-gece/85 px-2.5 py-0.5 text-[0.75rem] text-ayran">{t.card.sample}</span>
          ) : null}
        </div>
      </div>
      <p className="ui mt-3 text-[0.9rem] text-cini">{when}</p>
      <h3 className="display mt-1 text-[1.55rem] text-gece">
        <Link
          href={event.href}
          className="after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:underline"
        >
          {event.title}
        </Link>
      </h3>
      {where ? <p className="mt-1.5 text-[0.95rem] leading-snug text-muted">{where}</p> : null}
      {event.price ? (
        <p className={`ui mt-1 text-[0.9rem] ${event.isFree ? 'text-fistik-deep' : 'text-gece'}`}>{event.price}</p>
      ) : null}
    </article>
  )
}
