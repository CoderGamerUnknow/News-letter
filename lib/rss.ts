/**
 * Server-side RSS fetching + parsing used by the /api/live route to pull
 * headlines on demand, so the page can refresh without a full rebuild. Kept
 * dependency-free with a tolerant regex parser that handles CDATA and HTML.
 */

import { feeds, type Feed, type RegionId } from "./feeds";

export type RssStory = {
  title: string;
  link: string;
  summary: string;
  section: string;
  region: RegionId;
  source: string;
  date: string;
};

const FEEDS: Feed[] = feeds;

const TIMEOUT_MS = 8000;

function pickTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function clean(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRss(xml: string, feed: Feed): RssStory[] {
  const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) ?? [];
  return items
    .map((item) => {
      const title = clean(pickTag(item, "title"));
      const link = clean(pickTag(item, "link"));
      const summary = clean(pickTag(item, "description")).slice(0, 240);
      const pubDate = pickTag(item, "pubDate");
      const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";
      return {
        title,
        link,
        summary,
        section: feed.section,
        region: feed.region,
        source: feed.source,
        date,
      };
    })
    .filter((story) => story.title && story.link);
}

async function fetchFeed(feed: Feed): Promise<RssStory[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "user-agent": "DailyLedgerLive/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return parseRss(await res.text(), feed);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch every feed in parallel and return de-duplicated, newest-first stories. */
export async function fetchLiveStories(): Promise<RssStory[]> {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const seen = new Set<string>();
  const stories = results.flat().filter((story) => {
    if (seen.has(story.link)) return false;
    seen.add(story.link);
    return true;
  });
  stories.sort((a, b) => (a.date < b.date ? 1 : -1));
  return stories;
}
