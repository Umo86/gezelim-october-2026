import { APIError, type CollectionConfig } from 'payload'
import { adminOnlyField, isAdmin } from '@/access'
import { siteUrl } from '@/lib/site'

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
    forgotPassword: {
      // A full address: Payload's default link is relative, which doesn't work in an email.
      generateEmailSubject: () => 'Gezelim: şifre yenileme / password reset',
      generateEmailHTML: (args) => {
        const link = `${siteUrl()}/admin/reset/${encodeURIComponent(String(args?.token ?? ''))}`
        return `<p>Gezelim yönetim paneli şifreni yenilemek için bu bağlantıyı aç (1 saat geçerli):<br/>To reset your Gezelim admin password, open this link (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin. / If you didn’t ask for this, ignore this email.</p>`
      },
    },
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
      // Anyone who reaches /admin before the owner could claim it, so when FIRST_ADMIN_EMAIL
      // is set only that address may.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true, req })
          if (totalDocs === 0) {
            const owner = process.env.FIRST_ADMIN_EMAIL?.trim().toLowerCase()
            if (owner && String(data.email ?? '').trim().toLowerCase() !== owner) {
              throw new APIError('The first account must use the owner’s email address.', 403, undefined, true)
            }
            data.role = 'admin'
          }
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
