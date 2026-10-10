import { NextResponse } from "next/server";
import { fetchLiveStories } from "@/lib/rss";

/**
 * On-demand headlines. The client polls this so the ticker and live wires can
 * refresh without a full rebuild. Feeds are fetched server-side with a hard
 * timeout; on failure we return an empty list rather than erroring, so the
 * client just keeps what it already has.
 */
export async function GET() {
  const stories = await fetchLiveStories();
  return NextResponse.json(
    { fetchedAt: new Date().toISOString(), stories },
    { headers: { "cache-control": "no-store" } },
  );
}
