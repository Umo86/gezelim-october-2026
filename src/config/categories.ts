/**
 * Event categories. `value` is what the database stores (and never changes);
 * `slug` is what appears in the URL for each language.
 * Adding a category means adding it here, then running `npm run payload migrate:create`.
 */

export type Motif = 'star' | 'cintemani' | 'tulip' | 'rosette' | 'kilim'

export type Category = {
  value: string
  slug: { tr: string; en: string }
  /** Navigation label */
  name: { tr: string; en: string }
  /** Used in headings: "Londra'daki Türk konserleri", "Turkish concerts in London" */
  phrase: { tr: string; en: string }
  /** schema.org Event subtype for structured data */
  schemaType: string
  /** Pattern used for artwork when an event has no photo */
  motif: Motif
}

export const CATEGORIES: Category[] = [
  {
    value: 'concerts',
    slug: { tr: 'konserler', en: 'concerts' },
    name: { tr: 'Konserler', en: 'Concerts' },
    phrase: { tr: 'Türk konserleri', en: 'Turkish concerts' },
    schemaType: 'MusicEvent',
    motif: 'star',
  },
  {
    value: 'nightlife',
    slug: { tr: 'gece-hayati', en: 'nightlife' },
    name: { tr: 'Parti ve gece hayatı', en: 'Parties and nightlife' },
    phrase: { tr: 'Türk partileri', en: 'Turkish parties and club nights' },
    schemaType: 'SocialEvent',
    motif: 'rosette',
  },
  {
    value: 'comedy',
    slug: { tr: 'stand-up', en: 'comedy' },
    name: { tr: 'Stand-up ve komedi', en: 'Stand-up and comedy' },
    phrase: { tr: 'Türk stand-up gösterileri', en: 'Turkish stand-up and comedy' },
    schemaType: 'ComedyEvent',
    motif: 'cintemani',
  },
  {
    value: 'theatre',
    slug: { tr: 'tiyatro', en: 'theatre' },
    name: { tr: 'Tiyatro', en: 'Theatre' },
    phrase: { tr: 'Türk tiyatro oyunları', en: 'Turkish theatre' },
    schemaType: 'TheaterEvent',
    motif: 'cintemani',
  },
  {
    value: 'festivals',
    slug: { tr: 'festivaller', en: 'festivals' },
    name: { tr: 'Festivaller', en: 'Festivals' },
    phrase: { tr: 'Türk festivalleri', en: 'Turkish festivals' },
    schemaType: 'Festival',
    motif: 'star',
  },
  {
    value: 'family',
    slug: { tr: 'aile-cocuk', en: 'family' },
    name: { tr: 'Aile ve çocuk', en: 'Family and kids' },
    phrase: { tr: 'Türk aile ve çocuk etkinlikleri', en: "Turkish family and kids' events" },
    schemaType: 'ChildrensEvent',
    motif: 'tulip',
  },
  {
    value: 'community',
    slug: { tr: 'topluluk', en: 'community' },
    name: { tr: 'Topluluk ve kutlamalar', en: 'Community and celebrations' },
    phrase: { tr: 'Türk topluluk etkinlikleri', en: 'Turkish community events' },
    schemaType: 'SocialEvent',
    motif: 'tulip',
  },
  {
    value: 'ramadan-eid',
    slug: { tr: 'ramazan-bayram', en: 'ramadan-eid' },
    name: { tr: 'Ramazan ve bayram', en: 'Ramadan and Eid' },
    phrase: { tr: 'Türk iftar ve bayram etkinlikleri', en: 'Turkish iftar and Eid events' },
    schemaType: 'SocialEvent',
    motif: 'tulip',
  },
  {
    value: 'arts-culture',
    slug: { tr: 'kultur-sanat', en: 'arts-culture' },
    name: { tr: 'Kültür ve sanat', en: 'Arts and culture' },
    phrase: { tr: 'Türk kültür ve sanat etkinlikleri', en: 'Turkish arts and culture events' },
    schemaType: 'ExhibitionEvent',
    motif: 'rosette',
  },
  {
    value: 'film',
    slug: { tr: 'sinema', en: 'film' },
    name: { tr: 'Sinema', en: 'Film' },
    phrase: { tr: 'Türk film gösterimleri', en: 'Turkish film screenings' },
    schemaType: 'ScreeningEvent',
    motif: 'cintemani',
  },
  {
    value: 'food-drink',
    slug: { tr: 'yeme-icme', en: 'food-drink' },
    name: { tr: 'Yeme içme', en: 'Food and drink' },
    phrase: { tr: 'Türk yemek etkinlikleri', en: 'Turkish food and drink events' },
    schemaType: 'FoodEvent',
    motif: 'kilim',
  },
  {
    value: 'sport',
    slug: { tr: 'spor', en: 'sport' },
    name: { tr: 'Spor ve maç yayınları', en: 'Sport and match screenings' },
    phrase: { tr: 'Türk spor etkinlikleri ve maç yayınları', en: 'Turkish sport and match screenings' },
    schemaType: 'SocialEvent',
    motif: 'kilim',
  },
  {
    value: 'business',
    slug: { tr: 'is-networking', en: 'business' },
    name: { tr: 'İş ve networking', en: 'Business and networking' },
    phrase: { tr: 'Türk iş ve networking etkinlikleri', en: 'Turkish business and networking events' },
    schemaType: 'BusinessEvent',
    motif: 'kilim',
  },
  {
    value: 'talks-workshops',
    slug: { tr: 'soylesi-atolye', en: 'talks-workshops' },
    name: { tr: 'Söyleşi ve atölye', en: 'Talks and workshops' },
    phrase: { tr: 'Türk söyleşi ve atölyeleri', en: 'Turkish talks and workshops' },
    schemaType: 'EducationEvent',
    motif: 'rosette',
  },
]

const BY_VALUE = new Map(CATEGORIES.map((c) => [c.value, c]))

export function getCategory(value: string | null | undefined): Category | undefined {
  if (!value) return undefined
  return BY_VALUE.get(value)
}

/** Finds a category by its URL slug in either language. */
export function getCategoryBySlug(slug: string): { category: Category; lang: 'tr' | 'en' } | undefined {
  for (const category of CATEGORIES) {
    if (category.slug.tr === slug) return { category, lang: 'tr' }
    if (category.slug.en === slug) return { category, lang: 'en' }
  }
  return undefined
}

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)
