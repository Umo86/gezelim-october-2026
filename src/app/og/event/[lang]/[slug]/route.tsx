import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { artSvg } from '@/lib/art'
import { formatDayLong, formatShortRange, formatTimeRange } from '@/lib/dates'
import { toListEvent, type ListEvent } from '@/lib/events'
import { getEventBySlug } from '@/lib/queries'

/*
 * Share image for events without a photo: what WhatsApp, Facebook, X and search
 * results show. The event's own çini poster on the left, the facts on its panel
 * colour on the right. Built once per event and language, then cached; publishing
 * a change clears it with the rest of the content.
 *
 * URL: /og/event/<lang>/<slug>.png
 */

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

const WIDTH = 1200
const HEIGHT = 630
const ART_WIDTH = 504 // 4:5, the same poster the site shows

type Font = { name: string; data: Buffer; weight: 600 | 800; style: 'normal' }

const FONT_DIR = join(process.cwd(), 'src/assets/fonts')
let fonts: Promise<Font[]> | null = null

/*
 * Static Archivo cuts (Satori can't read variable fonts). Turkish needs both subsets:
 * ı is in Latin, ş ğ İ are in Latin Extended. Satori only falls back between
 * differently named families, so each subset gets its own name.
 */
const DISPLAY = 'Display, DisplayExt'
const UI = 'UI, UIExt'

function loadFonts(): Promise<Font[]> {
  fonts ??= Promise.all(
    (
      [
        ['Display', 'archivo-display-latin.ttf', 800],
        ['DisplayExt', 'archivo-display-latin-ext.ttf', 800],
        ['UI', 'archivo-ui-latin.ttf', 600],
        ['UIExt', 'archivo-ui-latin-ext.ttf', 600],
      ] as const
    ).map(async ([name, file, weight]) => ({
      name,
      data: await readFile(join(FONT_DIR, file)),
      weight,
      style: 'normal' as const,
    })),
  )
  return fonts
}

let wordmark: Promise<string> | null = null
function loadWordmark(): Promise<string> {
  wordmark ??= readFile(join(process.cwd(), 'public/brand/wordmark.svg'), 'utf8')
  return wordmark
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function titleSize(title: string): number {
  const n = title.length
  if (n <= 16) return 104
  if (n <= 30) return 84
  if (n <= 50) return 68
  return 56
}

function whenLine(e: ListEvent, lang: Lang): string {
  if (e.dayStart !== e.dayEnd) return formatShortRange(e.dayStart, e.dayEnd, lang)
  return `${formatDayLong(e.startsAt, lang)}, ${formatTimeRange(e.startsAt, e.endsAt)}`
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug: file } = await params
  const slug = decodeURIComponent(file).replace(/\.png$/, '')
  if (!isLang(lang) || !slug) return new Response('Not found', { status: 404 })

  const raw = await getEventBySlug(slug)
  if (!raw) return new Response('Not found', { status: 404 })

  const e = toListEvent(raw, lang)
  const t = getDictionary(lang).card
  const art = artSvg({ seed: e.slug, motif: e.motif, width: ART_WIDTH, height: HEIGHT })
  const { panelBg: bg, panelFg: fg } = art.scheme
  // The wordmark's star stays tomato red, except on a tomato-red panel.
  const star = bg.toUpperCase() === '#FF5A3C' ? '#F7F4EE' : '#FF5A3C'
  const mark = (await loadWordmark()).replace('fill="#0F1A33"', `fill="${fg}"`).replace('fill="#FF5A3C"', `fill="${star}"`)

  const flags = [
    e.status === 'cancelled' ? t.cancelled : null,
    e.status === 'postponed' ? t.postponed : null,
    e.status === 'rescheduled' ? t.rescheduled : null,
    e.soldOut && e.status === 'scheduled' ? t.soldOut : null,
    e.isFree && e.status === 'scheduled' && !e.soldOut ? t.free : null,
  ].filter((f): f is string => Boolean(f))

  const size = titleSize(e.title)

  return new ImageResponse(
    (
      <div style={{ width: WIDTH, height: HEIGHT, display: 'flex', background: bg, color: fg }}>
        <img src={svgDataUri(art.svg)} width={ART_WIDTH} height={HEIGHT} alt="" />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '54px 60px 50px 60px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, fontFamily: UI, fontSize: 27 }}>
              <div style={{ display: 'flex', border: `3px solid ${fg}`, borderRadius: 999, padding: '5px 18px 7px' }}>
                {e.categoryName}
              </div>
              <div style={{ display: 'flex' }}>{e.cityName}</div>
              {flags.map((flag) => (
                <div
                  key={flag}
                  style={{ display: 'flex', background: fg, color: bg, borderRadius: 999, padding: '8px 18px 10px' }}
                >
                  {flag}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'block',
                marginTop: 30,
                fontFamily: DISPLAY,
                fontSize: size,
                lineHeight: 0.96,
                letterSpacing: '-0.01em',
                lineClamp: 4,
              }}
            >
              {e.title}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: UI }}>
            <div style={{ display: 'flex', fontSize: 34, lineHeight: 1.15 }}>{whenLine(e, lang)}</div>
            {e.venueName ? (
              <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.2, marginTop: 6, opacity: 0.82 }}>
                {e.venueName}
              </div>
            ) : null}
            <img src={svgDataUri(mark)} width={140} height={49} alt="" style={{ marginTop: 34 }} />
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: await loadFonts(),
      headers: { 'Content-Type': 'image/png' },
    },
  )
}
