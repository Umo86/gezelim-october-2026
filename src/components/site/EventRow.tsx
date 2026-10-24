import { HoverLink as Link } from './HoverLink'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { formatShortRange, formatTimeRange } from '@/lib/dates'
import type { ListEvent } from '@/lib/events'
import { EventVisual } from './EventVisual'
import { StatusPill } from './StatusPill'

type Props = {
  event: ListEvent
  lang: Lang
  showCity?: boolean
  showCategory?: boolean
}

/** Compact row for date-grouped lists. */
export function EventRow({ event, lang, showCity = false, showCategory = true }: Props) {
  const t = getDictionary(lang)
  const multiDay = event.dayStart !== event.dayEnd
  const when = multiDay ? formatShortRange(event.dayStart, event.dayEnd, lang) : formatTimeRange(event.startsAt, event.endsAt)
  const where = [event.venueName, showCity ? event.place : event.venueName ? null : event.place].filter(Boolean).join(', ')

  return (
    <article
      className="group relative grid grid-cols-[4.25rem_1fr] gap-x-4 py-4 sm:grid-cols-[5rem_1fr_auto] sm:gap-x-5"
      data-until={event.activeUntil}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-tas">
        <EventVisual event={event} variant="thumb" />
      </div>
      <div className="min-w-0">
        <p className="ui flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9rem] text-cini">
          <span>{when}</span>
          {showCategory ? <span className="text-muted">{event.categoryName}</span> : null}
          <StatusPill event={event} lang={lang} />
          {event.isSample ? (
            <span className="rounded-full bg-tas px-2 py-px text-[0.72rem] text-gece">{t.card.sample}</span>
          ) : null}
        </p>
        <h3 className="display mt-1 text-[1.4rem] text-gece sm:text-[1.6rem]">
          <Link
            href={event.href}
            className="after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:underline"
          >
            {event.title}
          </Link>
        </h3>
        {where ? <p className="mt-1 text-[0.95rem] leading-snug text-muted">{where}</p> : null}
        {event.price ? (
          <p className={`ui mt-1 text-[0.9rem] sm:hidden ${event.isFree ? 'text-fistik-deep' : ''}`}>{event.price}</p>
        ) : null}
      </div>
      <p
        className={`ui hidden self-center text-right text-[0.95rem] sm:block ${event.isFree ? 'text-fistik-deep' : 'text-gece'}`}
      >
        {event.price}
      </p>
    </article>
  )
}
