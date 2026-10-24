'use client'

import { HoverLink as Link } from './HoverLink'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { CloseIcon, MenuIcon } from './icons'
import { LangSwitch } from './LangSwitch'

export function MobileMenu({ lang, place, className = '' }: { lang: Lang; place: string; className?: string }) {
  const pathname = usePathname()
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (next: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((current) => {
      const value = typeof next === 'function' ? next(current === pathname) : next
      return value ? pathname : null
    })
  const id = useId()
  const t = getDictionary(lang)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenOn(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const link = 'display block py-2 text-[2rem] text-gece'

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="ui flex items-center gap-1.5 rounded-full px-2 py-1.5 text-gece"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span>{open ? t.nav.close : t.nav.menu}</span>
      </button>
      {open ? (
        <div id={id} className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ayran px-4 pb-10 pt-6">
          <nav aria-label={t.nav.menu}>
            <ul>
              <li>
                <Link href={paths.events(place, lang)} className={link}>
                  {t.nav.events}
                </Link>
              </li>
              <li>
                <Link href={paths.addEvent(lang)} className={link}>
                  {t.nav.addEvent}
                </Link>
              </li>
              <li>
                <Link href={paths.about(lang)} className={link}>
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </nav>
          <div className="mt-8 border-t border-gece/15 pt-6">
            <LangSwitch lang={lang} className="text-[1.1rem]" />
          </div>
        </div>
      ) : null}
    </div>
  )
}
