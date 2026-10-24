import '@fontsource-variable/archivo/standard.css'
import '../../globals.css'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ExpireEnded } from '@/components/site/ExpireEnded'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { LangCookie } from '@/components/site/LangSwitch'
import { getPlace } from '@/config/places'
import { DEFAULT_LANG, HTML_LANG, isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { siteUrl } from '@/lib/site'

type Params = Promise<{ place: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: raw } = await params
  const lang: Lang = isLang(raw) ? raw : DEFAULT_LANG
  const t = getDictionary(lang)
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `Gezelim · ${t.site.tagline}`, template: '%s · Gezelim' },
    description: t.site.description,
    applicationName: 'Gezelim',
    formatDetection: { telephone: false },
    // Site ownership for Google Search Console, Bing Webmaster Tools and Yandex (set in the environment).
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.YANDEX_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#1f3fbf',
  width: 'device-width',
  initialScale: 1,
}

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Params }) {
  const { place: rawPlace, lang: rawLang } = await params
  const lang: Lang = isLang(rawLang) ? rawLang : DEFAULT_LANG
  const place = getPlace(rawPlace)?.slug ?? 'uk'
  const t = getDictionary(lang)
  return (
    <html lang={HTML_LANG[lang]}>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">
          {t.nav.skip}
        </a>
        <Header place={place} lang={lang} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <LangCookie lang={lang} />
        <ExpireEnded />
      </body>
    </html>
  )
}
