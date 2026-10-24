import type { Metadata } from 'next'
import { permanentRedirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { resolveRoute, type RouteParams } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL } from '@/lib/site'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return []
}

/*
 * Plain-language privacy notice. Before launch: add the legal name and address
 * of the company running Gezelim, and have it reviewed.
 */
const COPY = {
  tr: {
    updated: 'Son güncelleme: Ekim 2026',
    sections: [
      {
        h: 'Kim olduğumuz',
        p: [`Gezelim, Birleşik Krallık'taki Türk etkinliklerini listeleyen bir sitedir. Kişisel verilerinle ilgili her konuda ${CONTACT_EMAIL} adresine yazabilirsin.`],
      },
      {
        h: 'Etkinlik eklediğinde topladığımız bilgiler',
        p: [
          'Etkinlik bilgileri (ad, açıklama, tarih, mekan, fiyat, görsel ve organizatör adı) sitede herkese açık yayınlanır.',
          'Adın, e-posta adresin ve telefon numaran yayınlanmaz. Bunları yalnızca etkinliği doğrulamak ve gerekirse sana soru sormak için kullanırız.',
        ],
      },
      {
        h: 'Siteyi gezerken',
        p: [
          'Dil tercihini hatırlamak için tarayıcına küçük bir çerez (gz_lang) kaydederiz. Reklam ya da takip çerezi kullanmıyoruz.',
          'Form gönderimlerinde spam’i önlemek için Cloudflare Turnstile kullanabiliriz.',
        ],
      },
      {
        h: 'Verilerin nerede saklanır',
        p: [
          'Site Vercel üzerinde çalışır; veritabanımız Neon’da (Londra bölgesi), görseller Cloudflare R2’de saklanır. E-postaları Resend üzerinden gönderiyoruz. Bu hizmetler verileri sadece bizim adımıza işler.',
          'Verilerini satmayız ve pazarlama için başkalarıyla paylaşmayız.',
        ],
      },
      {
        h: 'Hakların',
        p: [
          `Birleşik Krallık veri koruma kanunu (UK GDPR) kapsamında hakkındaki verilere erişme, düzeltme ve silinmesini isteme hakkın var. Talebin için ${CONTACT_EMAIL} adresine yaz. Yanıtımızdan memnun kalmazsan Information Commissioner’s Office’e (ico.org.uk) şikayette bulunabilirsin.`,
        ],
      },
    ],
  },
  en: {
    updated: 'Last updated: October 2026',
    sections: [
      {
        h: 'Who we are',
        p: [`Gezelim is a listings site for Turkish events across the UK. For anything about your personal data, email ${CONTACT_EMAIL}.`],
      },
      {
        h: 'What we collect when you add an event',
        p: [
          'Event details (name, description, date, venue, price, image and organiser name) are published on the site for everyone to see.',
          'Your name, email and phone number are never published. We only use them to check the event and, if needed, ask you about it.',
        ],
      },
      {
        h: 'When you browse',
        p: [
          'We save one small cookie (gz_lang) to remember your language. We don’t use advertising or tracking cookies.',
          'We may use Cloudflare Turnstile on forms to stop spam.',
        ],
      },
      {
        h: 'Where your data is kept',
        p: [
          'The site runs on Vercel; our database is with Neon (London region) and images are stored on Cloudflare R2. We send email through Resend. These providers process data only on our behalf.',
          'We don’t sell your data or share it with others for marketing.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          `Under UK data protection law (UK GDPR) you can ask to see, correct or delete the data we hold about you. Email ${CONTACT_EMAIL}. If you’re not happy with our answer, you can complain to the Information Commissioner’s Office (ico.org.uk).`,
        ],
      },
    ],
  },
} as const

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  return pageMetadata({
    lang,
    title: t.privacy.title,
    description: COPY[lang].sections[1].p[1],
    path: paths.privacy(lang),
    alternates: { tr: paths.privacy('tr'), en: paths.privacy('en') },
  })
}

export default async function PrivacyPage({ params }: { params: RouteParams }) {
  const { place, lang } = await resolveRoute(params)
  if (place.slug !== 'uk') permanentRedirect(paths.privacy(lang))
  const t = getDictionary(lang)
  const c = COPY[lang]
  return (
    <div className="wrap pt-8 md:pt-12">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
          { name: t.privacy.title, href: paths.privacy(lang) },
        ]}
      />
      <h1 className="display mt-6 text-[3rem] md:text-[5rem]">{t.privacy.title}</h1>
      <p className="ui mt-3 text-muted">{c.updated}</p>
      <div className="max-w-[68ch]">
        {c.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="display text-[1.9rem]">{s.h}</h2>
            {s.p.map((p) => (
              <p key={p} className="mt-3 text-[1.1rem]">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
