import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventDetail } from '@/components/site/EventDetail'
import { isLang, type Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { getEventForPreview, getPayloadClient } from '@/lib/queries'

/** Staff-only preview of any event, drafts included. Opened from the admin "Preview" button. */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Önizleme / Preview',
  robots: { index: false, follow: false },
}

export default async function PreviewPage({ params }: { params: Promise<{ place: string; lang: string; id: string }> }) {
  const { lang: rawLang, id } = await params
  const lang: Lang = isLang(rawLang) ? rawLang : 'tr'
  const t = getDictionary(lang)
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return (
      <div className="wrap py-20">
        <p className="display text-[2rem]">{t.preview.login}</p>
        <Link href="/admin" className="ui mt-4 inline-block text-cini underline">
          /admin
        </Link>
      </div>
    )
  }
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()
  const raw = await getEventForPreview(numericId)
  if (!raw) notFound()
  return <EventDetail raw={raw} lang={lang} more={[]} preview />
}
