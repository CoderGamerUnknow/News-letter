import { NextResponse } from "next/server";
import { fetchLiveStories, type RssStory } from "@/lib/rss";

/**
 * On-demand headlines. The client polls this so the ticker and live wires can
 * refresh without a full rebuild. Feeds are fetched server-side with a hard
 * timeout; on failure we return an empty list rather than erroring, so the
 * client just keeps what it already has.
 */

/** How long a fetched wire is reused before the feeds are hit again. */
const CACHE_MS = 3 * 60 * 1000;

/** Enough headlines per region to fill every sub-topic block several times over. */
const PER_REGION_LIMIT = 60;

type Wire = { at: number; stories: RssStory[] };

let cache: Wire | null = null;

/**
 * Trim the wire to the newest headlines per region and re-sort so the ticker
 * still sees a globally newest-first list. Without this the response carried
 * every item from every feed (~350 KB per poll).
 */
function wirePayload(stories: RssStory[]): RssStory[] {
  const byRegion = new Map<string, RssStory[]>();
  for (const story of stories) {
    const list = byRegion.get(story.region);
    if (list) list.push(story);
    else byRegion.set(story.region, [story]);
  }
  return [...byRegion.values()]
    .flatMap((list) => list.slice(0, PER_REGION_LIMIT))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function GET() {
  const now = Date.now();

  if (!cache || now - cache.at > CACHE_MS) {
    const stories = await fetchLiveStories();
    // Never replace a good wire with an empty one — if every feed failed we
    // keep serving the last good snapshot until the next poll.
    if (stories.length > 0) {
      cache = { at: now, stories: wirePayload(stories) };
    }
  }

  const wire = cache;
  return NextResponse.json(
    { fetchedAt: new Date(wire?.at ?? now).toISOString(), stories: wire?.stories ?? [] },
    { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=240" } },
  );
}
