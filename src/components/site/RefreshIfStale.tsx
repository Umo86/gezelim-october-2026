'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { londonDayKey } from '@/lib/dates'

const MAX_AGE = 2 * 60 * 60 * 1000

/**
 * Cached pages are rebuilt in the background, so after a quiet spell the first
 * visitor still gets the old copy: last week's "this weekend", yesterday's "today".
 * When this copy was built on an earlier day (London time) or more than two hours
 * ago, fetch the fresh one, giving the rebuild a few seconds to finish.
 */
export function RefreshIfStale({ builtAt }: { builtAt: number }) {
  const router = useRouter()
  useEffect(() => {
    const now = Date.now()
    const stale = londonDayKey(builtAt) !== londonDayKey(now) || now - builtAt > MAX_AGE
    if (!stale) return
    // If the first refresh still brings the old copy, try once more; a fresh copy
    // re-renders this component with a new builtAt and cancels the second try.
    const timers = [3_000, 10_000].map((ms) => window.setTimeout(() => router.refresh(), ms))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [builtAt, router])
  return null
}
