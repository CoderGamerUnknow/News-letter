# The Daily Ledger

A print-style newspaper front end built with Next.js (App Router). The paper is
generated from one typed dataset — no CMS, no database — so it builds to static
HTML and can be deployed anywhere. It also pulls real headlines from global news
wires at build time and refreshes them on the client without a rebuild.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # fetches live news, then type-checks + production build
npm start        # serve the production build
npm run news     # refresh the live-news snapshot on its own
npm run lint     # ESLint (next/core-web-vitals + typescript)
npm test         # vitest
```

`npm run build` runs a `prebuild` step (`scripts/fetch-news.mjs`) that pulls
headlines from global RSS feeds into `lib/live-news.json`. If the network is
down it keeps the previous snapshot and never fails the build.

## Routes

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Lead story, secondary column, latest grid, live wires |
| `/article/[slug]` | `app/article/[slug]/page.tsx` | Full story, share row, reactions, related stories |
| `/article/[slug]/opengraph-image` | `app/article/[slug]/opengraph-image.tsx` | Generated social card per story (`next/og`) |
| `/section/[slug]` | `app/section/[slug]/page.tsx` | Section front, paginated story grid, live wire |
| `/author/[slug]` | `app/author/[slug]/page.tsx` | Every story by one contributor |
| `/news` | `app/news/page.tsx` | Live headlines by region (Nigerian / Indian / Global) |
| `/search` | `app/search/page.tsx` | Client-side search across the edition |
| `/api/live` | `app/api/live/route.ts` | On-demand headlines for client polling |
| `not-found` | `app/not-found.tsx` | Unknown slugs and unmatched URLs |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml` | `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` | Generated from the same dataset |

## Features

- **Content at scale** — 20 hand-written features plus a seeded, deterministic
  wire-story generator (`lib/generate.ts`) that fills the edition to hundreds of
  stories. Bump `WIRE_STORY_COUNT` in `lib/articles.ts` to grow it.
- **Real global news** — BBC, The Guardian, NYT, Al Jazeera, NPR and Dow Jones
  feeds are pulled at build time and shown in the breaking ticker and per-section
  "Live Wire" blocks, each linking out to the original publisher.
- **News by region** — `/news` (and a front-page block) groups live headlines into
  **Nigerian News**, **Indian News** and **Global News**. Nigerian and Indian
  outlets are included alongside the global wires. Each region lists its
  sub-topics (Top Stories, Politics, Business, Technology, Sports, Culture) as
  always-visible headings you scroll through; the region tabs are a full ARIA
  tablist with arrow-key navigation.
- **Live updates** — the ticker and live wires poll `/api/live` every few
  minutes, so headlines refresh without a rebuild.
- **Search** — `/search` filters the whole edition in the browser (`lib/search.ts`).
- **Author pages** — bylines link to `/author/[slug]`.
- **Related stories** — scored by keyword overlap, not just section.
- **Real photos** — each card layers a seeded photo from `picsum.photos` over
  procedural SVG art, which acts as an offline fallback.
- **Social cards** — a generated OpenGraph/Twitter image per article.
- **Share + reactions** — Web Share/copy-link and local-only reaction marks.
- **Pagination** — section grids reveal a page at a time with "Load more".

## Content

Everything lives in [`lib/articles.ts`](lib/articles.ts):

- `articles` — curated features followed by generated wire stories.
- `sections`, `newspaper` — section names and masthead metadata.
- helpers — `getFeatured`, `getSecondary`, `getLatest`, `getLatestExcluding`,
  `getArticlesBySection`, `getArticlesByAuthor`, `getRelatedStories`,
  `sectionSlug`/`sectionFromSlug`, `authorSlug`/`authorFromSlug`, `formatDate`.

Live headlines live in `lib/live-news.ts` (a typed loader over the build-time
snapshot `lib/live-news.json`), with `getLiveByRegion` and `groupByTopic`
helpers backing the region browser. The regions and their RSS feeds are defined
once in `lib/feeds.json`, which both the runtime fetcher (`lib/rss.ts`) and the
build-time script (`scripts/fetch-news.mjs`) read, so they cannot drift apart.
Add a feed there and it appears in its region and section automatically.

## Styling

- `app/globals.css` — palette and font variables (`--ink`, `--paper`, `--rule`,
  `--accent`, `--serif`, `--sans`) plus a dark-scheme override.
- `app/components/news-ui.tsx` (+ `.module.css`) — shared chrome and cards.
- Feature components (`search-box`, `reactions`, `share-row`, `story-pager`,
  `live-views`, `photo-layer`) are colocated with their styles.
- Animations respect `prefers-reduced-motion`.

## Deploying

1. Set `NEXT_PUBLIC_SITE_URL` to your real origin so metadata, the sitemap and
   the feed use it instead of the placeholder in `siteUrl`.
2. Build with `npm run build` (or let the platform run it — the `prebuild`
   news fetch is wired in). The `/api/live` route is dynamic and needs a Node
   runtime (it is not part of a pure static export).
3. Any Node host works (Vercel, Netlify, a container). `npm start` serves the
   production build locally.

The only build-time network dependency is the news fetch, and it degrades
gracefully to the last snapshot if feeds are unreachable.
