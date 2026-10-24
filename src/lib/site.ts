/**
 * The public address of the site, used for canonical links, sitemaps and
 * social cards. Set NEXT_PUBLIC_SITE_URL=https://gezelim.co in production.
 */
export function siteUrl(): string {
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

/** True only on the live site, so previews and local builds stay out of search engines. */
export function isProductionSite(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production'
  return process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SITE_URL
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@gezelim.co'

export const SOCIAL = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  whatsappChannel: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || '',
}
