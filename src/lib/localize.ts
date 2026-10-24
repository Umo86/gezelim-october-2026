import type { Lang } from '@/i18n/config'
import { otherLang } from '@/i18n/config'

/** A field read with `locale: 'all'` comes back as { tr, en }. */
export type LocalizedValue<T> = Partial<Record<Lang, T | null>>

function isLocalized(value: unknown): value is LocalizedValue<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('tr' in (value as object) || 'en' in (value as object)) &&
    !('root' in (value as object))
  )
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  // Lexical rich text with no text in it
  if (typeof value === 'object' && value && 'root' in value) {
    const root = (value as { root?: { children?: unknown[] } }).root
    return !root?.children?.length || lexicalPlainText(value).trim() === ''
  }
  return false
}

/** Value in the requested language, falling back to the other one. */
export function pick<T>(value: unknown, lang: Lang): T | undefined {
  if (!isLocalized(value)) return (value ?? undefined) as T | undefined
  const own = value[lang]
  if (!isEmpty(own)) return own as T
  const other = value[otherLang(lang)]
  return isEmpty(other) ? undefined : (other as T)
}

/** True when the value exists in this language without falling back. */
export function has(value: unknown, lang: Lang): boolean {
  if (!isLocalized(value)) return !isEmpty(value)
  return !isEmpty(value[lang])
}

type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

/** Plain text from Lexical JSON, for meta descriptions and search. */
export function lexicalPlainText(value: unknown): string {
  const root = (value as { root?: LexicalNode } | null)?.root
  if (!root) return ''
  const out: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') out.push(node.text)
    if (node.type === 'linebreak') out.push('\n')
    node.children?.forEach(walk)
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'listitem') out.push('\n')
  }
  walk(root)
  return out.join('').replace(/\n{3,}/g, '\n\n').trim()
}

/** Lexical JSON from plain text: one paragraph per blank-line-separated block. */
export function plainTextToLexical(text: string) {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const paragraph = (p: string) => {
    const lines = p.split('\n')
    const children: Record<string, unknown>[] = []
    lines.forEach((line, i) => {
      if (i > 0) children.push({ type: 'linebreak', version: 1 })
      if (line) {
        children.push({ type: 'text', text: line, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
      }
    })
    return {
      type: 'paragraph',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      textStyle: '',
      version: 1,
    }
  }

  return {
    root: {
      type: 'root',
      children: paragraphs.map(paragraph),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[.,;:–-]+$/, '')}…`
}
