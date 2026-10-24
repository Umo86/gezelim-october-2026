import { describe, expect, it } from 'vitest'
import { eventDayRange, londonDayKey, londonLocalToDate, toLondonISO, whenRange } from '@/lib/dates'
import { formatMoney } from '@/lib/events'

describe('London time', () => {
  it('reads wall-clock times in summer and winter', () => {
    // British Summer Time (UTC+1)
    expect(londonLocalToDate('2026-07-10', '20:00').toISOString()).toBe('2026-07-10T19:00:00.000Z')
    // GMT (UTC+0), after the clocks go back on 25 October 2026
    expect(londonLocalToDate('2026-11-02', '20:00').toISOString()).toBe('2026-11-02T20:00:00.000Z')
  })

  it('writes ISO dates with the right offset for Google', () => {
    expect(toLondonISO('2026-07-10T19:00:00.000Z')).toBe('2026-07-10T20:00:00+01:00')
    expect(toLondonISO('2026-12-05T19:30:00.000Z')).toBe('2026-12-05T19:30:00+00:00')
  })

  it('puts late-night events on the London day', () => {
    // 00:30 on 11 July in London is still 10 July in UTC
    expect(londonDayKey('2026-07-10T23:30:00.000Z')).toBe('2026-07-11')
  })

  it('lists a night out on its start day only', () => {
    expect(eventDayRange('2026-10-30T21:00:00.000Z', '2026-10-31T03:00:00.000Z')).toEqual({
      start: '2026-10-30',
      end: '2026-10-30',
    })
    expect(eventDayRange('2026-11-07T12:00:00.000Z', '2026-11-08T20:00:00.000Z')).toEqual({
      start: '2026-11-07',
      end: '2026-11-08',
    })
  })
})

describe('date pages', () => {
  it('works out this weekend from a weekday', () => {
    // Wednesday 21 October 2026 → Friday 23 to Sunday 25
    expect(whenRange('weekend', new Date('2026-10-21T12:00:00Z'))).toEqual({ from: '2026-10-23', to: '2026-10-25' })
  })

  it('works out this weekend on a Saturday', () => {
    expect(whenRange('weekend', new Date('2026-10-24T12:00:00Z'))).toEqual({ from: '2026-10-24', to: '2026-10-25' })
  })

  it('works out next week', () => {
    expect(whenRange('next-week', new Date('2026-10-24T12:00:00Z'))).toEqual({ from: '2026-10-26', to: '2026-11-01' })
  })
})

describe('prices', () => {
  it('formats pounds in both languages', () => {
    expect(formatMoney(15, 'en')).toBe('£15')
    expect(formatMoney(18.5, 'en')).toBe('£18.50')
    expect(formatMoney(18.5, 'tr')).toBe('£18,50')
  })
})
