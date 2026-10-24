export const LANGS = ['tr', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = 'tr'

/** Remembers the reader's language for "/" and "/<city>" redirects. Set in the browser only. */
export const LANG_COOKIE = 'gz_lang'

export const HTML_LANG: Record<Lang, string> = { tr: 'tr', en: 'en-GB' }
export const INTL_LOCALE: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB' }
export const OG_LOCALE: Record<Lang, string> = { tr: 'tr_TR', en: 'en_GB' }

export function isLang(value: unknown): value is Lang {
  return value === 'tr' || value === 'en'
}

export function otherLang(lang: Lang): Lang {
  return lang === 'tr' ? 'en' : 'tr'
}

/**
 * URL words per language. The app's folders use the English word;
 * the proxy rewrites the Turkish word to it and redirects mismatches.
 */
export const SEGMENTS = {
  events: { tr: 'etkinlikler', en: 'events' },
  event: { tr: 'etkinlik', en: 'event' },
  organisers: { tr: 'organizatorler', en: 'organisers' },
  'add-event': { tr: 'etkinlik-ekle', en: 'add-event' },
  about: { tr: 'hakkimizda', en: 'about' },
  privacy: { tr: 'gizlilik', en: 'privacy' },
  preview: { tr: 'onizleme', en: 'preview' },
  places: { tr: 'mekan', en: 'places' },
} as const

export type SegmentKey = keyof typeof SEGMENTS

/** Turkish URL word → folder name */
export const TR_TO_FOLDER: Record<string, SegmentKey> = Object.fromEntries(
  (Object.keys(SEGMENTS) as SegmentKey[]).map((key) => [SEGMENTS[key].tr, key]),
)

/** English URL word → folder name */
export const EN_TO_FOLDER: Record<string, SegmentKey> = Object.fromEntries(
  (Object.keys(SEGMENTS) as SegmentKey[]).map((key) => [SEGMENTS[key].en, key]),
)
