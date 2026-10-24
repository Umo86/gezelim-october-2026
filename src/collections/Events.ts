import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
  Validate,
  PayloadRequest,
} from 'payload'
import { isStaff, publishedOrStaff, staffOnlyField } from '@/access'
import { ageOptions, categoryOptions, cityOptions, isSampleField, spokenOptions } from '@/fields/options'
import { revalidateContent } from '@/hooks/revalidate'
import { notifySearchEngines, pagesForEvent } from '@/lib/indexnow'
import { londonDayKey } from '@/lib/dates'
import { siteUrl } from '@/lib/site'
import { slugify } from '@/lib/slugify'
import { uniqueSlug } from '@/lib/uniqueSlug'
import { paths } from '@/i18n/paths'

const LONDON_TZ = {
  defaultTimezone: 'Europe/London',
  supportedTimezones: [{ label: 'Londra / London', value: 'Europe/London' }],
}

/** One slug for both languages: title + date, e.g. "anadolu-rock-gecesi-2026-10-31". */
const ensureSlug: CollectionBeforeChangeHook = async ({ data, req, originalDoc }) => {
  let slug: string | undefined = typeof data.slug === 'string' ? slugify(data.slug, 80) : undefined
  if (!slug && originalDoc?.slug) slug = originalDoc.slug
  if (!slug) {
    const title: string =
      typeof data.title === 'string' ? data.title : (data.title?.tr ?? data.title?.en ?? originalDoc?.title ?? '')
    const startsAt = data.startsAt ?? originalDoc?.startsAt
    const base = slugify(title || 'etkinlik', 60) || 'etkinlik'
    slug = startsAt ? `${base}-${londonDayKey(startsAt)}` : base
  }
  data.slug = await uniqueSlug({ req, collection: 'events', slug, id: originalDoc?.id })
  if (originalDoc?.slug && originalDoc.slug !== data.slug) {
    const previous = new Set<string>([...(originalDoc.previousSlugs ?? []), originalDoc.slug])
    previous.delete(data.slug)
    data.previousSlugs = [...previous]
  }
  return data
}

/** When an event stops being "upcoming": its end time, or four hours after it starts. */
const computeActiveUntil: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const startsAt = data.startsAt ?? originalDoc?.startsAt
  const endsAt = data.endsAt !== undefined ? data.endsAt : originalDoc?.endsAt
  if (endsAt) data.activeUntil = new Date(endsAt).toISOString()
  else if (startsAt) data.activeUntil = new Date(new Date(startsAt).getTime() + 4 * 3600 * 1000).toISOString()
  return data
}

/**
 * After a publish, an edit to a live event, or an unpublish: refresh the cached
 * pages and tell search engines which addresses changed. Saving a draft of a
 * live event changes nothing public, so it's ignored.
 */
type Ref = number | { id: number } | null | undefined
const refId = (value: Ref) => (value && typeof value === 'object' ? value.id : value)

/** A published event makes the organiser, venue and image it came with public too. */
async function releasePending(req: PayloadRequest, doc: { organiser?: Ref; venue?: Ref; image?: Ref }) {
  const targets = [
    ['organisers', refId(doc.organiser)],
    ['venues', refId(doc.venue)],
    ['media', refId(doc.image)],
  ] as const
  for (const [collection, id] of targets) {
    if (!id) continue
    await req.payload.update({
      collection,
      where: { and: [{ id: { equals: id } }, { pending: { equals: true } }] },
      data: { pending: false },
      overrideAccess: true,
      req,
      context: { disableRevalidate: true },
    })
  }
}

const afterEventChange: CollectionAfterChangeHook = async ({ doc, previousDoc, context, req }) => {
  if (context?.disableRevalidate) return doc
  if (doc?._status === 'published') await releasePending(req, doc)
  const isPublished = doc?._status === 'published'
  const wasPublished = previousDoc?._status === 'published'
  if (!isPublished && !wasPublished) return doc
  if (!isPublished && wasPublished) {
    // Either a real unpublish, or a draft saved on top of the live version.
    const live = await req.payload
      .findByID({ collection: 'events', id: doc.id, depth: 0, draft: false, overrideAccess: true, req })
      .catch(() => null)
    if (live?._status === 'published') return doc
  }
  revalidateContent()
  if (!doc.isSample) {
    const venue =
      typeof doc.venue === 'number'
        ? await req.payload.findByID({ collection: 'venues', id: doc.venue, depth: 0, overrideAccess: true, req }).catch(() => null)
        : doc.venue
    const pages = pagesForEvent({ ...doc, venue })
    if (previousDoc?.slug && (previousDoc.slug !== doc.slug || previousDoc.city !== doc.city)) {
      pages.push(...pagesForEvent({ ...previousDoc, venue: null }))
    }
    notifySearchEngines(pages)
  }
  return doc
}

const afterEventDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
  if (context?.disableRevalidate) return doc
  revalidateContent()
  if (doc?._status === 'published' && !doc.isSample) notifySearchEngines(pagesForEvent({ ...doc, venue: null }))
  return doc
}

const validateUrl: Validate = (value) => {
  if (!value) return true
  return /^https?:\/\/\S+\.\S+/.test(String(value)) || 'https:// ile başlamalı / Must start with https://'
}

const validateEnd: Validate = (value, { siblingData }) => {
  const start = (siblingData as { startsAt?: string })?.startsAt
  if (!value || !start) return true
  return new Date(String(value)) > new Date(start) || 'Bitiş başlangıçtan sonra olmalı / End must be after start'
}

const validatePriceTo: Validate = (value, { siblingData }) => {
  const from = (siblingData as { priceFrom?: number })?.priceFrom
  if (value == null || from == null) return true
  return Number(value) >= Number(from) || 'En yüksek fiyat en düşükten küçük olamaz / Must be at least the lowest price'
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: { tr: 'Etkinlik', en: 'Event' },
    plural: { tr: 'Etkinlikler', en: 'Events' },
  },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startsAt', 'city', 'category', '_status'],
    listSearchableFields: ['title', 'slug'],
    group: { tr: 'Etkinlikler', en: 'Events' },
    description: {
      tr: 'Formdan gelen etkinlikler taslak olarak bekler. Kontrol et, gerekirse düzenle, sonra Yayınla.',
      en: 'Events from the public form wait here as drafts. Check them, edit if needed, then Publish.',
    },
    preview: (doc, { locale }) => `${siteUrl()}${paths.preview(locale === 'en' ? 'en' : 'tr', String(doc.id))}`,
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
    readVersions: isStaff,
  },
  hooks: {
    beforeChange: [ensureSlug, computeActiveUntil],
    afterChange: [afterEventChange],
    afterDelete: [afterEventDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { tr: 'Etkinlik', en: 'Event' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { tr: 'Etkinlik adı', en: 'Event name' },
            },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              maxLength: 220,
              label: { tr: 'Kısa açıklama', en: 'Short description' },
              admin: {
                description: {
                  tr: 'Kartlarda ve Google sonuçlarında görünür. 1–2 cümle.',
                  en: 'Shown on cards and in Google results. One or two sentences.',
                },
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              label: { tr: 'Detaylı açıklama', en: 'Full description' },
            },
            {
              name: 'performers',
              type: 'array',
              label: { tr: 'Sahnede (sanatçılar)', en: 'Line-up' },
              labels: {
                singular: { tr: 'Sanatçı', en: 'Performer' },
                plural: { tr: 'Sanatçılar', en: 'Performers' },
              },
              admin: {
                description: {
                  tr: 'Her ismi ayrı ekle: Google sanatçı aramalarında etkinliği bu isimlerle eşleştirir.',
                  en: 'Add each name separately: Google matches artist searches to the event by these names.',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, label: { tr: 'Ad', en: 'Name' } },
                    {
                      name: 'kind',
                      type: 'select',
                      defaultValue: 'person',
                      label: { tr: 'Tür', en: 'Type' },
                      options: [
                        { label: { tr: 'Kişi', en: 'Person' }, value: 'person' },
                        { label: { tr: 'Grup', en: 'Group' }, value: 'group' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: { tr: 'Afiş ya da fotoğraf', en: 'Poster or photo' },
              admin: {
                description: {
                  tr: 'Dikey (4:5) afişler kartlarda en iyi görünür. Görsel yoksa site desenli bir afiş üretir.',
                  en: 'Portrait (4:5) posters look best on cards. Without an image the site draws a patterned poster.',
                },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'select',
                  required: true,
                  options: categoryOptions,
                  index: true,
                  label: { tr: 'Kategori', en: 'Category' },
                },
                {
                  name: 'eventLanguage',
                  type: 'select',
                  defaultValue: 'tr',
                  options: spokenOptions,
                  label: { tr: 'Etkinlik dili', en: 'Event language' },
                },
                {
                  name: 'ageLimit',
                  type: 'select',
                  defaultValue: 'all',
                  options: ageOptions,
                  label: { tr: 'Yaş sınırı', en: 'Age limit' },
                },
              ],
            },
          ],
        },
        {
          label: { tr: 'Tarih ve yer', en: 'Date and place' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  required: true,
                  index: true,
                  timezone: LONDON_TZ,
                  label: { tr: 'Başlangıç', en: 'Starts' },
                  admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15, displayFormat: 'd MMM yyyy HH:mm' } },
                },
                {
                  name: 'endsAt',
                  type: 'date',
                  timezone: LONDON_TZ,
                  label: { tr: 'Bitiş', en: 'Ends' },
                  validate: validateEnd,
                  admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15, displayFormat: 'd MMM yyyy HH:mm' } },
                },
              ],
            },
            {
              name: 'city',
              type: 'select',
              required: true,
              index: true,
              options: cityOptions,
              label: { tr: 'Şehir', en: 'City' },
              admin: {
                description: {
                  tr: 'Etkinliğin listeleneceği şehir. Küçük bir kasabadaysa en yakın büyük şehri seç.',
                  en: 'The city page that lists this event. For small towns, pick the nearest city.',
                },
              },
            },
            {
              name: 'venue',
              type: 'relationship',
              relationTo: 'venues',
              label: { tr: 'Mekan', en: 'Venue' },
            },
          ],
        },
        {
          label: { tr: 'Bilet', en: 'Tickets' },
          fields: [
            {
              name: 'isFree',
              type: 'checkbox',
              defaultValue: false,
              label: { tr: 'Ücretsiz etkinlik', en: 'Free event' },
            },
            {
              type: 'row',
              admin: { condition: (_, siblingData) => !siblingData?.isFree },
              fields: [
                { name: 'priceFrom', type: 'number', min: 0, label: { tr: 'En düşük fiyat (£)', en: 'Lowest price (£)' } },
                {
                  name: 'priceTo',
                  type: 'number',
                  min: 0,
                  validate: validatePriceTo,
                  label: { tr: 'En yüksek fiyat (£)', en: 'Highest price (£)' },
                },
              ],
            },
            {
              name: 'ticketUrl',
              type: 'text',
              validate: validateUrl,
              label: { tr: 'Bilet ya da kayıt bağlantısı', en: 'Ticket or registration link' },
            },
            {
              name: 'soldOut',
              type: 'checkbox',
              defaultValue: false,
              label: { tr: 'Biletler tükendi', en: 'Sold out' },
            },
          ],
        },
        {
          label: { tr: 'Başvuru bilgileri', en: 'Submission' },
          description: {
            tr: 'Formdan gönderildiyse, gönderen kişinin bilgileri. Sitede görünmez.',
            en: 'If this came from the public form: who sent it. Never shown on the site.',
          },
          fields: [
            {
              name: 'submission',
              type: 'group',
              label: false,
              access: { read: staffOnlyField },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'contactName', type: 'text', label: { tr: 'Gönderen', en: 'Sent by' } },
                    { name: 'contactEmail', type: 'email', label: { tr: 'E-posta', en: 'Email' } },
                    { name: 'contactPhone', type: 'text', label: { tr: 'Telefon', en: 'Phone' } },
                  ],
                },
                { name: 'organiserLink', type: 'text', label: { tr: 'Organizatör bağlantısı', en: 'Organiser link' } },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'writtenIn',
                      type: 'select',
                      label: { tr: 'Yazıldığı dil', en: 'Written in' },
                      options: [
                        { label: 'Türkçe', value: 'tr' },
                        { label: 'English', value: 'en' },
                      ],
                    },
                    { name: 'submittedAt', type: 'date', label: { tr: 'Gönderim', en: 'Submitted' }, admin: { readOnly: true } },
                    {
                      name: 'imageRightsConfirmed',
                      type: 'checkbox',
                      label: { tr: 'Görsel hakkı onaylandı', en: 'Image rights confirmed' },
                      admin: { readOnly: true },
                    },
                  ],
                },
                { name: 'notes', type: 'textarea', label: { tr: 'Ekip notları', en: 'Team notes' } },
                // A one-way hash of the sender's IP address, only for limiting repeat submissions.
                { name: 'ipHash', type: 'text', index: true, admin: { hidden: true } },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              localized: true,
              maxLength: 70,
              label: { tr: 'Sayfa başlığı (Google)', en: 'Page title (Google)' },
              admin: {
                description: {
                  tr: 'Boş bırakırsan etkinlik adı, şehir ve tarih kullanılır.',
                  en: 'Leave empty to use the event name, city and date.',
                },
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              localized: true,
              maxLength: 170,
              label: { tr: 'Açıklama (Google)', en: 'Description (Google)' },
              admin: {
                description: {
                  tr: 'Boş bırakırsan kısa açıklama kullanılır.',
                  en: 'Leave empty to use the short description.',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      label: { tr: 'Adres (slug)', en: 'URL slug' },
      admin: {
        position: 'sidebar',
        description: {
          tr: 'Boş bırakırsan ad ve tarihten oluşur. Yayından sonra değiştirmek eski bağlantıları bozar.',
          en: 'Fills itself from the name and date. Changing it after publishing breaks old links.',
        },
      },
    },
    {
      name: 'organiser',
      type: 'relationship',
      relationTo: 'organisers',
      label: { tr: 'Organizatör', en: 'Organiser' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'eventStatus',
      type: 'select',
      defaultValue: 'scheduled',
      label: { tr: 'Durum', en: 'Status' },
      options: [
        { label: { tr: 'Planlandığı gibi', en: 'Going ahead' }, value: 'scheduled' },
        { label: { tr: 'İptal edildi', en: 'Cancelled' }, value: 'cancelled' },
        { label: { tr: 'Ertelendi', en: 'Postponed' }, value: 'postponed' },
        { label: { tr: 'Tarihi değişti', en: 'New date' }, value: 'rescheduled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: { tr: 'Öne çıkar', en: 'Feature' },
      admin: {
        position: 'sidebar',
        description: { tr: 'Ana sayfada "Öne çıkanlar" bölümünde gösterilir.', en: 'Shown under "Featured" on home pages.' },
      },
    },
    isSampleField,
    {
      name: 'source',
      type: 'select',
      defaultValue: 'staff',
      label: { tr: 'Kaynak', en: 'Source' },
      options: [
        { label: { tr: 'Ekip ekledi', en: 'Added by staff' }, value: 'staff' },
        { label: { tr: 'Organizatör formu', en: 'Organiser form' }, value: 'form' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'activeUntil',
      type: 'date',
      index: true,
      admin: { hidden: true },
    },
    {
      // Old addresses keep working: the event page redirects them here (301).
      name: 'previousSlugs',
      type: 'text',
      hasMany: true,
      index: true,
      admin: { hidden: true },
    },
  ],
}

