'use client'

import { HoverLink as Link } from '@/components/site/HoverLink'
import { useParams } from 'next/navigation'
import { EventArt } from '@/components/site/EventArt'
import { getPlace } from '@/config/places'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'

export default function NotFound() {
  const params = useParams<{ place?: string; lang?: string }>()
  const lang: Lang = isLang(params?.lang) ? params.lang : 'tr'
  const place = getPlace(params?.place)?.slug ?? 'uk'
  const t = getDictionary(lang).notFound
  return (
    <div className="wrap grid items-center gap-10 py-16 md:grid-cols-12 md:py-24">
      <div className="md:col-span-7">
        <p className="display text-[6rem] leading-none text-cini md:text-[9rem]">404</p>
        <h1 className="display mt-4 text-[2.6rem] md:text-[3.6rem]">{t.title}</h1>
        <p className="mt-3 max-w-[48ch] text-[1.15rem] text-muted">{t.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={paths.events(place, lang)} className="ui rounded-full bg-cini px-5 py-2.5 text-ayran hover:bg-cini-deep">
            {t.events}
          </Link>
          <Link href={paths.home(place, lang)} className="ui rounded-full border-2 border-gece px-5 py-2 text-gece">
            {t.home}
          </Link>
        </div>
      </div>
      <div className="hidden md:col-span-4 md:col-start-9 md:block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[6px]">
          <EventArt seed="not-found" motif="kilim" scheme={2} className="absolute inset-0" />
        </div>
      </div>
    </div>
  )
}
