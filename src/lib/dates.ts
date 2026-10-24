import type { Lang } from '@/i18n/config'
import { INTL_LOCALE } from '@/i18n/config'
import type { When } from '@/i18n/paths'

/** Every event is shown in UK time, whatever the reader's device says. */
export const TZ = 'Europe/London'

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number }

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

export function londonParts(value: Date | string | number): Parts {
  const parts = partsFormatter.formatToParts(toDate(value))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "2026-10-24" for the London calendar day of this instant. */
export function londonDayKey(value: Date | string | number): string {
  const p = londonParts(value)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

/** "20:00" in London time. */
export function londonTime(value: Date | string | number): string {
  const p = londonParts(value)
  return `${pad(p.hour)}:${pad(p.minute)}`
}

/** Minutes London is ahead of UTC at this instant (0 in winter, 60 in summer). */
export function londonOffsetMinutes(value: Date | string | number): number {
  const date = toDate(value)
  const p = londonParts(date)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000)
}

/** ISO 8601 with the London offset, e.g. 2026-10-25T20:00:00+01:00, as Google's Event schema wants. */
export function toLondonISO(value: Date | string | number): string {
  const p = londonParts(value)
  const offset = londonOffsetMinutes(value)
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** Reads a wall-clock date and time as London time: ("2026-10-25", "20:00") → Date. */
export function londonLocalToDate(dateStr: string, timeStr = '00:00'): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh || 0, mm || 0)
  const first = londonOffsetMinutes(new Date(guess))
  let ts = guess - first * 60000
  const second = londonOffsetMinutes(new Date(ts))
  if (second !== first) ts = guess - second * 60000
  return new Date(ts)
}

/** Day-key arithmetic on "YYYY-MM-DD" strings. */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function keyToNoonUtc(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

/** Inclusive day range for a "when" filter, in London days. */
export function whenRange(when: When, now: Date = new Date()): { from: string; to: string } {
  const today = londonDayKey(now)
  const weekday = weekdayOf(today)
  const daysToSunday = weekday === 0 ? 0 : 7 - weekday
  switch (when) {
    case 'today':
      return { from: today, to: today }
    case 'tomorrow': {
      const t = addDays(today, 1)
      return { from: t, to: t }
    }
    case 'weekend': {
      const isWeekend = weekday === 5 || weekday === 6 || weekday === 0
      const from = isWeekend ? today : addDays(today, 5 - weekday)
      return { from, to: addDays(today, daysToSunday) }
    }
    case 'week':
      return { from: today, to: addDays(today, daysToSunday) }
    case 'next-week': {
      const monday = addDays(today, daysToSunday + 1)
      return { from: monday, to: addDays(monday, 6) }
    }
  }
}

/**
 * The London days an event covers. Anything under 24 hours counts as its start
 * day only, so a party from 22:00 to 03:00 isn't listed on two days.
 */
export function eventDayRange(startsAt: string, endsAt?: string | null): { start: string; end: string } {
  const start = londonDayKey(startsAt)
  if (!endsAt) return { start, end: start }
  const duration = new Date(endsAt).getTime() - new Date(startsAt).getTime()
  if (duration < 24 * 60 * 60 * 1000) return { start, end: start }
  return { start, end: londonDayKey(endsAt) }
}

export function overlaps(range: { start: string; end: string }, window: { from: string; to: string }): boolean {
  return range.start <= window.to && range.end >= window.from
}

/* ---------- Formatting ---------- */

const cache = new Map<string, Intl.DateTimeFormat>()
function fmt(lang: Lang, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = lang + JSON.stringify(options)
  let f = cache.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(INTL_LOCALE[lang], { timeZone: TZ, ...options })
    cache.set(key, f)
  }
  return f
}

/** "24 Ekim Cumartesi" / "Saturday 24 October" */
export function formatDayLong(value: Date | string, lang: Lang): string {
  const date = typeof value === 'string' && value.length === 10 ? keyToNoonUtc(value) : toDate(value)
  if (lang === 'tr') {
    return `${fmt(lang, { day: 'numeric', month: 'long' }).format(date)} ${fmt(lang, { weekday: 'long' }).format(date)}`
  }
  return fmt(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(date).replace(',', '')
}

/** "24 Ekim 2026 Cumartesi" / "Saturday 24 October 2026" */
export function formatDateFull(value: Date | string, lang: Lang): string {
  const date = toDate(value)
  if (lang === 'tr') {
    return `${fmt(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)} ${fmt(lang, { weekday: 'long' }).format(date)}`
  }
  return fmt(lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date).replace(',', '')
}

/** "Cmt" / "Sat" */
export function formatWeekdayShort(value: Date | string, lang: Lang): string {
  return fmt(lang, { weekday: 'short' }).format(toDate(value)).replace('.', '')
}

/** Day number and short month for date tiles: { day: "24", month: "Eki" } */
export function dateTile(value: Date | string, lang: Lang): { day: string; month: string } {
  const date = toDate(value)
  return {
    day: fmt(lang, { day: 'numeric' }).format(date),
    month: fmt(lang, { month: 'short' }).format(date).replace('.', ''),
  }
}

/** "24–26 Eki" / "24–26 Oct", or "31 Eki – 2 Kas" across months */
export function formatShortRange(startKey: string, endKey: string, lang: Lang): string {
  const s = keyToNoonUtc(startKey)
  const e = keyToNoonUtc(endKey)
  const day = fmt(lang, { day: 'numeric' })
  const dm = fmt(lang, { day: 'numeric', month: 'short' })
  if (startKey === endKey) return dm.format(s).replace('.', '')
  if (startKey.slice(0, 7) === endKey.slice(0, 7)) {
    return `${day.format(s)}–${dm.format(e).replace('.', '')}`
  }
  return `${dm.format(s).replace('.', '')} – ${dm.format(e).replace('.', '')}`
}

/** "20:00–23:00" or "20:00" */
export function formatTimeRange(startsAt: string, endsAt?: string | null): string {
  const start = londonTime(startsAt)
  if (!endsAt) return start
  const range = eventDayRange(startsAt, endsAt)
  if (range.start !== range.end) return start
  return `${start}–${londonTime(endsAt)}`
}

export function startOfLondonDay(key: string): Date {
  return londonLocalToDate(key, '00:00')
}
