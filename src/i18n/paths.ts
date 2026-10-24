import type { Category } from '@/config/categories'
import { SEGMENTS, type Lang } from './config'

/** Builds public URLs. Every address is /<place>/<lang>/<localised words>. */
export const paths = {
  home: (place: string, lang: Lang) => `/${place}/${lang}`,
  events: (place: string, lang: Lang) => `/${place}/${lang}/${SEGMENTS.events[lang]}`,
  category: (place: string, lang: Lang, category: Category) =>
    `/${place}/${lang}/${SEGMENTS.events[lang]}/${category.slug[lang]}`,
  /** Events always live under their own city. */
  event: (city: string, lang: Lang, slug: string) => `/${city}/${lang}/${SEGMENTS.event[lang]}/${slug}`,
  organiser: (lang: Lang, slug: string) => `/uk/${lang}/${SEGMENTS.organisers[lang]}/${slug}`,
  addEvent: (lang: Lang) => `/uk/${lang}/${SEGMENTS['add-event'][lang]}`,
  about: (lang: Lang) => `/uk/${lang}/${SEGMENTS.about[lang]}`,
  privacy: (lang: Lang) => `/uk/${lang}/${SEGMENTS.privacy[lang]}`,
  preview: (lang: Lang, id: string | number) => `/uk/${lang}/${SEGMENTS.preview[lang]}/${id}`,
  /** Venues live under their own city: /london/tr/mekan/lale-hall */
  venue: (city: string, lang: Lang, slug: string) => `/${city}/${lang}/${SEGMENTS.places[lang]}/${slug}`,
  /** Date pages: /london/tr/etkinlikler/bu-hafta-sonu */
  when: (place: string, lang: Lang, when: When) => `/${place}/${lang}/${SEGMENTS.events[lang]}/${WHEN_SLUGS[when][lang]}`,
}

/** Date pages, each a real crawlable URL under the events list. */
export const WHEN_VALUES = ['today', 'tomorrow', 'weekend', 'week', 'next-week'] as const
export type When = (typeof WHEN_VALUES)[number]

export const WHEN_SLUGS: Record<When, { tr: string; en: string }> = {
  today: { tr: 'bugun', en: 'today' },
  tomorrow: { tr: 'yarin', en: 'tomorrow' },
  weekend: { tr: 'bu-hafta-sonu', en: 'this-weekend' },
  week: { tr: 'bu-hafta', en: 'this-week' },
  'next-week': { tr: 'gelecek-hafta', en: 'next-week' },
}

/** Finds a date page by its URL slug in either language. */
export function getWhenBySlug(slug: string): { when: When; lang: Lang } | undefined {
  for (const when of WHEN_VALUES) {
    if (WHEN_SLUGS[when].tr === slug) return { when, lang: 'tr' }
    if (WHEN_SLUGS[when].en === slug) return { when, lang: 'en' }
  }
  return undefined
}
