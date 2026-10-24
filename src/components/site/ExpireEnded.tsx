'use client'

import { useEffect } from 'react'

/**
 * Pages are cached for up to an hour. This hides any event that finished
 * since the page was built, so nobody plans their evening around it.
 */
export function ExpireEnded() {
  useEffect(() => {
    const sweep = () => {
      const now = Date.now()
      document.querySelectorAll<HTMLElement>('[data-until]').forEach((el) => {
        const until = Date.parse(el.dataset.until || '')
        if (until && until < now) {
          ;(el.closest<HTMLElement>('[data-item]') ?? el).hidden = true
        }
      })
    }
    sweep()
    const timer = window.setInterval(sweep, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])
  return null
}
