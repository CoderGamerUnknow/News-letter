/**
 * Persistence for stories filed through the /admin desk.
 *
 * The store is a plain JSON file inside the repo (`lib/manual-news.json`), so
 * published stories are committed alongside the code and join the edition on
 * the next build — no database, matching the project's dataset-first design.
 *
 * Note for serverless hosts: their filesystem is read-only, so a publish there
 * cannot persist; run the admin desk on a Node host (local `npm run dev`,
 * `next start`, a VPS) and commit the file.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Article } from "./articles";

const STORE_PATH = path.join(process.cwd(), "lib", "manual-news.json");

/** Every hand-filed story, newest first. A missing/corrupt file is an empty desk. */
export async function readManualStories(): Promise<Article[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as { stories?: Article[] };
    if (!Array.isArray(parsed.stories)) return [];
    return [...parsed.stories].sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

/** Replace the store's contents, newest first so the file diffs read cleanly. */
export async function writeManualStories(stories: Article[]): Promise<void> {
  const ordered = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  await fs.writeFile(
    STORE_PATH,
    `${JSON.stringify({ stories: ordered }, null, 2)}\n`,
    "utf8",
  );
}
