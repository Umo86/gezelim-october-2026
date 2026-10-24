import 'server-only'
import { notFound } from 'next/navigation'
import { getPlace, type Place } from '@/config/places'
import { isLang, type Lang } from '@/i18n/config'
import type { When } from '@/i18n/paths'
import { toListEvent, type ListEvent } from './events'
import { getUpcomingEvents } from './queries'

export type RouteParams = Promise<{ place: string; lang: string }>

/** Validates /<place>/<lang>; anything else is a 404. */
export async function resolveRoute(params: RouteParams): Promise<{ place: Place; lang: Lang }> {
  const { place: rawPlace, lang } = await params
  const place = getPlace(rawPlace)
  if (!place || !isLang(lang)) notFound()
  return { place, lang }
}

/** Upcoming events for a place, ready to render in one language. */
export async function upcomingFor(place: Place, lang: Lang): Promise<ListEvent[]> {
  const raw = await getUpcomingEvents(place.kind === 'city' ? place.slug : null)
  return raw.map((e) => toListEvent(e, lang))
}

/** "Londra'daki Türk etkinlikleri" / "Turkish events in London" */
export function placeHeading(place: Place, lang: Lang): string {
  if (lang === 'tr') return `${place.inTr}ki Türk etkinlikleri`
  return `Turkish events ${place.inEn}`
}

/** "Londra'daki Türk konserleri" / "Turkish concerts in London" */
export function categoryHeading(place: Place, lang: Lang, phrase: { tr: string; en: string }): string {
  if (lang === 'tr') return `${place.inTr}ki ${phrase.tr}`
  return `${phrase.en} ${place.inEn}`
}

const WHEN_TR: Record<When, string> = {
  today: 'Bugün',
  tomorrow: 'Yarın',
  weekend: 'Bu hafta sonu',
  week: 'Bu hafta',
  'next-week': 'Gelecek hafta',
}
const WHEN_EN: Record<When, string> = {
  today: 'today',
  tomorrow: 'tomorrow',
  weekend: 'this weekend',
  week: 'this week',
  'next-week': 'next week',
}

/** "Bu hafta sonu Londra'daki Türk etkinlikleri" / "Turkish events in London this weekend" */
export function whenHeading(place: Place, lang: Lang, when: When): string {
  if (lang === 'tr') return `${WHEN_TR[when]} ${place.inTr}ki Türk etkinlikleri`
  return `Turkish events ${place.inEn} ${WHEN_EN[when]}`
}
