import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, hasValidSession } from "@/lib/admin-auth";
import { articles } from "@/lib/articles";
import { buildManualStory, type StoryInput } from "@/lib/manual-news";
import { readManualStories, writeManualStories } from "@/lib/manual-store";

/**
 * The publishing API behind the /admin desk.
 *
 * POST   publish a new story, or update one that was filed earlier
 * DELETE withdraw a hand-filed story (?slug=...)
 *
 * Every write goes through the same validation the preview uses, is checked
 * against every slug in the edition (curated, wire and hand-filed), and lands
 * in `lib/manual-news.json` so the next build picks it up.
 */

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return hasValidSession(store.get(COOKIE_NAME)?.value);
}

function error(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return error("Sign in to the admin desk first.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("Expected a JSON body.", 400);
  }

  const { mode, originalSlug, input } = (body ?? {}) as {
    mode?: string;
    originalSlug?: string;
    input?: StoryInput;
  };

  if (mode !== "create" && mode !== "update") {
    return error("mode must be \"create\" or \"update\".", 400);
  }
  if (mode === "update" && typeof originalSlug !== "string") {
    return error("originalSlug is required when updating.", 400);
  }

  const filed = await readManualStories();
  const editing = mode === "update" ? originalSlug : undefined;
  const isEditingFiled = filed.some((story) => story.slug === editing);
  if (mode === "update" && !isEditingFiled) {
    return error("That story is not on the hand-filed list.", 404);
  }

  // The slug may not shadow anything in the edition except the story being
  // updated (keeping its own slug is fine).
  const taken = new Set(
    articles.map((article) => article.slug).filter((slug) => slug !== editing),
  );

  const result = buildManualStory(input ?? ({} as StoryInput), taken);
  if (!result.ok) {
    return error(result.error, 422);
  }

  const next = mode === "create"
    ? [...filed, result.article]
    : filed.map((story) => (story.slug === editing ? result.article : story));

  try {
    await writeManualStories(next);
  } catch {
    return error(
      "Could not write the story file — this host's filesystem may be read-only. " +
        "Run the admin desk on a local or Node host and commit lib/manual-news.json.",
      503,
    );
  }

  return NextResponse.json({
    ok: true,
    slug: result.article.slug,
    url: `/article/${result.article.slug}`,
  });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return error("Sign in to the admin desk first.", 401);
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return error("A slug query parameter is required.", 400);
  }

  const filed = await readManualStories();
  const next = filed.filter((story) => story.slug !== slug);
  if (next.length === filed.length) {
    return error("That story is not on the hand-filed list.", 404);
  }

  try {
    await writeManualStories(next);
  } catch {
    return error(
      "Could not update the story file — this host's filesystem may be read-only.",
      503,
    );
  }

  return NextResponse.json({ ok: true });
}
