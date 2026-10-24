/**
 * Places that appear as the first URL segment: gezelim.co/<place>/<lang>/…
 *
 * "uk" is the national hub and lists every event. Each city lists the events
 * an organiser filed under it. To add a city: add it here, then run
 * `npm run payload migrate:create` (the city list is a database enum) and deploy.
 */

export type Nation = 'england' | 'scotland' | 'wales' | 'northern-ireland'

export type Place = {
  slug: string
  kind: 'country' | 'city'
  name: { tr: string; en: string }
  /** Turkish locative, used in headings: "Londra'da" → "Londra'daki Türk etkinlikleri" */
  inTr: string
  /** English phrase used in headings: "in London" → "Turkish events in London" */
  inEn: string
  nation?: Nation
  lat: number
  lng: number
  /** Shown first in pickers and on the UK home page */
  major?: boolean
}

export const UK: Place = {
  slug: 'uk',
  kind: 'country',
  name: { tr: 'Tüm Birleşik Krallık', en: 'All of the UK' },
  inTr: "Birleşik Krallık'ta",
  inEn: 'across the UK',
  lat: 54.0,
  lng: -2.5,
}

export const CITIES: Place[] = [
  { slug: 'london', kind: 'city', name: { tr: 'Londra', en: 'London' }, inTr: "Londra'da", inEn: 'in London', nation: 'england', lat: 51.5074, lng: -0.1278, major: true },
  { slug: 'birmingham', kind: 'city', name: { tr: 'Birmingham', en: 'Birmingham' }, inTr: "Birmingham'da", inEn: 'in Birmingham', nation: 'england', lat: 52.4862, lng: -1.8904, major: true },
  { slug: 'manchester', kind: 'city', name: { tr: 'Manchester', en: 'Manchester' }, inTr: "Manchester'da", inEn: 'in Manchester', nation: 'england', lat: 53.4808, lng: -2.2426, major: true },
  { slug: 'leeds', kind: 'city', name: { tr: 'Leeds', en: 'Leeds' }, inTr: "Leeds'te", inEn: 'in Leeds', nation: 'england', lat: 53.8008, lng: -1.5491, major: true },
  { slug: 'liverpool', kind: 'city', name: { tr: 'Liverpool', en: 'Liverpool' }, inTr: "Liverpool'da", inEn: 'in Liverpool', nation: 'england', lat: 53.4084, lng: -2.9916, major: true },
  { slug: 'glasgow', kind: 'city', name: { tr: 'Glasgow', en: 'Glasgow' }, inTr: "Glasgow'da", inEn: 'in Glasgow', nation: 'scotland', lat: 55.8642, lng: -4.2518, major: true },
  { slug: 'edinburgh', kind: 'city', name: { tr: 'Edinburg', en: 'Edinburgh' }, inTr: "Edinburg'da", inEn: 'in Edinburgh', nation: 'scotland', lat: 55.9533, lng: -3.1883, major: true },
  { slug: 'bristol', kind: 'city', name: { tr: 'Bristol', en: 'Bristol' }, inTr: "Bristol'da", inEn: 'in Bristol', nation: 'england', lat: 51.4545, lng: -2.5879, major: true },
  { slug: 'cardiff', kind: 'city', name: { tr: 'Cardiff', en: 'Cardiff' }, inTr: "Cardiff'te", inEn: 'in Cardiff', nation: 'wales', lat: 51.4816, lng: -3.1791, major: true },
  { slug: 'leicester', kind: 'city', name: { tr: 'Leicester', en: 'Leicester' }, inTr: "Leicester'da", inEn: 'in Leicester', nation: 'england', lat: 52.6369, lng: -1.1398 },
  { slug: 'sheffield', kind: 'city', name: { tr: 'Sheffield', en: 'Sheffield' }, inTr: "Sheffield'da", inEn: 'in Sheffield', nation: 'england', lat: 53.3811, lng: -1.4701 },
  { slug: 'nottingham', kind: 'city', name: { tr: 'Nottingham', en: 'Nottingham' }, inTr: "Nottingham'da", inEn: 'in Nottingham', nation: 'england', lat: 52.9548, lng: -1.1581 },
  { slug: 'coventry', kind: 'city', name: { tr: 'Coventry', en: 'Coventry' }, inTr: "Coventry'de", inEn: 'in Coventry', nation: 'england', lat: 52.4068, lng: -1.5197 },
  { slug: 'luton', kind: 'city', name: { tr: 'Luton', en: 'Luton' }, inTr: "Luton'da", inEn: 'in Luton', nation: 'england', lat: 51.8787, lng: -0.42 },
  { slug: 'milton-keynes', kind: 'city', name: { tr: 'Milton Keynes', en: 'Milton Keynes' }, inTr: "Milton Keynes'te", inEn: 'in Milton Keynes', nation: 'england', lat: 52.0406, lng: -0.7594 },
  { slug: 'northampton', kind: 'city', name: { tr: 'Northampton', en: 'Northampton' }, inTr: "Northampton'da", inEn: 'in Northampton', nation: 'england', lat: 52.2405, lng: -0.9027 },
  { slug: 'reading', kind: 'city', name: { tr: 'Reading', en: 'Reading' }, inTr: "Reading'de", inEn: 'in Reading', nation: 'england', lat: 51.4543, lng: -0.9781 },
  { slug: 'oxford', kind: 'city', name: { tr: 'Oxford', en: 'Oxford' }, inTr: "Oxford'da", inEn: 'in Oxford', nation: 'england', lat: 51.752, lng: -1.2577 },
  { slug: 'cambridge', kind: 'city', name: { tr: 'Cambridge', en: 'Cambridge' }, inTr: "Cambridge'de", inEn: 'in Cambridge', nation: 'england', lat: 52.2053, lng: 0.1218 },
  { slug: 'brighton', kind: 'city', name: { tr: 'Brighton', en: 'Brighton' }, inTr: "Brighton'da", inEn: 'in Brighton', nation: 'england', lat: 50.8225, lng: -0.1372 },
  { slug: 'southampton', kind: 'city', name: { tr: 'Southampton', en: 'Southampton' }, inTr: "Southampton'da", inEn: 'in Southampton', nation: 'england', lat: 50.9097, lng: -1.4044 },
  { slug: 'portsmouth', kind: 'city', name: { tr: 'Portsmouth', en: 'Portsmouth' }, inTr: "Portsmouth'ta", inEn: 'in Portsmouth', nation: 'england', lat: 50.8198, lng: -1.088 },
  { slug: 'bournemouth', kind: 'city', name: { tr: 'Bournemouth', en: 'Bournemouth' }, inTr: "Bournemouth'ta", inEn: 'in Bournemouth', nation: 'england', lat: 50.7192, lng: -1.8808 },
  { slug: 'newcastle', kind: 'city', name: { tr: 'Newcastle', en: 'Newcastle' }, inTr: "Newcastle'da", inEn: 'in Newcastle', nation: 'england', lat: 54.9783, lng: -1.6178 },
  { slug: 'bradford', kind: 'city', name: { tr: 'Bradford', en: 'Bradford' }, inTr: "Bradford'da", inEn: 'in Bradford', nation: 'england', lat: 53.796, lng: -1.7594 },
  { slug: 'stoke-on-trent', kind: 'city', name: { tr: 'Stoke-on-Trent', en: 'Stoke-on-Trent' }, inTr: "Stoke-on-Trent'te", inEn: 'in Stoke-on-Trent', nation: 'england', lat: 53.0027, lng: -2.1794 },
  { slug: 'peterborough', kind: 'city', name: { tr: 'Peterborough', en: 'Peterborough' }, inTr: "Peterborough'da", inEn: 'in Peterborough', nation: 'england', lat: 52.5695, lng: -0.2405 },
  { slug: 'norwich', kind: 'city', name: { tr: 'Norwich', en: 'Norwich' }, inTr: "Norwich'te", inEn: 'in Norwich', nation: 'england', lat: 52.6309, lng: 1.2974 },
  { slug: 'swansea', kind: 'city', name: { tr: 'Swansea', en: 'Swansea' }, inTr: "Swansea'de", inEn: 'in Swansea', nation: 'wales', lat: 51.6214, lng: -3.9436 },
  { slug: 'aberdeen', kind: 'city', name: { tr: 'Aberdeen', en: 'Aberdeen' }, inTr: "Aberdeen'de", inEn: 'in Aberdeen', nation: 'scotland', lat: 57.1497, lng: -2.0943 },
  { slug: 'dundee', kind: 'city', name: { tr: 'Dundee', en: 'Dundee' }, inTr: "Dundee'de", inEn: 'in Dundee', nation: 'scotland', lat: 56.462, lng: -2.9707 },
  { slug: 'belfast', kind: 'city', name: { tr: 'Belfast', en: 'Belfast' }, inTr: "Belfast'ta", inEn: 'in Belfast', nation: 'northern-ireland', lat: 54.5973, lng: -5.9301 },
]

export const PLACES: Place[] = [UK, ...CITIES]

const BY_SLUG = new Map(PLACES.map((p) => [p.slug, p]))

export function getPlace(slug: string | undefined | null): Place | undefined {
  if (!slug) return undefined
  return BY_SLUG.get(slug)
}

export function getCity(slug: string | undefined | null): Place | undefined {
  const place = getPlace(slug)
  return place?.kind === 'city' ? place : undefined
}

export function isPlaceSlug(slug: string): boolean {
  return BY_SLUG.has(slug)
}

export const CITY_SLUGS = CITIES.map((c) => c.slug)

export const NATION_NAMES: Record<Nation, { tr: string; en: string }> = {
  england: { tr: 'İngiltere', en: 'England' },
  scotland: { tr: 'İskoçya', en: 'Scotland' },
  wales: { tr: 'Galler', en: 'Wales' },
  'northern-ireland': { tr: 'Kuzey İrlanda', en: 'Northern Ireland' },
}

/** Cities sorted for pickers: major cities first (in list order), then A–Z by local name. */
export function citiesForPicker(lang: 'tr' | 'en'): Place[] {
  const major = CITIES.filter((c) => c.major)
  const rest = CITIES.filter((c) => !c.major).sort((a, b) =>
    a.name[lang].localeCompare(b.name[lang], lang === 'tr' ? 'tr-TR' : 'en-GB'),
  )
  return [...major, ...rest]
}
