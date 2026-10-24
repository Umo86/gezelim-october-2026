import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are resized once at upload (Payload + sharp) and served from /img, so
  // next/image's on-request optimisation isn't used anywhere.
  images: { unoptimized: true },
  // A cached page older than two hours is rebuilt before it's served (not served stale
  // once more), so dated pages like "this weekend" never reach visitors or crawlers days old.
  expireTime: 7200,
  // The share-image route reads these from disk at runtime, so make sure Vercel bundles them.
  outputFileTracingIncludes: {
    '/og/**/*': ['./src/assets/fonts/**/*', './public/brand/wordmark.svg'],
  },
  experimental: {
    // Room for one resized poster plus the form fields (Vercel's request limit is 4.5 MB).
    serverActions: { bodySizeLimit: '4mb' },
    // A branded 404 for addresses that match no route.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
