import type { Metadata } from 'next'
import { HoverLink as Link } from '@/components/site/HoverLink'
import { permanentRedirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { EventArt } from '@/components/site/EventArt'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { resolveRoute, type RouteParams } from '@/lib/route'
import { pageMetadata } from '@/lib/seo'
import { CONTACT_EMAIL } from '@/lib/site'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return []
}

const COPY = {
  tr: {
    lead: "Gezelim, Birleşik Krallık'taki Türk etkinliklerini tek yerde toplar: konserler, stand-up gösterileri, festivaller, iftarlar, çocuk etkinlikleri, maç yayınları ve daha fazlası.",
    sections: [
      {
        h: 'Neden Gezelim?',
        p: [
          'Türk etkinlikleri genelde WhatsApp gruplarında, Instagram hikayelerinde ve kulaktan kulağa duyuluyor. Haberin olduğunda biletler tükenmiş ya da etkinlik geçmiş oluyor.',
          'Gezelim bunları şehir şehir ve tarih tarih düzenler. Londra’da da olsan Glasgow’da da, bu hafta sonu ne var tek bakışta görürsün.',
        ],
      },
      {
        h: 'Organizatörler için',
        p: [
          'Etkinlik eklemek ücretsiz. Formu doldurursun, biz kontrol eder ve genelde bir iş günü içinde yayına alırız. Bilet satışın kendi sayfanda kalır; biz okuru oraya yönlendiririz.',
        ],
      },
      {
        h: 'İki dilde',
        p: [
          'Site Türkçe ve İngilizce. Türkiye’den yeni gelenler de, burada büyüyen ikinci kuşak da, Türk kültürünü merak eden arkadaşları da aynı etkinlikleri kendi dillerinde bulur.',
        ],
      },
    ],
    contact: 'Soru, öneri ya da iş birliği için:',
  },
  en: {
    lead: 'Gezelim brings Turkish events across the UK into one place: concerts, stand-up, festivals, iftars, family days, match screenings and more.',
    sections: [
      {
        h: 'Why Gezelim?',
        p: [
          'Turkish events usually spread through WhatsApp groups, Instagram stories and word of mouth. By the time you hear about one, it’s sold out or it’s over.',
          'Gezelim sorts them by city and by date. Whether you’re in London or Glasgow, you can see what’s on this weekend at a glance.',
        ],
      },
      {
        h: 'For organisers',
        p: [
          'Listing an event is free. Fill in the form, we check it and usually publish it within one working day. Ticket sales stay on your own page; we send readers there.',
        ],
      },
      {
        h: 'In two languages',
        p: [
          'The site is in Turkish and English, so new arrivals from Turkey, the second generation who grew up here, and friends curious about Turkish culture can all find the same events in their own language.',
        ],
      },
    ],
    contact: 'For questions, ideas or partnerships:',
  },
} as const

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { lang } = await resolveRoute(params)
  const t = getDictionary(lang)
  return pageMetadata({
    lang,
    title: t.about.title,
    description: COPY[lang].lead,
    path: paths.about(lang),
    alternates: { tr: paths.about('tr'), en: paths.about('en') },
  })
}

export default async function AboutPage({ params }: { params: RouteParams }) {
  const { place, lang } = await resolveRoute(params)
  if (place.slug !== 'uk') permanentRedirect(paths.about(lang))
  const t = getDictionary(lang)
  const c = COPY[lang]
  return (
    <div className="wrap pt-8 md:pt-12">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: lang === 'tr' ? 'Birleşik Krallık' : 'UK', href: paths.home('uk', lang) },
          { name: t.about.title, href: paths.about(lang) },
        ]}
      />
      <div className="mt-6 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="display text-[3rem] md:text-[5rem]">{t.about.title}</h1>
          <p className="mt-5 text-[1.3rem] leading-snug">{c.lead}</p>
          {c.sections.map((s) => (
            <section key={s.h} className="mt-10">
              <h2 className="display text-[2rem]">{s.h}</h2>
              {s.p.map((p) => (
                <p key={p} className="mt-3 max-w-[64ch] text-[1.1rem]">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-10 text-[1.1rem]">
            {c.contact}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-cini underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          </p>
          <Link
            href={paths.addEvent(lang)}
            className="ui mt-8 inline-block rounded-full bg-cini px-6 py-3 text-ayran hover:bg-cini-deep"
          >
            {t.nav.addEvent}
          </Link>
        </div>
        <div className="hidden md:col-span-4 md:col-start-9 md:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px]">
            <EventArt seed="about-gezelim" motif="star" scheme={0} title="Gezelim" className="absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
