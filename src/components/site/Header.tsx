import { HoverLink as Link } from './HoverLink'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { CityPicker } from './CityPicker'
import { LangSwitch } from './LangSwitch'
import { MobileMenu } from './MobileMenu'
import { Wordmark } from './Wordmark'

export function Header({ place, lang }: { place: string; lang: Lang }) {
  const t = getDictionary(lang)
  return (
    <header className="sticky top-0 z-40 border-b border-gece/10 bg-ayran/95 backdrop-blur-sm">
      <div className="wrap flex h-16 items-center gap-3 sm:gap-5">
        <Link href={paths.home(place, lang)} aria-label={t.site.homeLink} className="shrink-0 py-2">
          <Wordmark className="h-[1.75rem] w-auto text-gece sm:h-[2rem]" title="Gezelim" />
        </Link>
        <CityPicker lang={lang} current={place} />
        <nav aria-label={t.nav.menu} className="ml-auto hidden items-center gap-6 md:flex">
          <Link href={paths.events(place, lang)} className="ui text-[0.95rem] text-gece hover:underline">
            {t.nav.events}
          </Link>
          <Link href={paths.about(lang)} className="ui text-[0.95rem] text-gece hover:underline">
            {t.nav.about}
          </Link>
          <LangSwitch lang={lang} />
          <Link
            href={paths.addEvent(lang)}
            className="ui rounded-full bg-cini px-4 py-2 text-[0.95rem] text-ayran hover:bg-cini-deep"
          >
            {t.nav.addEvent}
          </Link>
        </nav>
        <MobileMenu lang={lang} place={place} className="ml-auto md:hidden" />
      </div>
    </header>
  )
}
