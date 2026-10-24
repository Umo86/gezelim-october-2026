/*
 * First step of `npm run ci`: says plainly in the build log whether the database
 * address reached this build, before Payload's longer errors. Never prints the password.
 */
const raw = process.env.DATABASE_URL || ''
const address = raw.match(/postgres(?:ql)?:\/\/[^\s'"`]+/)?.[0]

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

if (!raw.trim()) {
  fail(
    'DATABASE_URL is not set for this build. In Vercel → Settings → Environment Variables, ' +
      `add it and tick the "${process.env.VERCEL_ENV || 'current'}" environment.`,
  )
}
if (!address) {
  fail('DATABASE_URL is set but contains no postgresql:// address. Copy the connection string from Neon → Connect.')
}

let url
try {
  url = new URL(address)
} catch {
  fail('DATABASE_URL contains a postgresql:// address that is not valid. Copy it again from Neon → Connect.')
}
if (!url.password) fail('DATABASE_URL has no password in it. Copy the full connection string from Neon → Connect.')

console.log(
  `✓ Database: ${url.hostname}, database "${url.pathname.slice(1) || '(default)'}", user "${decodeURIComponent(url.username)}"` +
    (raw.trim() === address ? '' : ' (extra text around the address was ignored)'),
)
