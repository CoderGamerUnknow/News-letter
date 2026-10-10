import snapshot from "./live-news.json";

/**
 * A real headline pulled from a global news feed at build time.
 *
 * These are external stories — they link out to the original publisher rather
 * than to a local article page, and they carry a `source` credit.
 */
export type LiveStory = {
  title: string;
  link: string;
  summary: string;
  section: string;
  source: string;
  date: string;
};

type Snapshot = { fetchedAt: string; stories: LiveStory[] };

const data = snapshot as Snapshot;

/** When the snapshot was pulled, or null if there is no data yet. */
export const liveFetchedAt: string | null = data.fetchedAt || null;

/** Every live story in the snapshot, newest first. */
export const liveStories: LiveStory[] = Array.isArray(data.stories) ? data.stories : [];

/** True when the wire has real headlines to show. */
export const hasLiveNews: boolean = liveStories.length > 0;

/** Live stories for one section, newest first. Section names match ours. */
export function getLiveBySection(section: string, limit = 6): LiveStory[] {
  return liveStories.filter((story) => story.section === section).slice(0, limit);
}

/** The freshest headlines across every section — used for the breaking ticker. */
export function getBreaking(limit = 10): LiveStory[] {
  return liveStories.slice(0, limit);
}

/** Source names present in the wire, for credit lines. */
export function getLiveSources(): string[] {
  return [...new Set(liveStories.map((story) => story.source))].sort();
}
