import { HoverLink as Link } from './HoverLink'
import { absoluteUrl } from '@/lib/site'
import { JsonLd } from './JsonLd'

export type Crumb = { name: string; href: string }

/** Visible trail plus BreadcrumbList structured data. The last crumb is the current page. */
export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <>
      <nav aria-label={label} className="ui text-[0.9rem] text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => {
            const last = i === items.length - 1
            return (
              <li key={item.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-gece">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="hover:text-gece hover:underline">
                      {item.name}
                    </Link>
                    <span aria-hidden="true" className="text-tas-deep">
                      /
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: absoluteUrl(item.href),
          })),
        }}
      />
    </>
  )
}
