import type { Motif } from '@/config/categories'

/*
 * The generated çini posters. Every event without a photo gets one: the category
 * picks the tile motif, the event's slug picks the colours. Same event, same
 * poster, on the site and in share images.
 */

export type Scheme = { bg: string; a: string; b: string; c: string; panelBg: string; panelFg: string }

export const SCHEMES: Scheme[] = [
  { bg: '#1F3FBF', a: '#F7F4EE', b: '#FF5A3C', c: '#8FA2EC', panelBg: '#F7F4EE', panelFg: '#0F1A33' },
  { bg: '#F7F4EE', a: '#1F3FBF', b: '#FF5A3C', c: '#8DB36B', panelBg: '#1F3FBF', panelFg: '#F7F4EE' },
  { bg: '#0F1A33', a: '#4A67DE', b: '#FF5A3C', c: '#F7F4EE', panelBg: '#FF5A3C', panelFg: '#0F1A33' },
  { bg: '#FF5A3C', a: '#0F1A33', b: '#F7F4EE', c: '#FFC2B5', panelBg: '#0F1A33', panelFg: '#F7F4EE' },
  { bg: '#8DB36B', a: '#0F1A33', b: '#F7F4EE', c: '#1F3FBF', panelBg: '#F7F4EE', panelFg: '#0F1A33' },
  { bg: '#E9E3D8', a: '#1F3FBF', b: '#FF5A3C', c: '#0F1A33', panelBg: '#0F1A33', panelFg: '#F7F4EE' },
]

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const angle = ((i * 22.5 - 90) * Math.PI) / 180
    const r = i % 2 === 0 ? outer : inner
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const STAR = starPoints(40, 40, 25, 11.5)
const corners = (r: number, fill: string) =>
  [
    [0, 0],
    [80, 0],
    [0, 80],
    [80, 80],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`)
    .join('')

function motifShapes(motif: Motif, s: Scheme): string {
  switch (motif) {
    case 'star':
      return `<polygon points="${STAR}" fill="${s.a}"/><circle cx="40" cy="40" r="5" fill="${s.b}"/>${corners(7, s.c)}`
    case 'cintemani':
      return (
        `<circle cx="30" cy="24" r="8" fill="${s.a}"/><circle cx="50" cy="24" r="8" fill="${s.a}"/><circle cx="40" cy="41" r="8" fill="${s.a}"/>` +
        `<path d="M16 59 q6 -7 12 0 t12 0 t12 0 t12 0" stroke="${s.b}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<path d="M16 70 q6 -7 12 0 t12 0 t12 0 t12 0" stroke="${s.b}" stroke-width="4" fill="none" stroke-linecap="round"/>`
      )
    case 'tulip':
      return (
        `<path d="M40 68 L40 46" stroke="${s.c}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M40 62 C33 60 28 54 26 47 C33 48 38 53 40 58 Z" fill="${s.c}"/>` +
        `<path d="M40 57 C47 55 52 49 54 42 C47 43 42 48 40 53 Z" fill="${s.c}"/>` +
        `<path d="M29 16 L35 30 L40 12 L45 30 L51 16 C55 33 51 46 40 47 C29 46 25 33 29 16 Z" fill="${s.b}"/>` +
        corners(4.5, s.a)
      )
    case 'rosette':
      return (
        Array.from(
          { length: 8 },
          (_, i) => `<ellipse cx="40" cy="21" rx="5.5" ry="12" fill="${s.a}" transform="rotate(${i * 45} 40 40)"/>`,
        ).join('') + `<circle cx="40" cy="40" r="8.5" fill="${s.b}"/><circle cx="40" cy="40" r="3.5" fill="${s.c}"/>`
      )
    case 'kilim':
      return (
        `<path d="M40 9 L71 40 L40 71 L9 40 Z" fill="none" stroke="${s.a}" stroke-width="6"/>` +
        `<path d="M40 28 L52 40 L40 52 L28 40 Z" fill="${s.b}"/>` +
        `<path d="M0 0 H11 L0 11 Z M80 0 H69 L80 11 Z M0 80 H11 L0 69 Z M80 80 H69 L80 69 Z" fill="${s.c}"/>`
      )
  }
}

export type ArtOptions = {
  seed: string
  motif: Motif
  /** Force a colour scheme (0–5), e.g. for category tiles. */
  scheme?: number
  /** Bigger tiles for small thumbnails, so the motif stays readable. */
  scale?: number
  width?: number
  height?: number
  /**
   * Keeps the pattern id unique when the same poster appears twice on a page.
   * Chrome won't paint a pattern whose first definition sits in a hidden element
   * (the desktop-only hero), so each placement needs its own.
   */
  instance?: string
}

/** Colours and the SVG markup of the tile pattern (4:5 unless width/height say otherwise). */
export function artSvg({ seed, motif, scheme, scale = 1, width = 400, height = 500, instance = 'a' }: ArtOptions): {
  svg: string
  scheme: Scheme
} {
  const h = hashString(seed)
  const index = scheme ?? h % SCHEMES.length
  const s = SCHEMES[index]
  const id = `gz-${instance}-${motif}-${index}-${h.toString(36)}-${String(scale).replace('.', '_')}`
  const shift = (h >> 4) % 80
  const rotate = motif === 'kilim' || motif === 'star' ? ((h >> 9) % 2) * 45 : 0
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
    `<defs><pattern id="${id}" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotate} ${width / 2} ${height / 2}) translate(${shift} ${shift}) scale(${scale})">` +
    motifShapes(motif, s) +
    `</pattern></defs><rect width="${width}" height="${height}" fill="${s.bg}"/><rect width="${width}" height="${height}" fill="url(#${id})"/></svg>`
  return { svg, scheme: s }
}
