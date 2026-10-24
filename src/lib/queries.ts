import 'server-only'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import { CONTENT_TAG } from '@/hooks/revalidate'
import type { RawEvent, RawOrganiser, RawVenue } from './events'

/*
 * Every public read goes through unstable_cache with the "content" tag.
 * Pages are static and only rebuilt after a publish (Payload hooks call
 * revalidateTag) or once an hour so "this weekend" stays current.
 * Readers never wake the database directly.
 */

export const getPayloadClient = () => getPayload({ config })

const HOUR = 3600

const eventSelect = {
  title: true,
  slug: true,
  summary: true,
  category: true,
  city: true,
  startsAt: true,
  endsAt: true,
  activeUntil: true,
  isFree: true,
  priceFrom: true,
  priceTo: true,
  soldOut: true,
  eventStatus: true,
  eventLanguage: true,
  featured: true,
  isSample: true,
  image: true,
  venue: true,
  organiser: true,
  performers: true,
  updatedAt: true,
} as const

const populate = {
  media: { filename: true, alt: true, width: true, height: true, focalX: true, focalY: true, sizes: true },
  venues: { name: true, slug: true, city: true, town: true, postcode: true, address: true, lat: true, lng: true },
  organisers: { name: true, slug: true, verified: true },
} as const

const published: Where = { _status: { equals: 'published' } }

async function findUpcoming(city: string | null): Promise<RawEvent[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        published,
        { activeUntil: { greater_than: new Date().toISOString() } },
        ...(city ? [{ city: { equals: city } }] : []),
      ],
    },
    sort: 'startsAt',
    limit: 800,
    depth: 1,
    locale: 'all',
    select: eventSelect,
    populate,
    overrideAccess: true,
  })
  return res.docs as unknown as RawEvent[]
}

/** Upcoming published events, soonest first. `city` null means the whole UK. */
export const getUpcomingEvents = unstable_cache(findUpcoming, ['upcoming-events-v1'], {
  tags: [CONTENT_TAG],
  revalidate: HOUR,
})

async function findEventBySlug(slug: string): Promise<RawEvent | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'events',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
    locale: 'all',
    // Public access rules apply: published only, and private fields are stripped.
    overrideAccess: false,
    populate: {
      organisers: { name: true, slug: true, verified: true, bio: true, logo: true, website: true, instagram: true },
    },
  })
  if (res.docs[0]) return res.docs[0] as unknown as RawEvent
  // An old address (the event was renamed): the page redirects to the current slug.
  const moved = await payload.find({
    collection: 'events',
    where: { and: [published, { previousSlugs: { in: [slug] } }] },
    limit: 1,
    depth: 0,
    select: { slug: true, city: true },
    overrideAccess: false,
  })
  return (moved.docs[0] as unknown as RawEvent) ?? null
}

export const getEventBySlug = unstable_cache(findEventBySlug, ['event-by-slug-v1'], {
  tags: [CONTENT_TAG],
  revalidate: HOUR,
})

async function findOrganiser(slug: string): Promise<{
  organiser: RawOrganiser
  upcoming: RawEvent[]
  pastCount: number
} | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'organisers',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    locale: 'all',
    overrideAccess: false,
  })
  const organiser = res.docs[0] as unknown as RawOrganiser | undefined
  if (!organiser) return null
  const now = new Date().toISOString()
  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [published, { organiser: { equals: organiser.id } }, { activeUntil: { greater_than: now } }] },
      sort: 'startsAt',
      limit: 100,
      depth: 1,
      locale: 'all',
      select: eventSelect,
      populate,
      overrideAccess: true,
    }),
    payload.count({
      collection: 'events',
      where: { and: [published, { organiser: { equals: organiser.id } }, { activeUntil: { less_than_equal: now } }] },
      overrideAccess: true,
    }),
  ])
  return { organiser, upcoming: upcoming.docs as unknown as RawEvent[], pastCount: past.totalDocs }
}

export const getOrganiser = unstable_cache(findOrganiser, ['organiser-v1'], {
  tags: [CONTENT_TAG],
  revalidate: HOUR,
})

async function findVenue(slug: string): Promise<{
  venue: RawVenue & { isSample?: boolean | null; updatedAt?: string }
  upcoming: RawEvent[]
  past: RawEvent[]
} | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'venues',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  })
  const venue = res.docs[0] as unknown as (RawVenue & { isSample?: boolean | null }) | undefined
  if (!venue) return null
  const now = new Date().toISOString()
  const yearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()
  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [published, { venue: { equals: venue.id } }, { activeUntil: { greater_than: now } }] },
      sort: 'startsAt',
      limit: 100,
      depth: 1,
      locale: 'all',
      select: eventSelect,
      populate,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'events',
      where: {
        and: [
          published,
          { venue: { equals: venue.id } },
          { activeUntil: { less_than_equal: now } },
          { activeUntil: { greater_than: yearAgo } },
        ],
      },
      sort: '-startsAt',
      limit: 12,
      depth: 1,
      locale: 'all',
      select: eventSelect,
      populate,
      overrideAccess: true,
    }),
  ])
  return { venue, upcoming: upcoming.docs as unknown as RawEvent[], past: past.docs as unknown as RawEvent[] }
}

export const getVenue = unstable_cache(findVenue, ['venue-v1'], {
  tags: [CONTENT_TAG],
  revalidate: HOUR,
})

async function findSitemapEntries() {
  const payload = await getPayloadClient()
  const sixMonthsAgo = new Date(Date.now() - 183 * 24 * 3600 * 1000).toISOString()
  const [events, organisers] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { and: [published, { activeUntil: { greater_than: sixMonthsAgo } }] },
      limit: 5000,
      depth: 1,
      locale: 'all',
      select: {
        slug: true,
        city: true,
        category: true,
        title: true,
        updatedAt: true,
        activeUntil: true,
        isSample: true,
        image: true,
      },
      populate: { media: { filename: true, sizes: true } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'organisers',
      limit: 2000,
      depth: 0,
      select: { slug: true, updatedAt: true },
      overrideAccess: true,
    }),
  ])
  return {
    events: events.docs as unknown as Array<
      Pick<RawEvent, 'slug' | 'city' | 'category' | 'title' | 'updatedAt' | 'activeUntil' | 'isSample' | 'image'>
    >,
    organisers: organisers.docs as unknown as Array<{ slug?: string | null; updatedAt: string }>,
  }
}

export const getSitemapEntries = unstable_cache(findSitemapEntries, ['sitemap-v1'], {
  tags: [CONTENT_TAG],
  revalidate: HOUR,
})

/** Draft preview for signed-in staff. Never cached. */
export async function getEventForPreview(id: number): Promise<RawEvent | null> {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({
      collection: 'events',
      id,
      draft: true,
      depth: 2,
      locale: 'all',
      overrideAccess: true,
    })
    return doc as unknown as RawEvent
  } catch {
    return null
  }
}
