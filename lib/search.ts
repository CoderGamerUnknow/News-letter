import { articles, sectionSlug, authorSlug, type Article } from "./articles";

/**
 * A compact search record. We deliberately keep this small (no body text) so
 * the whole index ships to the client as a single JSON payload that is a
 * fraction of the size of the full edition.
 */
export type SearchRecord = {
  slug: string;
  headline: string;
  dek: string;
  section: string;
  author: string;
  date: string;
  readingTime: number;
};

export function toSearchRecord(article: Article): SearchRecord {
  return {
    slug: article.slug,
    headline: article.headline,
    dek: article.dek,
    section: article.section,
    author: article.author,
    date: article.date,
    readingTime: article.readingTime,
  };
}

/** The full search index, newest first. */
export const searchIndex: SearchRecord[] = [...articles]
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(toSearchRecord);

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "at", "by",
  "from", "is", "are", "was", "it", "that", "this", "be", "as",
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));
}

/**
 * Rank the index against a query. Scores favor headline matches over dek
 * matches, and exact phrase presence over scattered tokens. Results are
 * returned best-first.
 */
export function search(query: string, limit = 60): SearchRecord[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return [];

  const phrase = trimmed.toLowerCase();
  const scored: { record: SearchRecord; score: number }[] = [];

  for (const record of searchIndex) {
    const headline = record.headline.toLowerCase();
    const dek = record.dek.toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (headline.includes(token)) score += 5;
      if (dek.includes(token)) score += 2;
      if (record.author.toLowerCase().includes(token)) score += 3;
      if (record.section.toLowerCase().includes(token)) score += 1;
    }

    if (headline.includes(phrase)) score += 10;
    if (dek.includes(phrase)) score += 4;

    if (score > 0) scored.push({ record, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.record.date.localeCompare(a.record.date);
  });

  return scored.slice(0, limit).map((entry) => entry.record);
}

/** Helpers the client needs to build links from a record. */
export function recordSectionPath(record: SearchRecord): string {
  return `/section/${sectionSlug(record.section as never)}`;
}

export function recordAuthorPath(record: SearchRecord): string {
  return `/author/${authorSlug(record.author)}`;
}
