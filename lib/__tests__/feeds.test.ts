import { describe, expect, it } from "vitest";
import { feeds, newsRegions, topicLabel, topicOrder } from "../feeds";
import { groupByTopic, type LiveStory } from "../live-news";

const REGION_IDS = new Set(newsRegions.map((region) => region.id));

function story(overrides: Partial<LiveStory>): LiveStory {
  return {
    title: "Headline",
    link: "https://example.com/story",
    summary: "",
    section: "World",
    region: "world",
    source: "Example",
    date: "2026-10-09",
    ...overrides,
  };
}

describe("region metadata", () => {
  it("defines the three browsable regions with unique ids", () => {
    expect(newsRegions.map((region) => region.id)).toEqual(["nigeria", "india", "world"]);
    expect(new Set(newsRegions.map((region) => region.id)).size).toBe(newsRegions.length);
    for (const region of newsRegions) {
      expect(region.label.length).toBeGreaterThan(0);
    }
  });

  it("gives every region at least one feed", () => {
    for (const region of newsRegions) {
      expect(feeds.some((feed) => feed.region === region.id)).toBe(true);
    }
  });

  it("keeps every feed well-formed and pointed at a real region", () => {
    expect(feeds.length).toBeGreaterThan(0);
    for (const feed of feeds) {
      expect(REGION_IDS.has(feed.region)).toBe(true);
      expect(feed.source.length).toBeGreaterThan(0);
      expect(topicOrder).toContain(feed.section);
      expect(feed.url.startsWith("https://")).toBe(true);
    }
  });

  it("has no duplicate feed URLs", () => {
    const urls = feeds.map((feed) => feed.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("topic grouping", () => {
  it("orders topics canonically and drops empty ones", () => {
    const stories = [
      story({ section: "Sports" }),
      story({ section: "Business" }),
      story({ section: "World" }),
    ];
    const groups = groupByTopic(stories);
    expect(groups.map((group) => group.section)).toEqual(["World", "Business", "Sports"]);
    expect(groups.map((group) => group.label)).toEqual(["Top Stories", "Business", "Sports"]);
  });

  it("honours the per-topic limit", () => {
    const stories = [
      story({ section: "World", link: "https://example.com/1" }),
      story({ section: "World", link: "https://example.com/2" }),
      story({ section: "World", link: "https://example.com/3" }),
    ];
    const groups = groupByTopic(stories, 2);
    expect(groups).toHaveLength(1);
    expect(groups[0].stories).toHaveLength(2);
  });

  it("returns nothing for an empty wire", () => {
    expect(groupByTopic([])).toEqual([]);
  });

  it("labels the generic World bucket as Top Stories", () => {
    expect(topicLabel("World")).toBe("Top Stories");
    expect(topicLabel("Politics")).toBe("Politics");
  });
});
