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
  /** The paper section a headline belongs to, used for the live wire on section pages. */
  section: string;
  url: string;
};

export type Region = { id: RegionId; label: string };

export const newsRegions = data.regions as Region[];

export const feeds = data.feeds as Feed[];

/** Canonical sub-topic order for the region browser. */
export const topicOrder = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Sports",
  "Culture",
];

/**
 * Human label for a live-wire sub-topic. The generic "World" bucket is the
 * region's top headlines, so it reads as "Top Stories" inside a region.
 */
export function topicLabel(section: string): string {
  return section === "World" ? "Top Stories" : section;
}
