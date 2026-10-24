import '@fontsource-variable/archivo/standard.css'
import './(frontend)/globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Wordmark } from '@/components/site/Wordmark'

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı · Page not found · Gezelim',
  robots: { index: false, follow: true },
}

/** For addresses that match no route at all. Both languages, since we can't tell which one the reader wants. */
export default function GlobalNotFound() {
  return (
    <html lang="tr">
      <body className="min-h-dvh">
        <main className="wrap py-16 md:py-24">
          <Link href="/uk/tr" aria-label="Gezelim">
            <Wordmark className="h-9 w-auto text-gece" />
          </Link>
          <p className="display mt-12 text-[6rem] leading-none text-cini md:text-[9rem]">404</p>
          <div className="mt-6 grid gap-10 md:grid-cols-2">
            <div>
              <h1 className="display text-[2.4rem]">Bu sayfayı bulamadık</h1>
              <p className="mt-3 text-muted">Bağlantı eski olabilir ya da etkinlik kaldırılmış olabilir.</p>
              <Link href="/uk/tr/etkinlikler" className="ui mt-6 inline-block rounded-full bg-cini px-5 py-2.5 text-ayran">
                Etkinliklere göz at
              </Link>
            </div>
            <div lang="en">
              <h2 className="display text-[2.4rem]">We couldn’t find that page</h2>
              <p className="mt-3 text-muted">The link may be old, or the event may have been removed.</p>
              <Link href="/uk/en/events" className="ui mt-6 inline-block rounded-full border-2 border-gece px-5 py-2 text-gece">
                Browse events
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
