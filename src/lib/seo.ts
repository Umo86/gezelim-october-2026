import type { Metadata } from 'next'
import { OG_LOCALE, otherLang, type Lang } from '@/i18n/config'
import { absoluteUrl, isProductionSite } from './site'

type Args = {
  lang: Lang
  title: string
  description: string
  /** This page's path, e.g. /london/tr/etkinlikler */
  path: string
  /** The same page in each language. Only list languages the page really exists in. */
  alternates?: Partial<Record<Lang, string>>
  /** Point search engines at another URL instead (e.g. an untranslated page → its original). */
  canonical?: string
  image?: string | null
  noindex?: boolean
  type?: 'website' | 'article'
  /** Use the title as-is, without the " · Gezelim" suffix. */
  absoluteTitle?: boolean
}

const DEFAULT_OG = '/brand/og-default.png'

/** Title, description, canonical, hreflang and social cards for a page. */
export function pageMetadata(args: Args): Metadata {
  const { lang, title, description, path, alternates = {}, image, noindex, type = 'website', absoluteTitle } = args
  const canonical = absoluteUrl(args.canonical ?? path)
  const languages: Record<string, string> = {}
  if (alternates.tr) languages.tr = absoluteUrl(alternates.tr)
  if (alternates.en) languages.en = absoluteUrl(alternates.en)
  if (alternates.tr && alternates.en) languages['x-default'] = absoluteUrl(alternates.en)
  const ogImage = absoluteUrl(image || DEFAULT_OG)
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical, languages: Object.keys(languages).length ? languages : undefined },
    openGraph: {
      type,
      url: absoluteUrl(path),
      title,
      description,
      siteName: 'Gezelim',
      locale: OG_LOCALE[lang],
      alternateLocale: alternates[otherLang(lang)] ? [OG_LOCALE[otherLang(lang)]] : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    robots:
      noindex || !isProductionSite()
        ? { index: false, follow: true }
        : // Lets Google show posters large in results and Discover.
          { index: true, follow: true, 'max-image-preview': 'large' },
  }
}
