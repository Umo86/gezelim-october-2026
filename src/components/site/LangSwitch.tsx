'use client'

import { HoverLink as Link } from './HoverLink'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { otherLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { switchLangPath } from '@/i18n/switch'

/** Link to this same page in the other language. */
export function LangSwitch({ lang, className = '' }: { lang: Lang; className?: string }) {
  const pathname = usePathname() || `/uk/${lang}`
  const to = otherLang(lang)
  const t = getDictionary(lang).langSwitch
  return (
    <Link
      href={switchLangPath(pathname, to)}
      hrefLang={to}
      lang={to}
      className={`ui text-[0.95rem] text-gece underline-offset-4 hover:underline ${className}`}
    >
      {t.to}
    </Link>
  )
}

/** Remembers the language so gezelim.co and gezelim.co/<city> open in it next time. */
export function LangCookie({ lang }: { lang: Lang }) {
  useEffect(() => {
    const value = `gz_lang=${lang}`
    if (!document.cookie.split('; ').includes(value)) {
      document.cookie = `${value}; path=/; max-age=31536000; samesite=lax`
    }
  }, [lang])
  return null
}
