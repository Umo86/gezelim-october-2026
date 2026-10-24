import { createHash } from 'crypto'
import path from 'path'
import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { slugify } from '@/lib/slugify'

/**
 * Gives every upload a name that includes a hash of its content, so the
 * public /img/… address can be cached for a year without ever going stale.
 */
const hashFilename: CollectionBeforeOperationHook = ({ args, operation }) => {
  const file = args?.req?.file
  if ((operation === 'create' || operation === 'update') && file?.data && file.name) {
    const ext = path.extname(file.name).toLowerCase()
    const base = slugify(path.basename(file.name, ext), 40) || 'gorsel'
    const hash = createHash('sha1').update(file.data).digest('hex').slice(0, 10)
    file.name = `${base}-${hash}${ext}`
  }
  return args
}

const webp = (quality: number) => ({ format: 'webp' as const, options: { quality } })

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { tr: 'Görsel', en: 'Image' },
    plural: { tr: 'Görseller', en: 'Images' },
  },
  admin: {
    group: { tr: 'İçerik', en: 'Content' },
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeOperation: [hashFilename],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    crop: true,
    // Originals are kept at most 2400px on the long side, as WebP.
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    formatOptions: webp(84),
    imageSizes: [
      // Poster cards are 4:5, cropped around the focal point.
      { name: 'thumb', width: 320, height: 400, formatOptions: webp(78) },
      { name: 'card', width: 640, height: 800, formatOptions: webp(80) },
      // The event page shows the whole poster, uncropped.
      { name: 'poster', width: 1080, withoutEnlargement: true, formatOptions: webp(82) },
      // Social sharing cards (WhatsApp, Facebook, X): the whole poster on brand blue, never cropped.
      {
        name: 'og',
        width: 1200,
        height: 630,
        fit: 'contain',
        background: '#1F3FBF',
        formatOptions: { format: 'jpeg', options: { quality: 84 } },
      },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: { tr: 'Açıklama (alt metin)', en: 'Description (alt text)' },
      admin: {
        description: {
          tr: 'Görme engelliler ve Google için görselde ne olduğunu kısaca yaz.',
          en: 'Briefly describe what the image shows, for screen readers and Google.',
        },
      },
    },
    {
      name: 'credit',
      type: 'text',
      label: { tr: 'Görsel kaynağı', en: 'Credit' },
    },
  ],
}
