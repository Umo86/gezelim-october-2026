import type { CollectionConfig } from 'payload'
import { anyone, isStaff, staffOnlyField } from '@/access'
import { isSampleField, slugField } from '@/fields/options'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'
import { uniqueSlug } from '@/lib/uniqueSlug'

export const Organisers: CollectionConfig = {
  slug: 'organisers',
  labels: {
    singular: { tr: 'Organizatör', en: 'Organiser' },
    plural: { tr: 'Organizatörler', en: 'Organisers' },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'verified', 'email', 'updatedAt'],
    group: { tr: 'Etkinlikler', en: 'Events' },
    listSearchableFields: ['name', 'email'],
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (data.slug) {
          data.slug = await uniqueSlug({ req, collection: 'organisers', slug: data.slug, id: originalDoc?.id })
        }
        return data
      },
    ],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { tr: 'Ad', en: 'Name' },
    },
    slugField('name'),
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: { tr: 'Kısa tanıtım', en: 'Short bio' },
      maxLength: 600,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { tr: 'Logo ya da fotoğraf', en: 'Logo or photo' },
    },
    {
      type: 'row',
      fields: [
        { name: 'website', type: 'text', label: { tr: 'Web sitesi', en: 'Website' } },
        { name: 'instagram', type: 'text', label: 'Instagram', admin: { description: '@kullaniciadi' } },
      ],
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: { tr: 'Doğrulandı', en: 'Verified' },
      admin: {
        position: 'sidebar',
        description: {
          tr: 'Organizatörle konuşup kim olduğunu teyit ettiysen işaretle.',
          en: 'Tick once you’ve confirmed who this organiser is.',
        },
      },
    },
    isSampleField,
    {
      type: 'collapsible',
      label: { tr: 'İletişim (sadece ekip görür)', en: 'Contact (staff only)' },
      fields: [
        { name: 'contactName', type: 'text', label: { tr: 'Kişi', en: 'Contact name' }, access: { read: staffOnlyField } },
        { name: 'email', type: 'email', label: { tr: 'E-posta', en: 'Email' }, index: true, access: { read: staffOnlyField } },
        { name: 'phone', type: 'text', label: { tr: 'Telefon', en: 'Phone' }, access: { read: staffOnlyField } },
      ],
    },
  ],
}
