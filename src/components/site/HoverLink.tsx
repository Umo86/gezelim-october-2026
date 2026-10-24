'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

/**
 * A Next.js link that prefetches only when the reader points at it or focuses it.
 * List pages carry dozens of links; prefetching them all on scroll would waste
 * mobile data and wake the server for pages nobody opens.
 */
export function HoverLink({ href, onPointerEnter, onFocus, onTouchStart, ...rest }: ComponentProps<typeof Link>) {
  const router = useRouter()
  const target = typeof href === 'string' ? href : href.pathname ?? ''
  const prefetch = () => {
    if (target) router.prefetch(target)
  }
  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(e) => {
        prefetch()
        onPointerEnter?.(e)
      }}
      onFocus={(e) => {
        prefetch()
        onFocus?.(e)
      }}
      onTouchStart={(e) => {
        prefetch()
        onTouchStart?.(e)
      }}
      {...rest}
    />
  )
}
