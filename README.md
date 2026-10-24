# Gezelim

Turkish events across the UK, in Turkish and English. Organisers add events for free through a public form; the Gezelim team checks each one in the admin panel and publishes it.

- **Site:** Next.js 16 (App Router) with static, cached pages
- **Admin and content:** Payload CMS 3, in the same app, at `/admin` (Turkish or English interface)
- **Database:** Postgres (Neon in production)
- **Photos:** Cloudflare R2, served from the site's own domain at `/img/…`
- **Hosting:** Vercel (functions in London, `lhr1`)

## Addresses

Every page is `/<place>/<lang>/…`. The place is `uk` (all events) or a city (`london`, `manchester`, … 32 cities in `src/config/places.ts`). URL words are translated:

| Page | Turkish | English |
| --- | --- | --- |
| Home for a place | `/london/tr` | `/london/en` |
| All events | `/london/tr/etkinlikler` | `/london/en/events` |
| Category | `/london/tr/etkinlikler/konserler` | `/london/en/events/concerts` |
| Date page | `/london/tr/etkinlikler/bu-hafta-sonu` | `/london/en/events/this-weekend` |
| Event | `/london/tr/etkinlik/<slug>` | `/london/en/event/<slug>` |
| Venue | `/london/tr/mekan/<slug>` | `/london/en/places/<slug>` |
| Organiser | `/uk/tr/organizatorler/<slug>` | `/uk/en/organisers/<slug>` |
| Add an event | `/uk/tr/etkinlik-ekle` | `/uk/en/add-event` |

Date pages exist for today, tomorrow, this weekend, this week and next week. `/` and `/london` send readers to their saved language (Turkish by default). There are no redirects by IP or browser language, because Google crawls from the US. Wrong-language words (`/london/tr/events`) redirect permanently to the right one. The rules live in `src/proxy.ts`.

## Search engines

Built for Google, Bing and the rest:

- **Fast pages:** pages are pre-rendered and cached; the database is only read when content changes (Payload hooks call `revalidateTag`) or once an hour so "this weekend" stays current.
- **Tags:** every page has its own title, description, canonical, and `tr`/`en`/`x-default` hreflang tags.
- **Structured data:** Event schema (with the right subtype, London-time dates, location, offers, organiser, line-up and status), BreadcrumbList, Place for venues, Organization and WebSite.
- **Sitemap:** `/sitemap.xml` lists every live page in both languages with hreflang and event images. Sample events, empty pages and untranslated copies are left out.
- **IndexNow:** pings Bing, Yandex, Seznam and Naver on every publish, edit or removal. Set `INDEXNOW_KEY`.
- **Verification tags:** Google, Bing and Yandex, set through environment variables.
- **Noindex rules:** empty city, category and date pages; sample content; untranslated copies (these point their canonical at the original); events six months after they end.
- **Stable links:** renaming an event keeps its old address working with a 301; an event moved to another city redirects too.
- **Previews off the index:** `robots.txt` blocks everything except on the production deployment.

After launch: add the site to [Google Search Console](https://search.google.com/search-console) and [Bing Webmaster Tools](https://www.bing.com/webmasters) and submit `https://gezelim.co/sitemap.xml` in both. Bing also feeds DuckDuckGo, Yahoo, Ecosia and ChatGPT search.

## Content model (Payload collections)

- **Events:** title, short and full description, line-up, poster, category, event language, age limit, start and end (London time), city, venue, price or free, ticket link, sold out, status (going ahead, cancelled, postponed, new date), featured, SEO overrides. Drafts are on: anything from the public form arrives as a draft.
- **Venues:** name, city, address, postcode (map position filled from postcodes.io), website.
- **Organisers:** name, bio, logo, links, verified flag, and private contact details only staff can read.
- **Images:** uploads get a content-hash file name and pre-made sizes (4:5 card crops around the focal point, the full poster, and a 1200×630 share image that letterboxes the poster on brand blue).
- **Team:** admins and editors. The first account created on `/admin` becomes an admin.

Text fields are stored per language (Turkish and English). If an event has only one language, the other page shows it with a note and points search engines at the original.

## Moderation

1. An organiser fills in `/uk/tr/etkinlik-ekle`. The browser shrinks large posters before upload; spam is stopped by a hidden field, a minimum time on the page and Cloudflare Turnstile (when keys are set).
2. The event, its venue and its organiser are created (reusing ones that match). The event is a draft, so nothing is public yet. If `ADMIN_NOTIFY_EMAIL` and `RESEND_API_KEY` are set, the team gets an email.
3. The admin dashboard shows how many events are waiting, with a link to them. Open one, use **Preview** to see the real page, fix anything, add the English version, then **Publish**. The site updates on the next visit.

## Running it locally

Needs Node 22.23+ (or 24.22+) and Postgres.

```bash
cp .env.example .env          # set DATABASE_URL and PAYLOAD_SECRET
npm install
npm run migrate               # create the tables
npm run seed                  # optional: 31 sample events across 10 cities
npm run dev                   # http://localhost:3000 → /uk/tr, admin at /admin
```

`npm run seed:clear` removes every sample record. Sample events carry an "Örnek / Sample" label, are kept out of the sitemap and structured data, and are marked noindex.

Other scripts: `npm run build`, `npm run start`, `npm test` (URL, slug and date rules), `npm run typecheck`, `npm run lint`.

## Changing the data model

The schema only changes through migrations (Payload `push` is off, in development too):

```bash
npm run migrate:create -- describe-your-change   # after editing a collection
npm run migrate
```

Adding a city or category means editing `src/config/places.ts` or `src/config/categories.ts`, then creating a migration (both are database enums).

## Deploying (Vercel + Neon + R2)

1. **Database:** create a Neon project in `aws-eu-west-2` (London), or add Neon from the Vercel Marketplace, and set `DATABASE_URL`.
2. **Photos:** create an R2 bucket (private), an R2 API token with read and write access to it, and set the four `R2_*` variables. Photos are served through `/img/…` with a one-year cache, so the bucket never needs to be public.
3. **Vercel:** import the repository. `vercel.json` sets the build command (`npm run ci` = migrations, then the build) and the London region. Set `PAYLOAD_SECRET` and the rest from `.env.example`.
4. **First admin:** open `/admin` and create the first account (the first account becomes the admin, so do this before sharing the address).
5. **Domain and launch:** add `gezelim.co` to the project, redirect `gezelim.co.uk` to it, then set `NEXT_PUBLIC_SITE_URL=https://gezelim.co` for Production and redeploy. Until that variable is set, every deployment (including `*.vercel.app`) tells search engines to stay away, so the temporary address never competes with the real one.
6. **Search:** set `INDEXNOW_KEY` and the verification tags, then submit the sitemap in Google Search Console and Bing Webmaster Tools.

To fill a fresh database with the sample events: `npm run seed` (or `npm run seed -- no-images` before photo storage is set up). `npm run seed:clear` removes them again. On Vercel, set `SAMPLE_EVENTS=on` and the build fills an empty database with them; `SAMPLE_EVENTS=off` removes them on the next deployment.

Admin photo uploads go through a Vercel function, so files over about 4 MB need resizing first; the public form already resizes in the browser.

## Where things are

```
src/
  app/(frontend)/[place]/[lang]/   public pages (home, events, event, venue, organiser, add-event, about, privacy, preview)
  app/(payload)/                   Payload admin and REST API
  app/img/[...path]/               photo delivery from R2 (or ./media locally)
  app/sitemap.ts, robots.ts        search engine files
  collections/                     Events, Venues, Organisers, Media, Users
  components/site/                 page components (EventArt draws the çini posters)
  config/                          cities and categories
  i18n/                            URL words, interface text in both languages
  lib/                             queries (cached), dates (London time), SEO, IndexNow
  proxy.ts                         URL language rules
  seed/                            sample data
```

## Design

Iznik tile palette: çini blue `#1F3FBF`, gece navy `#0F1A33`, ayran `#F7F4EE`, mercan `#FF5A3C`, fıstık `#8DB36B`, taş `#E9E3D8`. One typeface, Archivo: condensed 800 for headlines, regular width for text. Events without a photo get a generated poster from tile motifs (star, çintemani, tulip, rosette, kilim); the category picks the motif and the event picks the colours.
