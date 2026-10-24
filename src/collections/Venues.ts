import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { approvedOrStaff, isStaff } from '@/access'
import { cityOptions, isSampleField, pendingField, slugField } from '@/fields/options'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { uniqueSlug } from '@/lib/uniqueSlug'

export const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i

export function normalisePostcode(value: string): string {
  const m = value.trim().toUpperCase().match(UK_POSTCODE)
  return m ? `${m[1]} ${m[2]}` : value.trim().toUpperCase()
}

/** Fills in the map position from the postcode (postcodes.io, free, no key). */
const geocode: CollectionBeforeChangeHook = async ({ data, originalDoc }) => {
  const postcode: string | undefined = data.postcode ?? originalDoc?.postcode
  if (postcode) data.postcode = normalisePostcode(postcode)
  const postcodeChanged = data.postcode && data.postcode !== originalDoc?.postcode
  const missing = data.lat == null || data.lng == null
  if (data.postcode && (missing || postcodeChanged) && UK_POSTCODE.test(data.postcode)) {
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(data.postcode)}`, {
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const json = (await res.json()) as { result?: { latitude?: number; longitude?: number } }
        if (json.result?.latitude && json.result?.longitude) {
          data.lat = json.result.latitude
          data.lng = json.result.longitude
        }
      }
    } catch {
      // Offline or postcode not found: the venue still saves without a map pin.
    }
  }
  return data
}

export const Venues: CollectionConfig = {
  slug: 'venues',
  labels: {
    singular: { tr: 'Mekan', en: 'Venue' },
    plural: { tr: 'Mekanlar', en: 'Venues' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'postcode', 'updatedAt'],
    group: { tr: 'Etkinlikler', en: 'Events' },
    listSearchableFields: ['name', 'postcode', 'town'],
  },
  access: {
    read: approvedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [
      geocode,
      async ({ data, req, originalDoc }) => {
        if (data.slug) {
          data.slug = await uniqueSlug({ req, collection: 'venues', slug: data.slug, id: originalDoc?.id })
        }
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: { tr: 'Mekan adı', en: 'Venue name' } },
    slugField('name', { fallback: 'mekan' }),
    {
      name: 'city',
      type: 'select',
      required: true,
      options: cityOptions,
      label: { tr: 'Şehir', en: 'City' },
      admin: { description: { tr: 'En yakın büyük şehir.', en: 'The nearest listed city.' } },
    },
    { name: 'address', type: 'text', label: { tr: 'Adres', en: 'Street address' } },
    {
      type: 'row',
      fields: [
        { name: 'town', type: 'text', label: { tr: 'Semt ya da kasaba', en: 'Area or town' } },
        { name: 'postcode', type: 'text', label: { tr: 'Posta kodu', en: 'Postcode' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lat',
          type: 'number',
          label: { tr: 'Enlem', en: 'Latitude' },
          admin: { description: { tr: 'Posta kodundan otomatik dolar.', en: 'Filled from the postcode.' } },
        },
        { name: 'lng', type: 'number', label: { tr: 'Boylam', en: 'Longitude' } },
      ],
    },
    { name: 'website', type: 'text', label: { tr: 'Web sitesi', en: 'Website' } },
    isSampleField,
    pendingField,
  ],
}
