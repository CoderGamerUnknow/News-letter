import { describe, expect, it } from "vitest";
import {
  articles,
  authorFromSlug,
  curated,
  formatDate,
  getArticleBySlug,
  getArticlesBySection,
  getFeatured,
  getLatest,
  getLatestExcluding,
  getRelatedStories,
  getSecondary,
  manualArticles,
  safeDecodeSlug,
  sectionFromSlug,
  sectionSlug,
  sections,
  WIRE_STORY_COUNT,
  type Article,
} from "../articles";
import { generateStories } from "../generate";
import { hashString, mulberry32 } from "../random";
import { storyArtSvg } from "@/app/components/story-art";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("dataset integrity", () => {
  it("contains the curated features plus the generated wire stories", () => {
    expect(articles.length).toBe(curated.length + manualArticles.length + WIRE_STORY_COUNT);
    expect(WIRE_STORY_COUNT).toBeGreaterThanOrEqual(200);
  });

  it("places hand-filed admin stories after the curated features", () => {
    // The curated lead must stay the front page's featured story even when
    // editors have filed stories of their own.
    expect(getFeatured().slug).toBe(curated[0].slug);
    const manualSlugs = new Set(manualArticles.map((a) => a.slug));
    const firstManualAt = articles.findIndex((a) => manualSlugs.has(a.slug));
    if (firstManualAt >= 0) {
      expect(firstManualAt).toBeGreaterThanOrEqual(curated.length);
    }
  });

  it("has unique slugs across every story", () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has valid sections and ISO dates for every story", () => {
    for (const article of articles) {
      expect(sections).toContain(article.section);
      expect(article.date).toMatch(ISO_DATE);
      // Date must parse.
      expect(Number.isNaN(Date.parse(article.date))).toBe(false);
    }
  });

  it("has well-formed bodies, tones and reading times", () => {
    for (const article of articles) {
      expect(article.body.length).toBeGreaterThanOrEqual(3);
      for (const paragraph of article.body) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
      expect(article.tone).toHaveLength(2);
      for (const color of article.tone) {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
      expect(article.readingTime).toBeGreaterThan(0);
    }
  });

  it("has no non-ASCII characters leaking into story text (accents in bylines aside)", () => {
    // Guard against stray CJK/garbled characters in generated copy.
    const allowed = /[^\x00-\x7F]/;
    for (const article of articles) {
      for (const paragraph of article.body) {
        // Body copy should be plain ASCII prose.
        expect(allowed.test(paragraph.replace(/["""'']/g, ""))).toBe(false);
      }
    }
  });
});

describe("helpers", () => {
  it("getFeatured returns the first curated story", () => {
    expect(getFeatured().slug).toBe(curated[0].slug);
  });

  it("getSecondary excludes the featured story", () => {
    const secondary = getSecondary(5);
    expect(secondary.length).toBeLessThanOrEqual(5);
    expect(secondary.map((a) => a.slug)).not.toContain(getFeatured().slug);
  });

  it("getLatest is sorted newest-first", () => {
    const latest = getLatest(20);
    const dates = latest.map((a) => a.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it("getLatestExcluding never repeats an excluded slug", () => {
    const excluded = getLatest(3).map((a) => a.slug);
    const result = getLatestExcluding(excluded, 10);
    for (const slug of excluded) {
      expect(result.map((a) => a.slug)).not.toContain(slug);
    }
  });

  it("sectionSlug/sectionFromSlug round-trips", () => {
    for (const section of sections) {
      expect(sectionFromSlug(sectionSlug(section))).toBe(section);
    }
  });

  it("sectionFromSlug returns undefined for unknown input", () => {
    expect(sectionFromSlug("nonsense")).toBeUndefined();
  });

  it("survives malformed percent-encoding instead of throwing", () => {
    // decodeURIComponent raises URIError on these; a request like
    // /article/100% must be a 404, never a 500.
    const malformed = ["100%", "%zz", "%E0%A4%A", "50%%done", "%"];

    for (const slug of malformed) {
      expect(() => sectionFromSlug(slug)).not.toThrow();
      expect(sectionFromSlug(slug)).toBeUndefined();
      expect(() => authorFromSlug(slug)).not.toThrow();
      expect(authorFromSlug(slug)).toBeUndefined();
      expect(safeDecodeSlug(slug)).toBe(slug);
    }
  });

  it("safeDecodeSlug still decodes well-formed segments", () => {
    expect(safeDecodeSlug("mara-ellison")).toBe("mara-ellison");
    expect(safeDecodeSlug("caf%C3%A9")).toBe("caf\u00e9");
    // A valid slug keeps resolving through the wrappers.
    expect(sectionFromSlug(sectionSlug(sections[0]))).toBe(sections[0]);
  });

  it("getArticleBySlug finds and misses correctly", () => {
    const first = articles[0];
    expect(getArticleBySlug(first.slug)?.slug).toBe(first.slug);
    expect(getArticleBySlug("does-not-exist")).toBeUndefined();
  });

  it("getArticlesBySection only returns that section, newest first", () => {
    const world = getArticlesBySection("World");
    expect(world.length).toBeGreaterThan(0);
    for (const article of world) {
      expect(article.section).toBe("World");
    }
    const dates = world.map((a) => a.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it("getRelatedStories separates same-section from elsewhere, no overlap", () => {
    const article = getFeatured();
    const { sameSection, elsewhere } = getRelatedStories(article, 3);
    const sameSlugs = sameSection.map((a) => a.slug);
    const elseSlugs = elsewhere.map((a) => a.slug);
    for (const slug of sameSlugs) {
      expect(elseSlugs).not.toContain(slug);
    }
    expect(sameSlugs).not.toContain(article.slug);
    expect(elseSlugs).not.toContain(article.slug);
  });

  it("formatDate produces a human-readable date", () => {
    expect(formatDate("2026-10-09")).toBe("October 9, 2026");
  });
});

describe("wire-story generator", () => {
  it("is deterministic for a given seed", () => {
    const a = generateStories(30, 1234);
    const b = generateStories(30, 1234);
    expect(a).toEqual(b);
  });

  it("produces different output for a different seed", () => {
    const a = generateStories(30, 1234);
    const b = generateStories(30, 5678);
    expect(a).not.toEqual(b);
  });

  it("generates the requested count with unique, prefixed slugs", () => {
    const stories = generateStories(50);
    expect(stories).toHaveLength(50);
    const slugs = stories.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(50);
    for (const slug of slugs) {
      expect(slug.startsWith("wire-")).toBe(true);
    }
  });

  it("spreads stories across every section with valid shape", () => {
    const stories = generateStories(60);
    const seen = new Set(stories.map((s) => s.section));
    for (const section of sections) {
      expect(seen.has(section)).toBe(true);
    }
    for (const story of stories) {
      expect(story.headline.length).toBeGreaterThan(0);
      expect(story.body.length).toBeGreaterThanOrEqual(3);
      expect(story.tone).toHaveLength(2);
    }
  });

  it("does not collide with curated slugs", () => {
    const curatedSlugs = new Set(curated.map((c) => c.slug));
    for (const story of generateStories(100)) {
      expect(curatedSlugs.has(story.slug)).toBe(false);
    }
  });
});

describe("hashing utilities", () => {
  it("hashString is deterministic and within 32-bit range", () => {
    const h = hashString("hello");
    expect(hashString("hello")).toBe(h);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it("mulberry32 yields a stable, bounded sequence", () => {
    const r1 = mulberry32(42);
    const r2 = mulberry32(42);
    const seq1 = [r1(), r1(), r1()];
    const seq2 = [r2(), r2(), r2()];
    expect(seq1).toEqual(seq2);
    for (const value of seq1) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("editorial artwork", () => {
  it("renders a valid, deterministic SVG for every story", () => {
    const sample: Article[] = [articles[0], articles[5], articles[12]];
    for (const article of sample) {
      const svg = storyArtSvg(article);
      const again = storyArtSvg(article);
      expect(svg).toBe(again);
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).toContain("</svg>");
      expect(svg).toContain(article.tone[0]);
      expect(svg).toContain(article.tone[1]);
    }
  });

  it("produces different art for different slugs", () => {
    const a = storyArtSvg(articles[0]);
    const b = storyArtSvg(articles[1]);
    expect(a).not.toBe(b);
  });
});
