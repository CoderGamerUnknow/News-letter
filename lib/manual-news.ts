/**
 * The rules for a story filed by hand through the /admin desk.
 *
 * This module is deliberately pure (no Node APIs) so the admin form can
 * validate and preview in the browser with the exact same rules the publish
 * API enforces on the server. The actual persistence lives in
 * `lib/manual-store.ts`, and `lib/articles.ts` merges the stored stories into
 * the edition.
 */

import { sections, type Article, type Section } from "./articles";
import { hashString } from "./random";

/** What the admin form submits before it becomes a full `Article`. */
export type StoryInput = {
  /** URL segment; derived from the headline when left blank. */
  slug?: string;
  headline: string;
  dek: string;
  section: string;
  author: string;
  /** ISO day, e.g. "2026-10-14". Defaults to today. */
  date?: string;
  /** Article text, one entry per paragraph. */
  body: string[];
};

export type BuildResult =
  | { ok: true; article: Article }
  | { ok: false; error: string };

/** Deramped press-style duotone pairs, matched to the curated palette. */
const TONE_PAIRS: [string, string][] = [
  ["#1d3557", "#457b9d"],
  ["#5c4033", "#a2693d"],
  ["#3a0ca3", "#7209b7"],
  ["#0b525b", "#219ebc"],
  ["#6a4c93", "#b5179e"],
  ["#1b4332", "#40916c"],
  ["#7f5539", "#ddb892"],
  ["#432818", "#99582a"],
];

/** URL segment for a filed story, e.g. "City Opens Bridge" -> "city-opens-bridge". */
export function slugifyStory(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Split pasted copy into paragraphs on blank lines, dropping empties. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Reading time at ~200 words per minute, floored at one minute. */
export function estimateReadingTime(body: readonly string[]): number {
  const words = body.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** A deterministic tone pair for a slug, so re-saving never reshuffles the art. */
export function toneFor(slug: string): [string, string] {
  return TONE_PAIRS[hashString(slug) % TONE_PAIRS.length];
}

/** Today as an ISO day, used when an admin leaves the date blank. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Validate an admin's entry and promote it to a full `Article`.
 *
 * `takenSlugs` must cover every slug in the edition (curated, wire and
 * previously filed stories) so a new story can never shadow an existing one.
 */
export function buildManualStory(
  input: StoryInput,
  takenSlugs: ReadonlySet<string>,
): BuildResult {
  const headline = input.headline?.trim() ?? "";
  if (!headline) return { ok: false, error: "A headline is required." };
  if (headline.length > 120) {
    return { ok: false, error: "The headline must be 120 characters or fewer." };
  }

  const dek = input.dek?.trim() ?? "";
  if (!dek) return { ok: false, error: "A dek (summary line) is required." };
  if (dek.length > 300) {
    return { ok: false, error: "The dek must be 300 characters or fewer." };
  }

  if (!sections.includes(input.section as Section)) {
    return { ok: false, error: "Pick one of the newspaper's sections." };
  }
  const section = input.section as Section;

  const author = input.author?.trim() ?? "";
  if (!author) return { ok: false, error: "A byline is required." };
  if (author.length > 80) {
    return { ok: false, error: "The byline must be 80 characters or fewer." };
  }

  const date = (input.date?.trim() || todayIso()).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return { ok: false, error: "The date must be a real day, e.g. 2026-10-14." };
  }

  const body = (input.body ?? []).map((p) => p.trim()).filter(Boolean);
  if (body.length < 3) {
    return {
      ok: false,
      error: "The story needs at least three paragraphs (separate them with a blank line).",
    };
  }

  const slug = (input.slug?.trim() || slugifyStory(headline)).replace(/^-+|-+$/g, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      ok: false,
      error: "The slug may only contain lowercase letters, numbers and hyphens.",
    };
  }
  if (takenSlugs.has(slug)) {
    return { ok: false, error: `The slug “${slug}” is already used by another story.` };
  }

  return {
    ok: true,
    article: {
      slug,
      headline,
      dek,
      section,
      author,
      date,
      readingTime: estimateReadingTime(body),
      tone: toneFor(slug),
      body,
    },
  };
}
