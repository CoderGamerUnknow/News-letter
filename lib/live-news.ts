import snapshot from "./live-news.json";
import {
  newsRegions,
  sectionToTopic,
  topicLabel,
  topicOrder,
  type RegionId,
} from "./feeds";

/**
 * A real headline pulled from a global news feed at build time.
 *
 * These are external stories — they link out to the original publisher rather
 * than to a local article page, and they carry a `source` credit and a
 * `region` so they can be browsed by region and sub-topic.
 */
export type LiveStory = {
  title: string;
  link: string;
  summary: string;
  section: string;
  region: RegionId;
  source: string;
  date: string;
};

type Snapshot = { fetchedAt: string; stories: LiveStory[] };

const data = snapshot as Snapshot;

/**
 * Every live story in the snapshot, newest first. Snapshots written before
 * regions existed are normalized to the global region rather than dropped.
 */
export const liveStories: LiveStory[] = (Array.isArray(data.stories) ? data.stories : []).map(
  (story) => ({ ...story, region: story.region ?? "world" }),
);

/**
 * Live stories for one newspaper section, newest first. The paper's "World"
 * section maps onto the live wire's "Top Stories" bucket, and by default only
 * the global wire is used so a section page reads as one coherent edition
 * rather than a mix of regional feeds. Regional headlines live in the region
 * browser (`getLiveByRegion`).
 */
export function getLiveBySection(
  section: string,
  limit = 6,
  region: RegionId = "world",
): LiveStory[] {
  const topic = sectionToTopic(section);
  return liveStories
    .filter((story) => story.section === topic && story.region === region)
    .slice(0, limit);
}

/** Live stories for one region, newest first. */
export function getLiveByRegion(region: RegionId, limit = Infinity): LiveStory[] {
  return liveStories.filter((story) => story.region === region).slice(0, limit);
}

/** One sub-topic block inside a region. */
export type TopicGroup = { section: string; label: string; stories: LiveStory[] };

/**
 * Group stories into the canonical sub-topic order, dropping empty topics so a
 * region only ever shows headings it actually has headlines for.
 */
export function groupByTopic(stories: LiveStory[], limitPerTopic = Infinity): TopicGroup[] {
  const groups: TopicGroup[] = [];
  for (const section of topicOrder) {
    const matches = stories.filter((story) => story.section === section);
    if (matches.length === 0) continue;
    groups.push({
      section,
      label: topicLabel(section),
      stories: matches.slice(0, limitPerTopic),
    });
  }
  return groups;
}

/**
 * A compact seed for the client region browser. It takes the newest few
 * stories per sub-topic in each region (rather than a flat newest-first
 * slice), so every heading can render server-side while the inlined payload
 * stays small. The client refreshes the full wire from `/api/live` on mount.
 */
export function seedLiveStories(perTopic = 8): LiveStory[] {
  return newsRegions.flatMap((region) =>
    groupByTopic(getLiveByRegion(region.id), perTopic).flatMap((group) => group.stories),
  );
}

/** The freshest headlines across every region — used for the breaking ticker. */
export function getBreaking(limit = 10): LiveStory[] {
  return liveStories.slice(0, limit);
}
