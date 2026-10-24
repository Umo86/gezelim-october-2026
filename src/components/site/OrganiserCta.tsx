import { HoverLink as Link } from './HoverLink'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { EventArt } from './EventArt'

/** The ask to organisers, at the bottom of listing pages. */
export function OrganiserCta({ lang, city }: { lang: Lang; city?: string }) {
  const t = getDictionary(lang).cta
  const href = city ? `${paths.addEvent(lang)}?city=${city}` : paths.addEvent(lang)
  return (
    <section className="wrap mt-20">
      <div className="grid overflow-hidden rounded-[8px] bg-fistik text-gece md:grid-cols-[1fr_16rem]">
        <div className="p-7 md:p-10">
          <h2 className="display text-[2.4rem] md:text-[3.4rem]">{t.title}</h2>
          <p className="mt-3 max-w-[44ch] text-[1.05rem]">{t.text}</p>
          <Link
            href={href}
            className="ui mt-6 inline-block rounded-full bg-gece px-5 py-2.5 text-ayran hover:bg-cini"
          >
            {t.button}
          </Link>
        </div>
        <div className="relative hidden min-h-full md:block">
          <EventArt seed="organiser-cta" motif="tulip" scheme={4} className="absolute inset-0" />
        </div>
      </div>
    </section>
  )
}
