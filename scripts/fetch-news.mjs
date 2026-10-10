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

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "lib", "live-news.json");
const TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS ?? 12000);

/**
 * Global sources mapped onto the paper's six sections. We deliberately pull
 * from several outlets so the wire is not a single voice.
 */
const FEEDS = [
  // World
  { source: "BBC News", section: "World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "The Guardian", section: "World", url: "https://www.theguardian.com/world/rss" },
  { source: "NYT World", section: "World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { source: "Al Jazeera", section: "World", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  // Politics
  { source: "BBC News", section: "Politics", url: "https://feeds.bbci.co.uk/news/politics/rss.xml" },
  { source: "NYT Politics", section: "Politics", url: "https://rss.nytimes.com/services/xml/rss/nyt/politics.xml" },
  // Business
  { source: "BBC News", section: "Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { source: "The Guardian", section: "Business", url: "https://www.theguardian.com/business/rss" },
  { source: "NYT Business", section: "Business", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" },
  { source: "Dow Jones", section: "Business", url: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews" },
  // Technology
  { source: "BBC News", section: "Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
  { source: "The Guardian", section: "Technology", url: "https://www.theguardian.com/technology/rss" },
  { source: "NYT Technology", section: "Technology", url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml" },
  { source: "NPR", section: "Technology", url: "https://feeds.npr.org/1004/rss.xml" },
  // Culture
  { source: "The Guardian", section: "Culture", url: "https://www.theguardian.com/culture/rss" },
  { source: "BBC News", section: "Culture", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml" },
  // Sports
  { source: "The Guardian", section: "Sports", url: "https://www.theguardian.com/sport/rss" },
  { source: "BBC Sport", section: "Sports", url: "https://feeds.bbci.co.uk/sport/world/rss.xml" },
];

/** Pull the inner text of the first matching tag inside `xml`. */
function pickTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].trim() : "";
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

/** Parse an RSS 2.0 document into a flat list of stories. */
function parseRss(xml, feed) {
  const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ?? [];
  return items.map((item) => {
    const title = clean(pickTag(item, "title"));
    const link = clean(pickTag(item, "link"));
    const description = clean(pickTag(item, "description")).slice(0, 240);
    const pubDate = pickTag(item, "pubDate");
    const iso = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
    return {
      title,
      link,
      summary: description,
      section: feed.section,
      source: feed.source,
      date: iso,
    };
  }).filter((story) => story.title && story.link);
}

/** Fetch one feed with a hard timeout; returns [] on any failure. */
async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "user-agent": "DailyLedgerBuild/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRss(xml, feed);
  } catch (err) {
    console.warn(`  ! skip ${feed.source} (${feed.section}): ${err.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`Fetching ${FEEDS.length} global feeds...`);
  const results = await Promise.all(FEEDS.map(fetchFeed));
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
