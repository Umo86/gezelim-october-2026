'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { CalendarIcon, CheckIcon, LinkIcon, ShareIcon, WhatsAppIcon } from './icons'

const noopSubscribe = () => () => {}

const button =
  'ui inline-flex items-center gap-2 rounded-full border-[1.5px] border-gece/25 bg-white/70 px-4 py-2.5 text-[0.95rem] text-gece hover:border-gece/60'

export function ShareButtons({ url, title, lang }: { url: string; title: string; lang: Lang }) {
  const t = getDictionary(lang).event
  const [copied, setCopied] = useState(false)
  // The native share sheet exists on phones; false during server rendering.
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === 'function',
    () => false,
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt(t.copyLink, url)
    }
  }

  return (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={button}
      >
        <WhatsAppIcon className="text-[#128C4B]" />
        {t.shareWhatsapp}
      </a>
      {canShare ? (
        <button type="button" className={button} onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
          <ShareIcon />
          {t.share}
        </button>
      ) : null}
      <button type="button" className={button} onClick={copy} aria-live="polite">
        {copied ? <CheckIcon className="text-fistik-deep" /> : <LinkIcon />}
        {copied ? t.copied : t.copyLink}
      </button>
    </>
  )
}

type CalendarEvent = {
  id: number
  title: string
  startsAt: string
  endsAt: string | null
  location: string
  url: string
}

const icsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

function endOf(e: CalendarEvent): string {
  return e.endsAt ?? new Date(new Date(e.startsAt).getTime() + 3 * 3600 * 1000).toISOString()
}

export function CalendarMenu({ event, lang }: { event: CalendarEvent; lang: Lang }) {
  const t = getDictionary(lang).event
  const [open, setOpen] = useState(false)
  // Opens towards whichever side has room, so it never runs off a phone screen.
  const [alignRight, setAlignRight] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${icsDate(event.startsAt)}/${icsDate(endOf(event))}`,
    details: event.url,
    location: event.location,
    ctz: 'Europe/London',
  }).toString()}`

  const downloadIcs = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gezelim//Events//TR',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:event-${event.id}@gezelim.co`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(event.startsAt)}`,
      `DTEND:${icsDate(endOf(event))}`,
      `SUMMARY:${icsText(event.title)}`,
      `LOCATION:${icsText(event.location)}`,
      `DESCRIPTION:${icsText(event.url)}`,
      `URL:${event.url}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `gezelim-${event.id}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Safari reads the file after click() returns: free it a minute later, not straight away.
    window.setTimeout(() => URL.revokeObjectURL(href), 60_000)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={button}
        aria-expanded={open}
        onClick={() => {
          const rect = buttonRef.current?.getBoundingClientRect()
          setAlignRight(Boolean(rect && rect.left + 256 > window.innerWidth - 16))
          setOpen((o) => !o)
        }}
      >
        <CalendarIcon />
        {t.addToCalendar}
      </button>
      {open ? (
        <div
          className={`absolute top-full z-20 mt-2 w-64 rounded-[8px] bg-white p-2 shadow-[0_18px_40px_-12px_rgba(15,26,51,0.35)] ring-1 ring-gece/10 ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          <a
            href={google}
            target="_blank"
            rel="noopener noreferrer"
            className="ui block rounded-[4px] px-3 py-2 text-[0.95rem] hover:bg-tas"
            onClick={() => setOpen(false)}
          >
            {t.googleCalendar}
          </a>
          <button type="button" onClick={downloadIcs} className="ui block w-full rounded-[4px] px-3 py-2 text-left text-[0.95rem] hover:bg-tas">
            {t.icsCalendar}
          </button>
        </div>
      ) : null}
    </div>
  )
}
