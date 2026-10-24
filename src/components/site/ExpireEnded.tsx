'use client'

import { useEffect } from 'react'

/**
 * Pages are cached, so an event can finish after its page was built. This hides
 * anything marked `data-until` once that moment has passed (the card or row, or a
 * ticket button), then hides any `data-group` (a day, a rail) left with nothing in
 * it. It runs on load, whenever the page content changes (client-side navigation,
 * list filters) and every five minutes.
 */
export function ExpireEnded() {
  useEffect(() => {
    let frame = 0
    const sweep = () => {
      frame = 0
      const now = Date.now()
      document.querySelectorAll<HTMLElement>('[data-until]').forEach((el) => {
        const until = Date.parse(el.dataset.until || '')
        if (until && until < now) (el.closest<HTMLElement>('[data-item]') ?? el).hidden = true
      })
      document.querySelectorAll<HTMLElement>('[data-group]').forEach((group) => {
        const items = [...group.querySelectorAll<HTMLElement>('[data-item], [data-until]')]
        if (items.length && items.every((i) => i.closest('[hidden]'))) group.hidden = true
      })
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sweep)
    }
    sweep()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    const timer = window.setInterval(schedule, 5 * 60 * 1000)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])
  return null
}
