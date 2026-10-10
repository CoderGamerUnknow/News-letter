import data from "./feeds.json";

/**
 * Region + feed metadata shared by the runtime fetcher (`lib/rss.ts`), the
 * build-time fetcher (`scripts/fetch-news.mjs`, which reads the same JSON) and
 * the region browser UI.
 */

export type RegionId = "nigeria" | "india" | "world";

export type Feed = {
  source: string;
  region: RegionId;
  /** The live sub-topic a headline belongs to (see `topicOrder`). */
  section: string;
  url: string;
};

export type Region = { id: RegionId; label: string };

export const newsRegions = data.regions as Region[];

export const feeds = data.feeds as Feed[];

/** Canonical sub-topic order for the region browser. */
export const topicOrder = [
  "Top Stories",
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Culture",
];

/** How many items to keep from each feed, so one prolific source can't swamp the wire. */
export const feedItemLimit = 25;

/**
 * Map a newspaper section onto its live sub-topic. The paper calls its general
 * international section "World", while the live wire calls the same bucket
 * "Top Stories", so section pages find the right headlines.
 */
export function sectionToTopic(section: string): string {
  return section === "World" ? "Top Stories" : section;
}

/**
 * The sub-topic label for a story. Sections already carry their display name,
 * so this is intentionally the identity — it exists to keep a single place to
 * change that if the vocabulary ever diverges again.
 */
export function topicLabel(section: string): string {
  return section;
}
