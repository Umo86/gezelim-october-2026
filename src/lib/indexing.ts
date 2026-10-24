/*
 * When a listing page is worth indexing. Sample events never count. A category or
 * date page needs a few real events of its own and must narrow down its parent list:
 * one event shown on five near-identical pages reads as thin, duplicate content.
 */
export const MIN_LISTED = 3

type Countable = { id: number | string; isSample?: boolean | null }

export const realEvents = <T extends Countable>(events: T[]): T[] => events.filter((e) => !e.isSample)

/** A city's home and full list: indexable once it has any real event. */
export function placeIsIndexable(events: Countable[]): boolean {
  return realEvents(events).length > 0
}

/** A category or date page, given its events and those of the page it narrows down. */
export function subListIsIndexable(events: Countable[], parent: Countable[]): boolean {
  const own = realEvents(events).length
  return own >= MIN_LISTED && own < realEvents(parent).length
}
