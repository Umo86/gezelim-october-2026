'use client'

import { HoverLink as Link } from './HoverLink'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { citiesForPicker, getPlace, UK } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { switchPlacePath } from '@/i18n/switch'
import { ChevronDownIcon, PinIcon } from './icons'

/** Button + panel for moving between cities. Keeps the section you're in. */
export function CityPicker({ lang, current }: { lang: Lang; current: string }) {
  const pathname = usePathname() || `/${current}/${lang}`
  // The panel belongs to the page it was opened on, so it closes itself after navigation.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((current) => {
      const value = typeof next === 'function' ? next(current === pathname) : next
      return value ? pathname : null
    })
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const t = getDictionary(lang).picker
  const place = getPlace(current) ?? UK
  const cities = citiesForPicker(lang)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenOn(null)
    }
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenOn(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  const label = place.kind === 'country' ? (lang === 'tr' ? 'Tüm şehirler' : 'All cities') : place.name[lang]

  const item = (slug: string, name: string) => {
    const active = slug === current
    return (
      <li key={slug}>
        <Link
          href={switchPlacePath(pathname, slug)}
          aria-current={active ? 'page' : undefined}
          className={`block rounded-[4px] px-2 py-1.5 leading-tight hover:bg-tas ${
            active ? 'bg-cini text-ayran hover:bg-cini' : 'text-gece'
          }`}
        >
          {name}
        </Link>
      </li>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${t.choose}: ${place.name[lang]}`}
        onClick={() => setOpen((o) => !o)}
        className="ui flex items-center gap-1.5 rounded-full border border-gece/20 bg-white/60 py-1.5 pl-2.5 pr-2 text-[0.95rem] text-gece hover:border-gece/50"
      >
        <PinIcon width={16} height={16} className="text-cini" />
        <span className="max-w-[9.5rem] truncate">{label}</span>
        <ChevronDownIcon width={16} height={16} className={open ? 'rotate-180' : ''} />
      </button>
      {open ? (
        <div
          id={panelId}
          className="fixed inset-x-3 top-[4.25rem] z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-[8px] bg-ayran p-4 shadow-[0_24px_60px_-16px_rgba(15,26,51,0.45)] ring-1 ring-gece/10 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[34rem] sm:p-5"
        >
          <p className="ui text-[0.85rem] text-muted">{t.choose}</p>
          <ul className="mt-2">{item(UK.slug, t.allUk)}</ul>
          <p className="ui mt-4 text-[0.85rem] text-muted">{t.majorCities}</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-2 sm:grid-cols-3">
            {cities.filter((c) => c.major).map((c) => item(c.slug, c.name[lang]))}
          </ul>
          <p className="ui mt-4 text-[0.85rem] text-muted">{t.otherCities}</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-2 text-[0.95rem] sm:grid-cols-3">
            {cities.filter((c) => !c.major).map((c) => item(c.slug, c.name[lang]))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
