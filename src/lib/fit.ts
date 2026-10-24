import type { CSSProperties } from 'react'

/**
 * Big headlines hold long city words ("Peterborough'daki") that can't wrap. This sets
 * `--fit`, the font size at which the longest word just fits the nearest `@container`,
 * and `--word`, that word's width (Archivo at headline width runs about 0.44em per
 * character, measured with margin). Use them as `text-[length:min(<size>,var(--fit))]`
 * and `max-w-[max(<measure>,var(--word))]` so a narrow measure never splits the word.
 */
export function fitLongestWord(text: string, emPerChar = 0.44): CSSProperties {
  const longest = Math.max(1, ...text.split(/\s+/).map((word) => [...word].length))
  const em = (longest * emPerChar).toFixed(2)
  return { ['--fit' as string]: `calc(100cqi / ${em})`, ['--word' as string]: `${em}em` }
}
