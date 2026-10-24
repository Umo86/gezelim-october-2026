import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import type { ListEvent } from '@/lib/events'

/** Cancelled, postponed, new date or sold out. Nothing for events going ahead as planned. */
export function StatusPill({ event, lang }: { event: Pick<ListEvent, 'status' | 'soldOut'>; lang: Lang }) {
  const t = getDictionary(lang).card
  let label: string | null = null
  let tone = 'bg-mercan text-gece'
  if (event.status === 'cancelled') label = t.cancelled
  else if (event.status === 'postponed') label = t.postponed
  else if (event.status === 'rescheduled') {
    label = t.rescheduled
    tone = 'bg-ayran text-gece'
  } else if (event.soldOut) {
    label = t.soldOut
    tone = 'bg-gece text-ayran'
  }
  if (!label) return null
  return <span className={`ui rounded-full px-2.5 py-0.5 text-[0.75rem] ${tone}`}>{label}</span>
}
