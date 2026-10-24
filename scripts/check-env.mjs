/*
 * First step of `npm run ci`: checks that the database address reached this build
 * and that the database answers, and says so plainly in the build log before
 * Payload's longer errors. Never prints the password.
 */
import pg from 'pg'

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

const target = `${url.hostname}, database "${url.pathname.slice(1) || '(default)'}", user "${decodeURIComponent(url.username)}"`
console.log(`✓ Database address: ${target}${raw.trim() === address ? '' : ' (extra text around it was ignored)'}`)

const hide = (text) => String(text).split(url.password).join('***')
const client = new pg.Client({
  connectionString: address,
  connectionTimeoutMillis: 20_000,
  application_name: 'gezelim-build-check',
})
try {
  await client.connect()
  const { rows } = await client.query(
    `select current_database() as database, current_user as role, split_part(version(), ' ', 2) as version,
            (select count(*) from information_schema.tables where table_schema = 'public')::int as tables`,
  )
  const r = rows[0]
  console.log(
    `✓ Connected: Postgres ${r.version}, database "${r.database}" as "${r.role}", ${r.tables} tables before migrating`,
  )
} catch (err) {
  fail(`Could not connect to the database (${target}): ${hide(err?.message || err)}`)
} finally {
  await client.end().catch(() => {})
}
