import type { ServerProps } from 'payload'

/**
 * The first thing moderators see: how many submitted events are waiting,
 * with a link straight to them.
 */
export async function BeforeDashboard({ payload, i18n }: ServerProps) {
  const isTr = i18n?.language === 'tr'
  let pending = 0
  let upcoming = 0
  try {
    const [drafts, live] = await Promise.all([
      payload.count({ collection: 'events', where: { _status: { equals: 'draft' } }, overrideAccess: true }),
      payload.count({
        collection: 'events',
        where: { and: [{ _status: { equals: 'published' } }, { activeUntil: { greater_than: new Date().toISOString() } }] },
        overrideAccess: true,
      }),
    ])
    pending = drafts.totalDocs
    upcoming = live.totalDocs
  } catch {
    // The dashboard should still load if the count fails.
  }

  const reviewHref = '/admin/collections/events?where[_status][equals]=draft&sort=startsAt'

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        marginBottom: 24,
        borderRadius: 8,
        background: pending > 0 ? '#1F3FBF' : 'var(--theme-elevation-50)',
        color: pending > 0 ? '#F7F4EE' : 'var(--theme-text)',
      }}
    >
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
          {pending > 0
            ? isTr
              ? `${pending} etkinlik onay bekliyor`
              : `${pending} ${pending === 1 ? 'event is' : 'events are'} waiting for review`
            : isTr
              ? 'Onay bekleyen etkinlik yok'
              : 'No events waiting for review'}
        </div>
        <div style={{ marginTop: 4, opacity: 0.85 }}>
          {isTr
            ? `Sitede ${upcoming} yaklaşan etkinlik yayında.`
            : `${upcoming} upcoming ${upcoming === 1 ? 'event is' : 'events are'} live on the site.`}
        </div>
      </div>
      {pending > 0 ? (
        <a
          href={reviewHref}
          style={{
            background: '#F7F4EE',
            color: '#0F1A33',
            padding: '10px 18px',
            borderRadius: 6,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {isTr ? 'İncelemeye başla' : 'Start reviewing'}
        </a>
      ) : null}
    </div>
  )
}
