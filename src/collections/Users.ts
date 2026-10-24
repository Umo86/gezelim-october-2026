import type { CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin } from '@/access'

/** Gezelim staff. Organisers don't need accounts yet: they submit events through the public form. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { tr: 'Ekip üyesi', en: 'Team member' },
    plural: { tr: 'Ekip', en: 'Team' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: { tr: 'Yönetim', en: 'Admin' },
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 10,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    update: ({ req, id }) => {
      const user = req.user as { id: number | string; role?: string } | null
      if (!user) return false
      return user.role === 'admin' || String(user.id) === String(id)
    },
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first account (created on the admin "create first user" screen) is an admin.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { tr: 'Ad soyad', en: 'Name' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      label: { tr: 'Rol', en: 'Role' },
      options: [
        { label: { tr: 'Yönetici', en: 'Admin' }, value: 'admin' },
        { label: { tr: 'Editör', en: 'Editor' }, value: 'editor' },
      ],
      access: { update: adminOnlyField },
      admin: {
        description: {
          tr: 'Editörler etkinlikleri düzenler ve yayınlar. Yöneticiler ayrıca ekip üyelerini yönetir.',
          en: 'Editors edit and publish events. Admins can also manage the team.',
        },
      },
    },
  ],
}
