'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import type { Where } from 'payload'
import { CATEGORY_VALUES } from '@/config/categories'
import { CITY_SLUGS, getCity } from '@/config/places'
import { isLang, otherLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { normalisePostcode, UK_POSTCODE } from '@/collections/Venues'
import { addDays, londonLocalToDate } from '@/lib/dates'
import { fold } from '@/lib/events'
import { plainTextToLexical, truncate } from '@/lib/localize'
import { getPayloadClient } from '@/lib/queries'
import { siteUrl } from '@/lib/site'

export type SubmitResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string>; message: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{2}:\d{2}$/
const URL_RE = /^https?:\/\/[^\s.]+\.\S+$/i
const INSTAGRAM = /^(?:https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?(?:[?#]\S*)?|@[A-Za-z0-9._]{1,30})$/
// Matches the browser-side resize; under the 4 MB request limit with room for the text fields.
const MAX_IMAGE = 3.5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
// No real field comes close; anything longer is a script, rejected before any parsing.
const MAX_FIELD = 20_000
// Repeat submissions: per sender (hashed IP address) and in total, per hour.
const PER_SENDER_PER_HOUR = 5
const TOTAL_PER_HOUR = 60

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/** Hosts a Turnstile token may come from: the site itself and its Vercel addresses. */
function allowedHosts(): string[] {
  const hosts = [new URL(siteUrl()).hostname, 'localhost']
  for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']) {
    const value = process.env[name]
    if (value) hosts.push(value.split(':')[0])
  }
  return hosts
}

async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // Not set up yet; the rate limits below still apply.
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    })
    const json = (await res.json()) as { success?: boolean; hostname?: string }
    if (!json.success) return false
    const host = json.hostname?.replace(/^www\./, '')
    return !host || allowedHosts().some((h) => h.replace(/^www\./, '') === host)
  } catch {
    return false
  }
}

/** A one-way hash of the sender's IP address: enough to count repeats, useless for anything else. */
async function senderHash(): Promise<string | null> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || '').trim()
  if (!ip) return null
  const salt = process.env.PAYLOAD_SECRET || process.env.DATABASE_URL || 'gezelim'
  return createHash('sha256').update(`gezelim/ip/${salt}/${ip}`).digest('hex').slice(0, 24)
}

function text(form: FormData, name: string): string {
  const v = form.get(name)
  return typeof v === 'string' ? v.trim() : ''
}

function money(value: string): number | null | 'invalid' {
  if (!value) return null
  const n = Number(value.replace(',', '.').replace(/[£\s]/g, ''))
  if (!Number.isFinite(n) || n < 0 || n > 100000) return 'invalid'
  return Math.round(n * 100) / 100
}

/** For matching venue names: Turkish-aware, case- and punctuation-blind. */
const sameName = (a: string, b: string) => {
  const norm = (s: string) => fold(s).replace(/[^a-z0-9]+/g, ' ').trim()
  return norm(a) === norm(b)
}

export async function submitEvent(form: FormData): Promise<SubmitResult> {
  const lang: Lang = isLang(form.get('lang')) ? (form.get('lang') as Lang) : 'tr'
  const e = getDictionary(lang).form.errors
  const errors: Record<string, string> = {}
  const fail = (): SubmitResult => ({ ok: false, errors, message: e.summary })
  const spam: SubmitResult = { ok: false, errors: {}, message: e.spam }

  // Cheap checks first: oversized fields, an invisible field bots fill in, and the time
  // spent on the form (measured in the browser, so clock differences don't matter).
  for (const value of form.values()) if (typeof value === 'string' && value.length > MAX_FIELD) return spam
  if (text(form, 'website_confirm')) return spam
  const elapsed = Number(text(form, 'elapsed'))
  if (!Number.isFinite(elapsed) || elapsed <= 0) return spam
  if (elapsed < 4000) return { ok: false, errors: {}, message: e.tooFast }

  const writtenIn: Lang = text(form, 'writtenIn') === 'en' ? 'en' : 'tr'
  const title = text(form, 'title')
  const summaryRaw = text(form, 'summary')
  const description = text(form, 'description')
  const performers = text(form, 'performers')
    .split(/[,\n;]+/)
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 12)
  const titleOther = text(form, 'titleOther')
  const summaryOther = text(form, 'summaryOther')
  const category = text(form, 'category')
  const spoken = text(form, 'spoken')
  const age = text(form, 'age')
  const city = text(form, 'city')
  const date = text(form, 'date')
  const startTime = text(form, 'startTime')
  let endDate = text(form, 'endDate')
  const endTime = text(form, 'endTime')
  const venueName = text(form, 'venueName')
  const address = text(form, 'address')
  const town = text(form, 'town')
  const postcodeRaw = text(form, 'postcode')
  const isFree = form.get('isFree') === 'on'
  const priceFrom = isFree ? null : money(text(form, 'priceFrom'))
  const priceTo = isFree ? null : money(text(form, 'priceTo'))
  const ticketUrl = text(form, 'ticketUrl')
  const organiserName = text(form, 'organiserName')
  const organiserLink = text(form, 'organiserLink')
  const contactName = text(form, 'contactName')
  const email = text(form, 'email').toLowerCase()
  const phone = text(form, 'phone')
  const imageRights = form.get('imageRights') === 'on'
  const consent = form.get('consent') === 'on'
  const image = form.get('image')
  const file = image instanceof File && image.size > 0 ? image : null

  const required: Array<[string, string]> = [
    ['title', title],
    ['description', description],
    ['category', category],
    ['city', city],
    ['date', date],
    ['startTime', startTime],
    ['venueName', venueName],
    ['postcode', postcodeRaw],
    ['organiserName', organiserName],
    ['contactName', contactName],
    ['email', email],
  ]
  for (const [name, value] of required) if (!value) errors[name] = e.required

  const maxLen: Array<[string, string, number]> = [
    ['title', title, 140],
    ['summary', summaryRaw, 200],
    ['description', description, 5000],
    ['titleOther', titleOther, 140],
    ['summaryOther', summaryOther, 200],
    ['venueName', venueName, 120],
    ['address', address, 200],
    ['town', town, 80],
    ['postcode', postcodeRaw, 10],
    ['organiserName', organiserName, 120],
    ['organiserLink', organiserLink, 300],
    ['contactName', contactName, 120],
    ['email', email, 254],
    ['phone', phone, 40],
    ['ticketUrl', ticketUrl, 500],
  ]
  for (const [name, value, max] of maxLen) if (value.length > max && !errors[name]) errors[name] = e.tooLong(max)

  if (performers.some((p) => p.length > 80)) errors.performers = e.tooLong(80)
  if (category && !CATEGORY_VALUES.includes(category)) errors.category = e.required
  if (city && !CITY_SLUGS.includes(city)) errors.city = e.required
  // The length limit above runs first: the pattern is only ever tested on short input.
  if (email && !errors.email && !EMAIL.test(email)) errors.email = e.email
  if (ticketUrl && !errors.ticketUrl && !URL_RE.test(ticketUrl)) errors.ticketUrl = e.url
  if (postcodeRaw && !errors.postcode && !UK_POSTCODE.test(postcodeRaw)) errors.postcode = e.postcode
  if (priceFrom === 'invalid') errors.priceFrom = e.price
  if (priceTo === 'invalid') errors.priceTo = e.price
  if (typeof priceFrom === 'number' && typeof priceTo === 'number' && priceTo < priceFrom) errors.priceTo = e.priceOrder
  if (!consent) errors.consent = e.consent

  let startsAt: Date | null = null
  let endsAt: Date | null = null
  if (date && !DATE.test(date)) errors.date = e.required
  if (startTime && !TIME.test(startTime)) errors.startTime = e.required
  if (!errors.date && !errors.startTime && date && startTime) {
    startsAt = londonLocalToDate(date, startTime)
    if (startsAt.getTime() < Date.now() - 60 * 60 * 1000) errors.date = e.past
    else if (startsAt.getTime() > Date.now() + 2 * 365 * 24 * 3600 * 1000) errors.date = e.tooFar
    if (endDate || endTime) {
      if (endDate && !DATE.test(endDate)) errors.endDate = e.required
      else if (endTime && !TIME.test(endTime)) errors.endTime = e.required
      else {
        // "22:00 until 03:00" with no end date means the next morning.
        if (!endDate) endDate = endTime < startTime ? addDays(date, 1) : date
        endsAt = londonLocalToDate(endDate, endTime || '23:00')
        if (endsAt <= startsAt) errors.endTime = e.endBeforeStart
      }
    }
  }

  if (file) {
    if (!IMAGE_TYPES.includes(file.type)) errors.image = e.imageType
    else if (file.size > MAX_IMAGE) errors.image = e.imageSize
    else if (!imageRights) errors.imageRights = e.imageRights
  }

  if (Object.keys(errors).length || !startsAt) return fail()

  // Turnstile tokens work once, so verify only when everything else is right:
  // a form sent back for corrections keeps its token for the next try.
  if (!(await verifyTurnstile(text(form, 'cf-turnstile-response') || null))) return spam

  const payload = await getPayloadClient()
  const quiet = { disableRevalidate: true }
  const summary = summaryRaw || truncate(description, 200)
  const postcode = normalisePostcode(postcodeRaw)
  const ipHash = await senderHash()

  try {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = (extra: Where[]) =>
      payload.count({
        collection: 'events',
        where: { and: [{ source: { equals: 'form' } }, { createdAt: { greater_than: hourAgo } }, ...extra] },
        overrideAccess: true,
      })
    const [mine, everyone] = await Promise.all([
      ipHash ? recent([{ 'submission.ipHash': { equals: ipHash } }]) : Promise.resolve({ totalDocs: 0 }),
      recent([]),
    ])
    if (mine.totalDocs >= PER_SENDER_PER_HOUR || everyone.totalDocs >= TOTAL_PER_HOUR) {
      return { ok: false, errors: {}, message: e.tooMany }
    }

    const notes: string[] = []

    // Organiser: reuse the record for this email, otherwise create one (unverified, hidden
    // until the event is published). A verified organiser is never linked automatically:
    // anyone can type a known address, so staff confirm and link it themselves.
    const existingOrganiser = (
      await payload.find({
        collection: 'organisers',
        where: { email: { equals: email } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
    ).docs[0]
    const link = organiserLink && URL_RE.test(organiserLink) && !INSTAGRAM.test(organiserLink) ? organiserLink : ''
    const instagram = INSTAGRAM.test(organiserLink) ? organiserLink : ''
    let organiserId: number | undefined
    if (existingOrganiser?.verified) {
      notes.push(
        `E-posta doğrulanmış organizatörle eşleşiyor: ${existingOrganiser.name} (#${existingOrganiser.id}). ` +
          `Gönderenin yazdığı ad: ${organiserName}. Teyit edip organizatörü elle bağla.`,
      )
    } else if (existingOrganiser) {
      organiserId = existingOrganiser.id
    } else {
      organiserId = (
        await payload.create({
          collection: 'organisers',
          data: {
            name: organiserName,
            website: link || undefined,
            instagram: instagram || undefined,
            email,
            phone: phone || undefined,
            contactName,
            pending: true,
          },
          overrideAccess: true,
          context: quiet,
        })
      ).id
    }

    // Venue: reuse one with the same name at the same postcode, otherwise create one (hidden
    // until the event is published).
    const candidates = await payload.find({
      collection: 'venues',
      where: { postcode: { equals: postcode } },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    const venueId =
      candidates.docs.find((v) => sameName(v.name, venueName))?.id ??
      (
        await payload.create({
          collection: 'venues',
          data: {
            name: venueName,
            city: city as never,
            address: address || undefined,
            town: town || undefined,
            postcode,
            pending: true,
          },
          overrideAccess: true,
          context: quiet,
        })
      ).id

    let imageId: number | undefined
    if (file) {
      try {
        const media = await payload.create({
          collection: 'media',
          locale: writtenIn,
          data: { alt: title, credit: organiserName, pending: true },
          file: {
            data: Buffer.from(await file.arrayBuffer()),
            mimetype: file.type,
            name: file.name || 'afis.jpg',
            size: file.size,
          },
          overrideAccess: true,
          context: quiet,
        })
        imageId = media.id
      } catch (err) {
        // A failed upload shouldn't lose the whole submission; staff can add the image later.
        payload.logger.error({ err }, 'Event submission: image upload failed')
        notes.push('Afiş yüklenemedi; gönderenden tekrar iste.')
      }
    }

    const event = await payload.create({
      collection: 'events',
      locale: writtenIn,
      draft: true,
      overrideAccess: true,
      data: {
        _status: 'draft',
        title,
        summary,
        description: plainTextToLexical(description) as never,
        performers: performers.map((name) => ({ name, kind: 'person' as const })),
        category: category as never,
        eventLanguage: (['tr', 'en', 'both', 'none'].includes(spoken) ? spoken : 'tr') as never,
        ageLimit: (['all', '16', '18'].includes(age) ? age : 'all') as never,
        startsAt: startsAt.toISOString(),
        startsAt_tz: 'Europe/London',
        ...(endsAt ? { endsAt: endsAt.toISOString(), endsAt_tz: 'Europe/London' } : {}),
        city: city as never,
        venue: venueId,
        organiser: organiserId,
        isFree,
        priceFrom: typeof priceFrom === 'number' ? priceFrom : undefined,
        priceTo: typeof priceTo === 'number' ? priceTo : undefined,
        ticketUrl: ticketUrl || undefined,
        image: imageId,
        source: 'form',
        submission: {
          contactName,
          contactEmail: email,
          contactPhone: phone || undefined,
          organiserLink: organiserLink || undefined,
          writtenIn,
          submittedAt: new Date().toISOString(),
          imageRightsConfirmed: Boolean(file && imageRights),
          notes: notes.length ? notes.join('\n') : undefined,
          ipHash: ipHash ?? undefined,
        },
      },
    })

    if (titleOther || summaryOther) {
      await payload.update({
        collection: 'events',
        id: event.id,
        locale: otherLang(writtenIn),
        draft: true,
        overrideAccess: true,
        data: {
          ...(titleOther ? { title: titleOther } : {}),
          ...(summaryOther ? { summary: summaryOther } : {}),
        },
      })
    }

    const notify = process.env.ADMIN_NOTIFY_EMAIL
    if (notify && process.env.RESEND_API_KEY) {
      const cityName = getCity(city)?.name.tr ?? city
      await payload
        .sendEmail({
          to: notify,
          // Header values can't carry line breaks; the title is user input.
          subject: `Yeni etkinlik: ${title} (${cityName})`.replace(/[\r\n]+/g, ' '),
          html: `<p><strong>${escapeHtml(title)}</strong><br/>${escapeHtml(cityName)}, ${date} ${startTime}<br/>Gönderen: ${escapeHtml(contactName)} &lt;${escapeHtml(email)}&gt;</p><p><a href="${siteUrl()}/admin/collections/events/${event.id}">Yönetim panelinde aç</a></p>`,
        })
        .catch((err: unknown) => payload.logger.error({ err }, 'Event submission: notification email failed'))
    }

    return { ok: true }
  } catch (err) {
    payload.logger.error({ err }, 'Event submission failed')
    return { ok: false, errors: {}, message: e.server }
  }
}
