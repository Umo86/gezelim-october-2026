'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { WHEN_VALUES, type When } from '@/i18n/paths'
import { formatDayLong, londonDayKey, overlaps, whenRange } from '@/lib/dates'
import { fold, type ListEvent } from '@/lib/events'
import { EventRow } from './EventRow'
import { HoverLink as Link } from './HoverLink'
import { SearchIcon } from './icons'

type Filters = { when: When | 'all'; spoken: 'any' | 'tr' | 'en'; free: boolean; q: string }
const EMPTY: Filters = { when: 'all', spoken: 'any', free: false, q: '' }
// Enough that list pages carry plain links to almost every event for crawlers.
const PAGE = 150

function readParams(params: URLSearchParams | null): Filters {
  if (!params) return EMPTY
  const when = params.get('when')
  const spoken = params.get('spoken')
  return {
    when: (WHEN_VALUES as readonly string[]).includes(when ?? '') ? (when as When) : 'all',
    spoken: spoken === 'tr' || spoken === 'en' ? spoken : 'any',
    free: params.get('free') === '1',
    q: params.get('q') ?? '',
  }
}

function writeParams(f: Filters) {
  const params = new URLSearchParams()
  if (f.when !== 'all') params.set('when', f.when)
  if (f.spoken !== 'any') params.set('spoken', f.spoken)
  if (f.free) params.set('free', '1')
  if (f.q.trim()) params.set('q', f.q.trim())
  const qs = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
}

type Props = {
  events: ListEvent[]
  lang: Lang
  showCity: boolean
  showCategory?: boolean
  /**
   * When given, the date chips are links to the date pages (/…/bu-hafta-sonu)
   * instead of in-page filters, so each date view is its own indexable URL.
   */
  dateLinks?: Record<When | 'all', string>
  activeWhen?: When | 'all'
}

type ViewProps = Props & {
  filters: Filters
  now: number | null
  limit: number
  onChange: (patch: Partial<Filters>) => void
  onMore: () => void
}

/**
 * The events list with its filters. The page HTML (what search engines read)
 * holds the full, unfiltered list; filters from the address (?free=1…) apply
 * once the page is running in the browser.
 */
export function EventsExplorer(props: Props) {
  return (
    <Suspense
      fallback={<ExplorerView {...props} filters={EMPTY} now={null} limit={PAGE} onChange={() => {}} onMore={() => {}} />}
    >
      <InteractiveExplorer {...props} />
    </Suspense>
  )
}

function InteractiveExplorer(props: Props) {
  const params = useSearchParams()
  const [filters, setFilters] = useState<Filters>(() => readParams(params))
  // Rendered in the browser only (it reads the address), so the clock is the reader's.
  const [now] = useState(() => Date.now())
  const [limit, setLimit] = useState(PAGE)
  return (
    <ExplorerView
      {...props}
      filters={filters}
      now={now}
      limit={limit}
      onChange={(patch) => {
        setFilters((prev) => {
          const next = { ...prev, ...patch }
          writeParams(next)
          return next
        })
        setLimit(PAGE)
      }}
      onMore={() => setLimit((l) => l + PAGE)}
    />
  )
}

function ExplorerView({
  events,
  lang,
  showCity,
  showCategory = true,
  dateLinks,
  activeWhen = 'all',
  filters,
  now,
  limit,
  onChange,
  onMore,
}: ViewProps) {
  const t = getDictionary(lang)

  const filtered = useMemo(() => {
    const range = !dateLinks && filters.when !== 'all' && now ? whenRange(filters.when, new Date(now)) : null
    const q = fold(filters.q)
    return events.filter((e) => {
      if (now && Date.parse(e.activeUntil) < now) return false
      if (range && !overlaps({ start: e.dayStart, end: e.dayEnd }, range)) return false
      if (filters.free && !e.isFree) return false
      if (filters.spoken === 'tr' && e.spoken === 'en') return false
      if (filters.spoken === 'en' && e.spoken === 'tr') return false
      if (q && !e.search.includes(q)) return false
      return true
    })
  }, [events, filters, now, dateLinks])

  const today = now ? londonDayKey(now) : null
  const tomorrow = now ? whenRange('tomorrow', new Date(now)).from : null
  const groups = useMemo(() => {
    const map = new Map<string, ListEvent[]>()
    for (const e of filtered.slice(0, limit)) {
      const key = today && e.dayStart < today ? today : e.dayStart
      map.set(key, [...(map.get(key) ?? []), e])
    }
    return [...map.entries()]
  }, [filtered, limit, today])
  const hidden = Math.max(0, filtered.length - limit)

  const dayLabel = (key: string) => {
    if (key === today) return `${t.list.today}, ${formatDayLong(key, lang)}`
    if (key === tomorrow) return `${t.list.tomorrow}, ${formatDayLong(key, lang)}`
    return formatDayLong(key, lang)
  }

  const active =
    (!dateLinks && filters.when !== 'all') || filters.spoken !== 'any' || filters.free || filters.q.trim() !== ''
  const chip = (selected: boolean) =>
    `ui shrink-0 rounded-full px-4 py-2 text-[0.95rem] border-[1.5px] ${
      selected ? 'bg-gece text-ayran border-gece' : 'bg-white/70 text-gece border-gece/20 hover:border-gece/60'
    }`

  return (
    <div className="mt-8">
      <div className="space-y-4">
        {dateLinks ? (
          <nav aria-label={t.list.dateLabel} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {(['all', ...WHEN_VALUES] as const).map((w) => (
              <Link key={w} href={dateLinks[w]} aria-current={activeWhen === w ? 'page' : undefined} className={chip(activeWhen === w)}>
                {w === 'all' ? t.when.any : t.when[w]}
              </Link>
            ))}
          </nav>
        ) : (
          <div role="group" aria-label={t.list.dateLabel} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            <button type="button" aria-pressed={filters.when === 'all'} className={chip(filters.when === 'all')} onClick={() => onChange({ when: 'all' })}>
              {t.when.any}
            </button>
            {WHEN_VALUES.map((w) => (
              <button key={w} type="button" aria-pressed={filters.when === w} className={chip(filters.when === w)} onClick={() => onChange({ when: w })}>
                {t.when[w]}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[15rem] flex-1">
            <span className="sr-only">{t.list.searchLabel}</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder={t.list.search}
              className="control pl-10"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="sr-only">{t.list.spokenLabel}</span>
            <select
              value={filters.spoken}
              onChange={(e) => onChange({ spoken: e.target.value as Filters['spoken'] })}
              className="control w-auto pr-8"
            >
              <option value="any">{t.list.spokenAny}</option>
              <option value="tr">{t.list.spokenTr}</option>
              <option value="en">{t.list.spokenEn}</option>
            </select>
          </label>
          <label className="ui flex cursor-pointer items-center gap-2 text-[0.95rem]">
            <input
              type="checkbox"
              checked={filters.free}
              onChange={(e) => onChange({ free: e.target.checked })}
              className="h-5 w-5 accent-cini"
            />
            {t.list.freeOnly}
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-gece pb-3">
          <p className="ui text-[1rem]" aria-live="polite">
            {t.list.results(filtered.length)}
          </p>
          {active ? (
            <button type="button" onClick={() => onChange(EMPTY)} className="ui text-[0.95rem] text-cini underline underline-offset-4">
              {t.list.clear}
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12">
          <p className="display text-[1.8rem]">{events.length === 0 ? t.list.empty : t.list.noResults}</p>
          {events.length > 0 ? <p className="mt-2 text-muted">{t.list.noResultsHint}</p> : null}
        </div>
      ) : (
        <div>
          {groups.map(([day, list]) => (
            <section key={day} className="grid gap-x-8 border-b border-gece/15 md:grid-cols-[13rem_1fr]" aria-label={dayLabel(day)}>
              <h2 className="ui sticky top-16 z-10 bg-ayran pb-1 pt-4 text-[1rem] md:static md:bg-transparent md:pt-6">{dayLabel(day)}</h2>
              <ul className="divide-y divide-gece/10">
                {list.map((e) => (
                  <li key={e.id}>
                    <EventRow event={e} lang={lang} showCity={showCity} showCategory={showCategory} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {hidden > 0 ? (
            <button
              type="button"
              onClick={onMore}
              className="ui mt-8 rounded-full border-2 border-gece px-5 py-2.5 text-gece hover:bg-gece hover:text-ayran"
            >
              {t.list.showMore(hidden)}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
