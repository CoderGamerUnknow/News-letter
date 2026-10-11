#!/usr/bin/env node
/**
 * Build-time news fetcher.
 *
 * Pulls real headlines from global news RSS feeds and writes a normalized
 * snapshot to `lib/live-news.json`, which the app reads at render time. This
 * runs as a plain Node script *before* `next build`, so a slow or dead feed
 * can never break the build: on failure we keep whatever snapshot already
 * exists (and fall back to an empty one if there is none).
 *
 * Usage:  node scripts/fetch-news.mjs
 * Env:    FETCH_TIMEOUT_MS (per-feed timeout, default 12000)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "lib", "live-news.json");
const FEEDS_FILE = join(ROOT, "lib", "feeds.json");
const BLOCKLIST_FILE = join(ROOT, "lib", "headline-blocklist.json");
const TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS ?? 12000);

/** Keep at most this many items per feed, so one prolific source can't swamp the wire. */
const ITEM_LIMIT = 25;

/**
 * Regions, sections and feed URLs live in `lib/feeds.json` so the build-time
 * and runtime fetchers can never drift apart. We deliberately pull from
 * several outlets per region so the wire is not a single voice.
 */
async function loadFeeds() {
  const raw = await readFile(FEEDS_FILE, "utf8");
  const data = JSON.parse(raw);
  return Array.isArray(data.feeds) ? data.feeds : [];
}

/**
 * The shared headline blocklist (`lib/headline-blocklist.json`). Kept in
 * sync with the runtime fetcher in `lib/rss.ts` by reading the same file, so
 * a story filtered at build time never reappears from /api/live.
 */
async function loadBlocklist() {
  try {
    const raw = await readFile(BLOCKLIST_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map((term) => String(term).toLowerCase()) : [];
  } catch {
    return [];
  }
}

/** Pull the inner text of the first matching tag inside `xml`. */
function pickTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

/**
 * Turn a feed date into an ISO day. Feeds sometimes send a value Date can't
 * parse; returning "" keeps the rest of the feed instead of discarding it.
 */
function toIsoDay(value) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

/** Strip CDATA, HTML and excess whitespace from a snippet. */
function clean(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drop stories whose headline or summary trips the shared blocklist. */
function isCleanStory(story, blocklist) {
  const text = `${story.title} ${story.summary}`.toLowerCase();
  return !blocklist.some((term) => text.includes(term));
}

/** Parse an RSS 2.0 document into a flat list of stories. */
function parseRss(xml, feed, blocklist) {
  const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ?? [];
  return items.map((item) => {
    const title = clean(pickTag(item, "title"));
    const link = clean(pickTag(item, "link"));
    const description = clean(pickTag(item, "description")).slice(0, 240);
    const iso = toIsoDay(pickTag(item, "pubDate"));
    return {
      title,
      link,
      summary: description,
      section: feed.section,
      region: feed.region,
      source: feed.source,
      date: iso,
    };
  }).filter((story) => story.title && story.link && isCleanStory(story, blocklist)).slice(0, ITEM_LIMIT);
}

/** Fetch one feed with a hard timeout; returns [] on any failure. */
async function fetchFeed(feed, blocklist) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "user-agent": "DailyLedgerBuild/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRss(xml, feed, blocklist);
  } catch (err) {
    console.warn(`  ! skip ${feed.source} (${feed.region}/${feed.section}): ${err.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const FEEDS = await loadFeeds();
  const blocklist = await loadBlocklist();
  console.log(`Fetching ${FEEDS.length} feeds across all regions...`);
  const results = await Promise.all(FEEDS.map((feed) => fetchFeed(feed, blocklist)));
  let stories = results.flat();

  // De-dupe by link, keep the newest snapshot ordering by date.
  const seen = new Set();
  stories = stories.filter((story) => {
    if (seen.has(story.link)) return false;
    seen.add(story.link);
    return true;
  });
  stories.sort((a, b) => (a.date < b.date ? 1 : -1));

  if (stories.length === 0) {
    // Network is down or every feed failed: keep the last good snapshot so the
    // build still has real headlines to show.
    console.warn("No stories fetched — keeping previous snapshot.");
    return;
  }

  const snapshot = { fetchedAt: new Date().toISOString(), stories };
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`Wrote ${stories.length} live stories to lib/live-news.json`);
}

main().catch((err) => {
  console.error("fetch-news failed (continuing):", err.message);
  process.exitCode = 0; // never fail the build over news
});
