import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/** Every public query is cached under this tag; one call refreshes the site. */
export const CONTENT_TAG = 'content'

export function revalidateContent(): void {
  try {
    // { expire: 0 }: the next visitor gets fresh content rather than one more stale copy.
    revalidateTag(CONTENT_TAG, { expire: 0 })
  } catch {
    // Running outside Next.js (seed scripts, migrations): nothing is cached there.
  }
}

/** Refreshes the site after a change, unless the caller asked not to (bulk imports). */
export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, context }) => {
  if (!context?.disableRevalidate) revalidateContent()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (!context?.disableRevalidate) revalidateContent()
  return doc
}
