import { HoverLink as Link } from './HoverLink'
import { CATEGORIES } from '@/config/categories'
import { citiesForPicker } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { CONTACT_EMAIL } from '@/lib/site'
import { Frieze } from './Frieze'
import { Wordmark } from './Wordmark'

export function Footer({ lang }: { lang: Lang }) {
  const t = getDictionary(lang)
  const cities = citiesForPicker(lang)
  const linkClass = 'text-ayran/85 hover:text-ayran hover:underline'
  return (
    <footer className="mt-24 bg-gece text-ayran">
      <Frieze ground="#0F1A33" ink="#2B47C9" dot="#FF5A3C" />
      <div className="wrap grid gap-12 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark className="h-9 w-auto text-ayran" title="Gezelim" />
          <p className="mt-5 max-w-sm text-ayran/80">{t.footer.about}</p>
          <Link
            href={paths.addEvent(lang)}
            className="ui mt-6 inline-block rounded-full bg-ayran px-4 py-2 text-[0.95rem] text-gece hover:bg-white"
          >
            {t.nav.addEvent}
          </Link>
        </div>
        <div className="md:col-span-4">
          <h2 className="ui text-[0.95rem] text-ayran/60">{t.footer.cities}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.95rem] sm:grid-cols-3 md:grid-cols-2">
            <li>
              <Link href={paths.home('uk', lang)} className={linkClass}>
                {t.picker.allUk}
              </Link>
            </li>
            {cities.map((c) => (
              <li key={c.slug}>
                <Link href={paths.home(c.slug, lang)} className={linkClass}>
                  {c.name[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="ui text-[0.95rem] text-ayran/60">{t.footer.categories}</h2>
          <ul className="mt-3 space-y-1.5 text-[0.95rem]">
            {CATEGORIES.map((c) => (
              <li key={c.value}>
                <Link href={paths.category('uk', lang, c)} className={linkClass}>
                  {c.name[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="ui text-[0.95rem] text-ayran/60">{t.footer.company}</h2>
          <ul className="mt-3 space-y-1.5 text-[0.95rem]">
            <li>
              <Link href={paths.about(lang)} className={linkClass}>
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link href={paths.addEvent(lang)} className={linkClass}>
                {t.nav.addEvent}
              </Link>
            </li>
            <li>
              <Link href={paths.privacy(lang)} className={linkClass}>
                {t.nav.privacy}
              </Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-white/15 py-6 text-[0.875rem] text-ayran/65">
        <p>
          © {new Date().getFullYear()} Gezelim. {t.footer.rights}
        </p>
        <p>{t.site.tagline}</p>
      </div>
    </footer>
  )
}
