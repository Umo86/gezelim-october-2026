'use client'

import { HoverLink as Link } from './HoverLink'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { CloseIcon, MenuIcon } from './icons'
import { LangSwitch } from './LangSwitch'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function MobileMenu({ lang, place, className = '' }: { lang: Lang; place: string; className?: string }) {
  const pathname = usePathname()
  // The menu belongs to the page it was opened on, so it closes itself after navigation.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const t = getDictionary(lang)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    // The page behind a full-screen menu shouldn't scroll.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null)
        buttonRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !panel || !buttonRef.current) return
      // Keep Tab inside the menu and its close button.
      const items = [buttonRef.current, ...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open])

  const link = 'display block py-2 text-[2rem] text-gece'

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="ui flex items-center gap-1.5 rounded-full px-2 py-1.5 text-gece"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span>{open ? t.nav.close : t.nav.menu}</span>
      </button>
      {open ? (
        <div
          ref={panelRef}
          id={id}
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-ayran px-4 pb-10 pt-6"
        >
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
