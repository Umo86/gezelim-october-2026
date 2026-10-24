'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * A Next.js link that prefetches only when the reader points at it or focuses it.
 * List pages carry dozens of links; prefetching them all on scroll would waste
 * mobile data and wake the server for pages nobody opens. No prefetch on touch
 * either: whole cards are links, so every scroll gesture would start one.
 */
export function HoverLink({ href, onPointerEnter, onFocus, ...rest }: ComponentProps<typeof Link>) {
  const router = useRouter()
  const target = typeof href === 'string' ? href : (href.pathname ?? '')
  const prefetch = () => {
    if (target) router.prefetch(target)
  }
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') prefetch()
        onPointerEnter?.(e)
      }}
      onFocus={(e) => {
        prefetch()
        onFocus?.(e)
      }}
      {...rest}
    />
  )
}
