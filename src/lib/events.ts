import type { Motif } from '@/config/categories'
import { getCategory } from '@/config/categories'
import { getCity } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { hashString } from './art'
import { eventDayRange } from './dates'
import { has, pick, type LocalizedValue } from './localize'
import { slugify } from './slugify'

/* ---------- Shapes coming out of the database (read with locale: 'all') ---------- */

type L<T> = LocalizedValue<T> | T | null | undefined

export type RawMedia = {
  id: number
  filename?: string | null
  alt?: L<string>
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  sizes?: Record<string, { filename?: string | null; width?: number | null; height?: number | null } | undefined> | null
}

export type RawVenue = {
  id: number
  name: string
  slug?: string | null
  city: string
  address?: string | null
  town?: string | null
  postcode?: string | null
  lat?: number | null
  lng?: number | null
  website?: string | null
}

export type RawOrganiser = {
  id: number
  name: string
  slug?: string | null
  verified?: boolean | null
  bio?: L<string>
  logo?: RawMedia | number | null
  website?: string | null
  instagram?: string | null
  isSample?: boolean | null
}

export type RawEvent = {
  id: number
  title: L<string>
  slug?: string | null
  summary?: L<string>
  description?: L<unknown>
  category: string
  city: string
  startsAt: string
  endsAt?: string | null
  activeUntil?: string | null
  isFree?: boolean | null
  priceFrom?: number | null
  priceTo?: number | null
  ticketUrl?: string | null
  soldOut?: boolean | null
  eventStatus?: 'scheduled' | 'cancelled' | 'postponed' | 'rescheduled' | null
  eventLanguage?: 'tr' | 'en' | 'both' | 'none' | null
  ageLimit?: 'all' | '16' | '18' | null
  featured?: boolean | null
  isSample?: boolean | null
  image?: RawMedia | number | null
  venue?: RawVenue | number | null
  organiser?: RawOrganiser | number | null
  metaTitle?: L<string>
  metaDescription?: L<string>
  performers?: Array<{ name: string; kind?: 'person' | 'group' | null }> | null
  previousSlugs?: string[] | null
  updatedAt?: string
  _status?: 'draft' | 'published' | null
}

/* ---------- Images ---------- */

export type ImageData = {
  /** 4:5 crop, 640×800 */
  card: string | null
  /** 4:5 crop, 320×400 */
  thumb: string | null
  /** Whole image, 1080 wide */
  poster: string | null
  /** 1200×630 for social cards */
  og: string | null
  original: string | null
  width: number | null
  height: number | null
  posterWidth: number | null
  posterHeight: number | null
  alt: string
  /** CSS object-position from the focal point */
  position: string
}

const imgUrl = (filename?: string | null) => (filename ? `/img/${encodeURIComponent(filename)}` : null)

export function toImage(media: RawMedia | number | null | undefined, lang: Lang, fallbackAlt: string): ImageData | null {
  if (!media || typeof media === 'number' || !media.filename) return null
  const sizes = media.sizes || {}
  return {
    card: imgUrl(sizes.card?.filename) ?? imgUrl(media.filename),
    thumb: imgUrl(sizes.thumb?.filename) ?? imgUrl(sizes.card?.filename) ?? imgUrl(media.filename),
    poster: imgUrl(sizes.poster?.filename) ?? imgUrl(media.filename),
    og: imgUrl(sizes.og?.filename),
    original: imgUrl(media.filename),
    width: media.width ?? null,
    height: media.height ?? null,
    posterWidth: sizes.poster?.width ?? media.width ?? null,
    posterHeight: sizes.poster?.height ?? media.height ?? null,
    alt: pick<string>(media.alt, lang) || fallbackAlt,
    position: `${media.focalX ?? 50}% ${media.focalY ?? 50}%`,
  }
}

/**
 * The generated share image for an event without a photo (src/app/og). The version
 * changes whenever the event is edited, so WhatsApp and Facebook fetch it again
 * instead of showing a stale preview.
 */
export function shareImagePath(e: Pick<RawEvent, 'slug' | 'id' | 'updatedAt'>, lang: Lang): string {
  const slug = e.slug || String(e.id)
  const version = hashString(e.updatedAt ?? '').toString(36)
  return `/og/event/${lang}/${encodeURIComponent(slug)}.png?v=${version}`
}

/* ---------- Text helpers ---------- */

/** Turkish-aware folding for search: "Şölen" and "solen" match. */
export function fold(text: string): string {
  return slugify(text, 10_000).replace(/-/g, ' ')
}

const money = new Map<Lang, Intl.NumberFormat>()
export function formatMoney(value: number, lang: Lang): string {
  // £15 for whole pounds, £18.50 (or £18,50 in Turkish) otherwise.
  const decimals = Number.isInteger(value) ? 0 : 2
  const key = `${lang}-${decimals}` as Lang
  let f = money.get(key)
  if (!f) {
    f = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    money.set(key, f)
  }
  return f.format(value)
}

export function priceLabel(
  e: Pick<RawEvent, 'isFree' | 'priceFrom' | 'priceTo'>,
  lang: Lang,
): string | null {
  const t = getDictionary(lang).card
  if (e.isFree) return t.free
  const from = e.priceFrom ?? null
  const to = e.priceTo ?? null
  if (from != null && to != null && to > from) return `${formatMoney(from, lang)}–${formatMoney(to, lang)}`
  if (from != null) return from === 0 ? t.free : t.from(formatMoney(from, lang))
  return null
}

/* ---------- The shape pages and components use ---------- */

export type ListEvent = {
  id: number
  slug: string
  href: string
  title: string
  summary: string
  category: string
  categoryName: string
  motif: Motif
  city: string
  cityName: string
  startsAt: string
  endsAt: string | null
  activeUntil: string
  dayStart: string
  dayEnd: string
  price: string | null
  isFree: boolean
  soldOut: boolean
  status: 'scheduled' | 'cancelled' | 'postponed' | 'rescheduled'
  spoken: 'tr' | 'en' | 'both' | 'none'
  featured: boolean
  isSample: boolean
  image: ImageData | null
  venueName: string | null
  place: string | null
  organiserName: string | null
  /** False when this language falls back to the other one. */
  translated: boolean
  search: string
}

export function toListEvent(e: RawEvent, lang: Lang): ListEvent {
  const title = pick<string>(e.title, lang) || ''
  const category = getCategory(e.category)
  const city = getCity(e.city)
  const venue = e.venue && typeof e.venue === 'object' ? e.venue : null
  const organiser = e.organiser && typeof e.organiser === 'object' ? e.organiser : null
  const range = eventDayRange(e.startsAt, e.endsAt)
  const cityName = city?.name[lang] ?? e.city
  const area = venue?.town && venue.town !== cityName ? `${venue.town}, ${cityName}` : cityName
  const slug = e.slug || String(e.id)
  return {
    id: e.id,
    slug,
    href: paths.event(e.city, lang, slug),
    title,
    summary: pick<string>(e.summary, lang) || '',
    category: e.category,
    categoryName: category?.name[lang] ?? e.category,
    motif: category?.motif ?? 'star',
    city: e.city,
    cityName,
    startsAt: e.startsAt,
    endsAt: e.endsAt ?? null,
    activeUntil: e.activeUntil ?? e.endsAt ?? e.startsAt,
    dayStart: range.start,
    dayEnd: range.end,
    price: priceLabel(e, lang),
    isFree: Boolean(e.isFree),
    soldOut: Boolean(e.soldOut),
    status: e.eventStatus ?? 'scheduled',
    spoken: e.eventLanguage ?? 'tr',
    featured: Boolean(e.featured),
    isSample: Boolean(e.isSample),
    image: toImage(e.image, lang, title),
    venueName: venue?.name ?? null,
    place: area,
    organiserName: organiser?.name ?? null,
    translated: has(e.title, lang),
    search: fold(
      [
        title,
        venue?.name,
        venue?.town,
        organiser?.name,
        pick<string>(e.title, lang === 'tr' ? 'en' : 'tr'),
        ...(e.performers ?? []).map((p) => p.name),
      ]
        .filter(Boolean)
        .join(' '),
    ),
  }
}
