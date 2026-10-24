/*
 * Sample data.
 *   npm run seed         replace all sample records with a fresh set (dates relative to today)
 *   npm run seed:clear   remove every sample record and leave real content alone
 *   npm run seed -- no-images   skip the sample photos (all events get generated posters),
 *                        e.g. for a preview whose photo storage isn't set up yet
 *   npm run samples      the build step (part of npm run ci), driven by SAMPLE_EVENTS:
 *                        "on" fills an EMPTY database with the samples, "off" removes them,
 *                        anything else does nothing. It never fails the build.
 * Optional: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD create a first admin if none exists.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { addDays, londonDayKey, londonLocalToDate } from '../lib/dates'
import { plainTextToLexical } from '../lib/localize'
import { events, organisers, venues } from './data'
import { renderPoster } from './posters'

const SAMPLE_CREDIT = 'Örnek görsel / Sample image'
const quiet = { disableRevalidate: true }

async function clearSamples(payload: Payload) {
  const where = { isSample: { equals: true } }
  const ev = await payload.delete({ collection: 'events', where, overrideAccess: true, context: quiet })
  const ve = await payload.delete({ collection: 'venues', where, overrideAccess: true, context: quiet })
  const or = await payload.delete({ collection: 'organisers', where, overrideAccess: true, context: quiet })
  const me = await payload.delete({
    collection: 'media',
    where: { credit: { equals: SAMPLE_CREDIT } },
    overrideAccess: true,
    context: quiet,
  })
  payload.logger.info(
    `Removed sample records: ${ev.docs.length} events, ${ve.docs.length} venues, ${or.docs.length} organisers, ${me.docs.length} images`,
  )
}

function eventDates(e: (typeof events)[number]): { start: Date; end?: Date } | null {
  const today = londonDayKey(new Date())
  let dayKey: string
  if (e.fixedDate) {
    const year = Number(today.slice(0, 4))
    const pad = (n: number) => String(n).padStart(2, '0')
    dayKey = `${year}-${pad(e.fixedDate.month)}-${pad(e.fixedDate.day)}`
    if (dayKey < today) dayKey = `${year + 1}-${pad(e.fixedDate.month)}-${pad(e.fixedDate.day)}`
  } else {
    dayKey = addDays(today, e.day ?? 0)
  }
  const start = londonLocalToDate(dayKey, e.time)
  if (!e.endTime) return { start }
  let endKey = addDays(dayKey, e.span ?? 0)
  if (!e.span && e.endTime < e.time) endKey = addDays(dayKey, 1)
  return { start, end: londonLocalToDate(endKey, e.endTime) }
}

async function seed(payload: Payload, { images }: { images: boolean }) {
  await clearSamples(payload)

  const organiserIds = new Map<string, number>()
  for (const o of organisers) {
    const doc = await payload.create({
      collection: 'organisers',
      locale: 'tr',
      data: { name: o.name, bio: o.bio.tr, instagram: o.instagram, verified: Boolean(o.verified), isSample: true },
      overrideAccess: true,
      context: quiet,
    })
    await payload.update({
      collection: 'organisers',
      id: doc.id,
      locale: 'en',
      data: { bio: o.bio.en },
      overrideAccess: true,
      context: quiet,
    })
    organiserIds.set(o.key, doc.id)
  }

  const venueIds = new Map<string, number>()
  for (const v of venues) {
    const doc = await payload.create({
      collection: 'venues',
      data: { name: v.name, city: v.city as never, town: v.town, lat: v.lat, lng: v.lng, isSample: true },
      overrideAccess: true,
      context: quiet,
    })
    venueIds.set(v.key, doc.id)
  }

  const posterIds = new Map<string, number>()
  const posters = images ? (events.map((e) => e.poster).filter(Boolean) as string[]) : []
  for (const name of new Set(posters)) {
    try {
      const data = await renderPoster(name)
      const media = await payload.create({
        collection: 'media',
        locale: 'tr',
        data: { alt: `Örnek afiş: ${name}`, credit: SAMPLE_CREDIT },
        file: { data, mimetype: 'image/jpeg', name: `ornek-afis-${name}.jpg`, size: data.length },
        overrideAccess: true,
        context: quiet,
      })
      posterIds.set(name, media.id)
    } catch (err) {
      payload.logger.warn({ err }, `Could not create sample poster "${name}"`)
    }
  }

  let created = 0
  for (const e of events) {
    const dates = eventDates(e)
    if (!dates) continue
    const doc = await payload.create({
      collection: 'events',
      locale: 'tr',
      overrideAccess: true,
      context: quiet,
      data: {
        _status: 'published',
        title: e.title.tr,
        summary: e.summary.tr,
        description: plainTextToLexical(e.description.tr) as never,
        performers: (e.performers ?? []).map((p) => ({ name: p.name, kind: p.kind ?? 'person' })),
        category: e.category as never,
        eventLanguage: e.spoken,
        ageLimit: e.age ?? 'all',
        startsAt: dates.start.toISOString(),
        startsAt_tz: 'Europe/London',
        ...(dates.end ? { endsAt: dates.end.toISOString(), endsAt_tz: 'Europe/London' } : {}),
        city: e.city as never,
        venue: venueIds.get(e.venue),
        organiser: organiserIds.get(e.organiser),
        isFree: Boolean(e.free),
        priceFrom: e.priceFrom,
        priceTo: e.priceTo,
        ticketUrl: e.free ? undefined : 'https://example.com/biletler',
        soldOut: Boolean(e.soldOut),
        eventStatus: e.status ?? 'scheduled',
        featured: Boolean(e.featured),
        image: e.poster ? posterIds.get(e.poster) : undefined,
        isSample: true,
        source: 'staff',
      },
    })
    if (e.title.en) {
      await payload.update({
        collection: 'events',
        id: doc.id,
        locale: 'en',
        overrideAccess: true,
        context: quiet,
        data: {
          _status: 'published',
          title: e.title.en,
          summary: e.summary.en,
          ...(e.description.en ? { description: plainTextToLexical(e.description.en) as never } : {}),
        },
      })
    }
    created++
  }
  payload.logger.info(
    `Created ${created} sample events, ${venueIds.size} venues, ${organiserIds.size} organisers, ${posterIds.size} posters`,
  )
}

async function ensureAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) return
  const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
  if (totalDocs > 0) return
  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Admin', role: 'admin' },
    overrideAccess: true,
  })
  payload.logger.info(`Created admin user ${email}`)
}

const photoStorage = Boolean(
  process.env.R2_BUCKET && process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
)

async function fromEnv(payload: Payload) {
  const mode = process.env.SAMPLE_EVENTS
  if (mode === 'off') return clearSamples(payload)
  if (mode !== 'on') return
  const { totalDocs } = await payload.count({ collection: 'events', overrideAccess: true })
  if (totalDocs > 0) {
    payload.logger.info('SAMPLE_EVENTS=on, but the database already has events, so it is left alone')
    return
  }
  // On Vercel, uploads need R2: without it the samples use generated posters only.
  await seed(payload, { images: photoStorage || !process.env.VERCEL })
}

// `payload run` passes on plain words only (it swallows --flags), so the options are words.
const args = process.argv.slice(2)
const option = (name: string) => args.includes(name) || args.includes(`--${name}`)
const buildStep = option('from-env')
const payload = await getPayload({ config })
try {
  if (buildStep) {
    await fromEnv(payload)
  } else if (option('clear')) {
    await clearSamples(payload)
  } else {
    await ensureAdmin(payload)
    await seed(payload, { images: !option('no-images') })
  }
} catch (err) {
  payload.logger.error({ err }, 'Seeding failed')
  // Sample data is never worth a failed deployment.
  if (!buildStep) process.exitCode = 1
}
await payload.destroy?.()
process.exit(process.exitCode ?? 0)
