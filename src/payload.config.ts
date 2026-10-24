import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { tr } from '@payloadcms/translations/languages/tr'
import { createHash } from 'node:crypto'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { Organisers } from './collections/Organisers'
import { Users } from './collections/Users'
import { Venues } from './collections/Venues'

/**
 * Signs admin sessions. PAYLOAD_SECRET is the proper setting. Without it, the secret
 * is derived from the database address, which is just as private (whoever holds that
 * address already has the whole database), so a deployment works with DATABASE_URL alone.
 */
function payloadSecret(): string {
  if (process.env.PAYLOAD_SECRET) return process.env.PAYLOAD_SECRET
  const database = process.env.DATABASE_URL
  if (!database) return '' // Payload refuses to start without a secret, which is what we want
  return createHash('sha256').update(`gezelim/payload-secret/${database}`).digest('hex')
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Photos go to Cloudflare R2 when its keys are set; otherwise to ./media on disk (local development). */
const r2Enabled = Boolean(
  process.env.R2_BUCKET && process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY,
)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Gezelim',
      description: 'Gezelim yönetim paneli',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/brand/icon.svg' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Icon#Icon',
      },
      beforeDashboard: ['/components/admin/BeforeDashboard#BeforeDashboard'],
    },
    dateFormat: 'd MMM yyyy, HH:mm',
    // No Gravatar: it would send a hash of each editor's email to a third party.
    avatar: 'default',
    timezones: {
      defaultTimezone: 'Europe/London',
      supportedTimezones: [{ label: 'Londra / London', value: 'Europe/London' }],
    },
  },
  collections: [Events, Venues, Organisers, Media, Users],
  localization: {
    locales: [
      { code: 'tr', label: 'Türkçe' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'tr',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { tr, en },
    fallbackLanguage: 'en',
  },
  editor: lexicalEditor(),
  secret: payloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true,
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: process.env.VERCEL ? 3 : 10,
    },
    // The schema only changes through migrations (src/migrations), in development too.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'hello@gezelim.co',
        defaultFromName: 'Gezelim',
      })
    : undefined,
  sharp,
  plugins: [
    s3Storage({
      enabled: r2Enabled,
      collections: {
        media: { prefix: 'media' },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
