import { describe, expect, it } from 'vitest'
import { getCategory } from '@/config/categories'
import { getWhenBySlug, paths } from '@/i18n/paths'
import { switchLangPath, switchPlacePath } from '@/i18n/switch'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('transliterates Turkish letters', () => {
    expect(slugify('Kına Gecesi & Şölen')).toBe('kina-gecesi-solen')
    expect(slugify('İSTANBUL ÇAĞRI Öğün Ülkü')).toBe('istanbul-cagri-ogun-ulku')
    expect(slugify("Londra'daki Türk Etkinlikleri")).toBe('londradaki-turk-etkinlikleri')
  })

  it('cuts long titles at a word boundary', () => {
    const slug = slugify('Bu çok uzun bir etkinlik adı ve hiç bitmeyecek gibi duruyor ama bitmesi gerekiyor', 40)
    expect(slug.length).toBeLessThanOrEqual(40)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('city-first URLs', () => {
  const concerts = getCategory('concerts')!

  it('builds localised addresses', () => {
    expect(paths.events('london', 'tr')).toBe('/london/tr/etkinlikler')
    expect(paths.events('london', 'en')).toBe('/london/en/events')
    expect(paths.category('uk', 'tr', concerts)).toBe('/uk/tr/etkinlikler/konserler')
    expect(paths.when('manchester', 'tr', 'weekend')).toBe('/manchester/tr/etkinlikler/bu-hafta-sonu')
    expect(paths.when('manchester', 'en', 'weekend')).toBe('/manchester/en/events/this-weekend')
    expect(paths.venue('london', 'tr', 'lale-hall')).toBe('/london/tr/mekan/lale-hall')
    expect(paths.event('london', 'en', 'x-2026-10-24')).toBe('/london/en/event/x-2026-10-24')
  })

  it('switches language on the same page', () => {
    expect(switchLangPath('/london/tr/etkinlikler/konserler', 'en')).toBe('/london/en/events/concerts')
    expect(switchLangPath('/london/en/events/this-weekend', 'tr')).toBe('/london/tr/etkinlikler/bu-hafta-sonu')
    expect(switchLangPath('/london/tr/etkinlik/anadolu-rock-2026-10-24', 'en')).toBe('/london/en/event/anadolu-rock-2026-10-24')
    expect(switchLangPath('/uk/en/places/lale-hall', 'tr')).toBe('/uk/tr/mekan/lale-hall')
    expect(switchLangPath('/uk/tr', 'en')).toBe('/uk/en')
  })

  it('switches city and keeps the section', () => {
    expect(switchPlacePath('/london/tr/etkinlikler/konserler', 'manchester')).toBe('/manchester/tr/etkinlikler/konserler')
    expect(switchPlacePath('/london/en/events', 'leeds')).toBe('/leeds/en/events')
    expect(switchPlacePath('/london/en/event/some-event', 'leeds')).toBe('/leeds/en')
  })

  it('recognises date pages in both languages', () => {
    expect(getWhenBySlug('bu-hafta-sonu')).toEqual({ when: 'weekend', lang: 'tr' })
    expect(getWhenBySlug('this-weekend')).toEqual({ when: 'weekend', lang: 'en' })
    expect(getWhenBySlug('konserler')).toBeUndefined()
  })
})

describe('share images', () => {
  it('point at the generated card and change when the event is edited', async () => {
    const { shareImagePath } = await import('@/lib/events')
    const event = { id: 12, slug: 'ney-dinletisi-2026-11-02', updatedAt: '2026-10-24T10:00:00.000Z' }
    const before = shareImagePath(event, 'tr')
    const after = shareImagePath({ ...event, updatedAt: '2026-10-24T11:30:00.000Z' }, 'tr')
    expect(before).toMatch(/^\/og\/event\/tr\/ney-dinletisi-2026-11-02\.png\?v=[0-9a-z]+$/)
    expect(after).not.toBe(before)
    expect(shareImagePath(event, 'en')).toMatch(/^\/og\/event\/en\//)
  })
})
