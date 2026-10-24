import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { SubmitEventForm } from '@/components/site/SubmitEventForm'
import { r2Configured } from '@/lib/storage'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { resolveRoute, type RouteParams } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  return pageMetadata({
    lang,
    title: t.form.title,
    description: t.cta.text,
    path: paths.addEvent(lang),
    alternates: { tr: paths.addEvent('tr'), en: paths.addEvent('en') },
  })
}

export default async function AddEventPage({ params }: { params: RouteParams }) {
  const { place, lang } = await resolveRoute(params)
  if (place.slug !== 'uk') permanentRedirect(`${paths.addEvent(lang)}?city=${place.slug}`)
  const t = getDictionary(lang)
  return (
    <div className="wrap pt-8 md:pt-12">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
          { name: t.form.title, href: paths.addEvent(lang) },
        ]}
      />
      <div className="max-w-4xl">
        <h1 className="display mt-4 text-[3rem] md:text-[5rem]">{t.form.title}</h1>
        <p className="mt-4 max-w-[60ch] text-[1.15rem]">{t.form.intro}</p>
        <SubmitEventForm
          lang={lang}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
          // On Vercel, uploads need R2 (the server's own disk is read-only).
          uploadsEnabled={r2Configured() || !process.env.VERCEL}
        />
      </div>
    </div>
  )
}
