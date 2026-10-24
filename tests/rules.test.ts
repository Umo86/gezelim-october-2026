import { describe, expect, it } from 'vitest'
import { placeIsIndexable, subListIsIndexable } from '@/lib/indexing'
import { artSvg } from '@/lib/art'
import { instagramUrl, webUrl } from '@/lib/site'
import { switchLangPath } from '@/i18n/switch'

const ev = (id: number, isSample = false) => ({ id, isSample })

describe('which listing pages search engines may index', () => {
  it('ignores sample events', () => {
    expect(placeIsIndexable([ev(1, true), ev(2, true)])).toBe(false)
    expect(placeIsIndexable([ev(1, true), ev(2)])).toBe(true)
  })
  it('needs three real events of its own on a category or date page', () => {
    const parent = [1, 2, 3, 4, 5].map((i) => ev(i))
    expect(subListIsIndexable(parent.slice(0, 2), parent)).toBe(false)
    expect(subListIsIndexable(parent.slice(0, 3), parent)).toBe(true)
  })
  it('skips a sub-list that is the same as its parent list', () => {
    const parent = [1, 2, 3].map((i) => ev(i))
    expect(subListIsIndexable(parent, parent)).toBe(false)
  })
})

describe('links from user input', () => {
  it('keeps only http(s) addresses', () => {
    expect(webUrl('https://example.com/a')).toBe('https://example.com/a')
    expect(webUrl('javascript:alert(1)')).toBeNull()
    expect(webUrl('data:text/html,hi')).toBeNull()
    expect(webUrl('not a url')).toBeNull()
  })
  it('turns Instagram handles and profile links into profile links, and nothing else', () => {
    expect(instagramUrl('@anadolu.events')).toBe('https://www.instagram.com/anadolu.events/')
    expect(instagramUrl('https://instagram.com/anadolu?igsh=x')).toBe('https://www.instagram.com/anadolu/')
    expect(instagramUrl('https://evil.example/?instagram.com')).toBeNull()
    expect(instagramUrl('javascript:alert(1)//instagram.com')).toBeNull()
  })
})

describe('generated posters', () => {
  it('give each placement its own pattern id', () => {
    const a = artSvg({ seed: 'x', motif: 'star' })
    const b = artSvg({ seed: 'x', motif: 'star', instance: 'hero' })
    const id = (svg: string) => svg.match(/pattern id="([^"]+)"/)?.[1]
    expect(id(a.svg)).toBeTruthy()
    expect(id(a.svg)).not.toBe(id(b.svg))
  })
})

describe('wrong-language addresses', () => {
  it('are translated in full, category and date words included', () => {
    expect(switchLangPath('/uk/en/etkinlikler/konserler', 'en')).toBe('/uk/en/events/concerts')
    expect(switchLangPath('/london/tr/events/this-weekend', 'tr')).toBe('/london/tr/etkinlikler/bu-hafta-sonu')
  })
})
