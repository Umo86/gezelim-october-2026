import type { Motif } from '@/config/categories'
import { artSvg } from '@/lib/art'

export { hashString } from '@/lib/art'

type Props = {
  seed: string
  motif: Motif
  /** Shown on a panel at the bottom, like a poster. Omit for small thumbnails. */
  title?: string
  className?: string
  /** Force a colour scheme (0–5), e.g. for category tiles. */
  scheme?: number
  /** Bigger tiles for small thumbnails, so the motif stays readable. */
  scale?: number
  /** Set when the same poster is drawn twice on one page (see artSvg). */
  instance?: string
}

/**
 * A generated çini poster (pattern in src/lib/art.ts, shared with the share images).
 * Decorative: the title is always in the page text too, so screen readers skip it.
 * The SVG markup is built only from constants and numbers, never from user input.
 */
export function EventArt({ seed, motif, title, className = '', scheme, scale = 1, instance }: Props) {
  const art = artSvg({ seed, motif, scheme, scale, instance })
  return (
    <div className={`art ${className}`} style={{ background: art.scheme.bg }} aria-hidden="true">
      <div className="art-svg" dangerouslySetInnerHTML={{ __html: art.svg }} />
      {title ? (
        <div className="art-panel" style={{ background: art.scheme.panelBg, color: art.scheme.panelFg }}>
          {title}
        </div>
      ) : null}
    </div>
  )
}
