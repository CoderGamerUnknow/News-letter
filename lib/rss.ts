/**
 * Server-side RSS fetching + parsing used by the /api/live route to pull
 * headlines on demand, so the page can refresh without a full rebuild. Kept
 * dependency-free with a tolerant regex parser that handles CDATA and HTML.
 */

export type RssStory = {
  title: string;
  link: string;
  summary: string;
  section: string;
  source: string;
  date: string;
};

type Feed = { source: string; section: string; url: string };

const FEEDS: Feed[] = [
  { source: "BBC News", section: "World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "The Guardian", section: "World", url: "https://www.theguardian.com/world/rss" },
  { source: "NYT World", section: "World", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { source: "Al Jazeera", section: "World", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { source: "BBC News", section: "Politics", url: "https://feeds.bbci.co.uk/news/politics/rss.xml" },
  { source: "BBC News", section: "Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { source: "The Guardian", section: "Business", url: "https://www.theguardian.com/business/rss" },
  { source: "Dow Jones", section: "Business", url: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews" },
  { source: "BBC News", section: "Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
  { source: "The Guardian", section: "Technology", url: "https://www.theguardian.com/technology/rss" },
  { source: "NPR", section: "Technology", url: "https://feeds.npr.org/1004/rss.xml" },
  { source: "The Guardian", section: "Culture", url: "https://www.theguardian.com/culture/rss" },
  { source: "BBC News", section: "Culture", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml" },
  { source: "The Guardian", section: "Sports", url: "https://www.theguardian.com/sport/rss" },
  { source: "BBC Sport", section: "Sports", url: "https://feeds.bbci.co.uk/sport/world/rss.xml" },
];

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
      return { title, link, summary, section: feed.section, source: feed.source, date };
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
