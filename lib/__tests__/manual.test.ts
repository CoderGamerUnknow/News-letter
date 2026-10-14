import { describe, expect, it } from "vitest";
import {
  buildManualStory,
  estimateReadingTime,
  slugifyStory,
  splitParagraphs,
  toneFor,
} from "../manual-news";
import type { StoryInput } from "../manual-news";

const validInput: StoryInput = {
  headline: "City Opens New Bridge",
  dek: "The span cuts commute times across the river in half.",
  section: "World",
  author: "Staff Reporter",
  date: "2026-10-14",
  body: [
    "The city opened a new bridge on Tuesday.",
    "Construction took three years to complete.",
    "Officials expect traffic to improve at once.",
  ],
};

describe("buildManualStory", () => {
  it("promotes valid input into a complete article", () => {
    const result = buildManualStory(validInput, new Set());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { article } = result;
    expect(article.slug).toBe("city-opens-new-bridge");
    expect(article.section).toBe("World");
    expect(article.readingTime).toBeGreaterThanOrEqual(1);
    expect(article.tone).toHaveLength(2);
    for (const color of article.tone) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("derives the slug from the headline, and honors an explicit one", () => {
    const derived = buildManualStory(validInput, new Set());
    expect(derived.ok && derived.article.slug).toBe("city-opens-new-bridge");

    const explicit = buildManualStory(
      { ...validInput, slug: "bridge-reopens-downtown" },
      new Set(),
    );
    expect(explicit.ok && explicit.article.slug).toBe("bridge-reopens-downtown");
  });

  it("trims and drops empty paragraphs", () => {
    const result = buildManualStory(
      {
        ...validInput,
        body: ["  First.  ", "", "\n", "Second.", "Third."],
      },
      new Set(),
    );
    expect(result.ok && result.article.body).toEqual(["First.", "Second.", "Third."]);
  });

  it("rejects a slug already used elsewhere in the edition", () => {
    const result = buildManualStory(validInput, new Set(["city-opens-new-bridge"]));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("already used");
  });

  it("rejects unknown sections, thin bodies and bad dates", () => {
    const badSection = buildManualStory({ ...validInput, section: "Sport" }, new Set());
    expect(badSection.ok).toBe(false);

    const thinBody = buildManualStory({ ...validInput, body: ["One.", "Two."] }, new Set());
    expect(thinBody.ok).toBe(false);
    if (thinBody.ok) return;
    expect(thinBody.error).toContain("three paragraphs");

    const badDate = buildManualStory({ ...validInput, date: "soon" }, new Set());
    expect(badDate.ok).toBe(false);
  });

  it("rejects missing headline, dek and byline", () => {
    expect(buildManualStory({ ...validInput, headline: "  " }, new Set()).ok).toBe(false);
    expect(buildManualStory({ ...validInput, dek: "" }, new Set()).ok).toBe(false);
    expect(buildManualStory({ ...validInput, author: "" }, new Set()).ok).toBe(false);
  });
});

describe("form helpers", () => {
  it("slugifyStory produces URL-safe segments", () => {
    expect(slugifyStory("Central Bank Holds Rates!")).toBe("central-bank-holds-rates");
    expect(slugifyStory("  Café -- Reopens  ")).toBe("caf-reopens");
    expect(slugifyStory("!!!")).toBe("");
  });

  it("splitParagraphs splits on blank lines and collapses whitespace", () => {
    expect(splitParagraphs("One line.\nStill one line.\n\nTwo.")).toEqual([
      "One line. Still one line.",
      "Two.",
    ]);
    expect(splitParagraphs("   \n\n  ")).toEqual([]);
  });

  it("estimateReadingTime floors at one minute", () => {
    expect(estimateReadingTime(["Short note."])).toBe(1);
    expect(estimateReadingTime([Array(400).fill("word").join(" ")])).toBe(2);
  });

  it("toneFor is deterministic per slug", () => {
    expect(toneFor("some-story")).toEqual(toneFor("some-story"));
    expect(toneFor("some-story")).not.toEqual(toneFor("another-story"));
  });
});
