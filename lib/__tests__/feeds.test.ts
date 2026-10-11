import { describe, expect, it } from "vitest";
import blocklist from "../headline-blocklist.json";
import { feeds, newsRegions, sectionToTopic, topicLabel, topicOrder } from "../feeds";
import { groupByTopic, type LiveStory } from "../live-news";
import { articles, authorSlug, getAllAuthors, sectionSlug, sections } from "../articles";

const REGION_IDS = new Set(newsRegions.map((region) => region.id));

function story(overrides: Partial<LiveStory>): LiveStory {
  return {
    title: "Headline",
    link: "https://example.com/story",
    summary: "",
    section: "Top Stories",
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

  it("covers every sub-topic in every region", () => {
    for (const region of newsRegions) {
      for (const topic of topicOrder) {
        expect(feeds.some((feed) => feed.region === region.id && feed.section === topic)).toBe(
          true,
        );
      }
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

describe("headline blocklist", () => {
  it("is a non-empty list of unique, lowercase terms", () => {
    expect(blocklist.length).toBeGreaterThan(0);
    expect(new Set(blocklist).size).toBe(blocklist.length);
    for (const term of blocklist) {
      expect(term).toBe(term.toLowerCase().trim());
      expect(term.length).toBeGreaterThan(0);
    }
  });
});

describe("topic grouping", () => {
  it("orders topics canonically and drops empty ones", () => {
    const stories = [
      story({ section: "Sports" }),
      story({ section: "Business" }),
      story({ section: "Top Stories" }),
    ];
    const groups = groupByTopic(stories);
    expect(groups.map((group) => group.section)).toEqual([
      "Top Stories",
      "Sports",
    ]);
    expect(groups.map((group) => group.label)).toEqual([
      "Top Stories",
      "Sports",
    ]);
  });

  it("honours the per-topic limit", () => {
    const stories = [
      story({ section: "Top Stories", link: "https://example.com/1" }),
      story({ section: "Top Stories", link: "https://example.com/2" }),
      story({ section: "Top Stories", link: "https://example.com/3" }),
    ];
    const groups = groupByTopic(stories, 2);
    expect(groups).toHaveLength(1);
    expect(groups[0].stories).toHaveLength(2);
  });

  it("returns nothing for an empty wire", () => {
    expect(groupByTopic([])).toEqual([]);
  });

  it("maps the paper's sections onto wire topics, falling back to Top Stories", () => {
    expect(sectionToTopic("World")).toBe("Top Stories");
    expect(sectionToTopic("Business")).toBe("Top Stories");
    expect(sectionToTopic("Technology")).toBe("Top Stories");
    expect(sectionToTopic("Politics")).toBe("Politics");
    expect(sectionToTopic("Culture")).toBe("Culture");
    expect(topicLabel("Top Stories")).toBe("Top Stories");
  });
});

describe("slug universe", () => {
  const articleSlugs = new Set(articles.map((article) => article.slug));
  const sectionSlugs = new Set(sections.map(sectionSlug));
  const authorSlugs = new Set(getAllAuthors().map(authorSlug));

  it("derives a slug for every dynamic route", () => {
    expect(articleSlugs.size).toBeGreaterThan(200);
    expect(sectionSlugs.size).toBe(6);
    expect(authorSlugs.size).toBeGreaterThan(10);
  });

  it("holds the known slugs and rejects invented ones", () => {
    expect(articleSlugs.has("harbor-treaty-signed")).toBe(true);
    expect(sectionSlugs.has("world")).toBe(true);
    expect(articleSlugs.has("never-seen-abc")).toBe(false);
    expect(sectionSlugs.has("nigeria")).toBe(false);
    expect(authorSlugs.has("nobody-xyz")).toBe(false);
  });
});
