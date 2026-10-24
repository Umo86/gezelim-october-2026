/**
 * The public address of the site, used for canonical links, sitemaps and
 * social cards. Set NEXT_PUBLIC_SITE_URL=https://gezelim.co in production.
 */
export function siteUrl(): string {
  // Vercel previews point at themselves, so links and share cards work on the preview address.
  if (process.env.VERCEL_ENV === 'preview') {
    const own = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
    if (own) return `https://${own}`
  }
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * True only on the live site, so previews, local builds and the *.vercel.app
 * address stay out of search engines. Indexing switches on when production has
 * NEXT_PUBLIC_SITE_URL set to the real domain.
 */
export function isProductionSite(): boolean {
  if (!process.env.NEXT_PUBLIC_SITE_URL) return false
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production'
  return process.env.NODE_ENV === 'production'
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@gezelim.co'

export const SOCIAL = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  whatsappChannel: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || '',
}
