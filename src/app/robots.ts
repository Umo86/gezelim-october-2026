import type { MetadataRoute } from 'next'
import { absoluteUrl, isProductionSite } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Preview and local deployments stay out of search engines entirely.
  if (!isProductionSite()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/*/tr/onizleme/', '/*/en/preview/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
