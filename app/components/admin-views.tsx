"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { sections, type Article } from "@/lib/articles";
import {
  buildManualStory,
  estimateReadingTime,
  slugifyStory,
  splitParagraphs,
  todayIso,
  type StoryInput,
} from "@/lib/manual-news";

/**
 * The interactive half of the admin desk: sign-in, the hand-filed story list,
 * and the write → preview → confirm flow. Validation runs here with the same
 * rules the publish API applies, so nothing reaches the server that would be
 * rejected, and nothing publishes without an explicit confirmation step.
 */

type Notice = { kind: "ok" | "error"; text: string; url?: string };

type FormState = {
  headline: string;
  dek: string;
  section: string;
  author: string;
  date: string;
  slug: string;
  bodyText: string;
};

function blankForm(): FormState {
  return {
    headline: "",
    dek: "",
    section: sections[0],
    author: "",
    date: todayIso(),
    slug: "",
    bodyText: "",
  };
}

function formFromStory(story: Article): FormState {
  return {
    headline: story.headline,
    dek: story.dek,
    section: story.section,
    author: story.author,
    date: story.date,
    slug: story.slug,
    bodyText: story.body.join("\n\n"),
  };
}

/** Shown when the server has no ADMIN_PASSWORD — the desk cannot lock. */
export function AdminSetupNotice() {
  return (
    <div className={styles.notice}>
      <p className={styles.noticeTitle}>The desk is locked until a password is set.</p>
      <p className={styles.noticeBody}>
        Set <code>ADMIN_PASSWORD</code> in the environment (or{" "}
        <code>.env.local</code> for local dev) and restart the server, then
        reload this page.
      </p>
    </div>
  );
}

/** Shared password sign-in. */
export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Sign-in failed.");
        return;
      }
      setPassword("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.panel} ${styles.form}`} onSubmit={submit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-password">
          Editor password
        </label>
        <input
          className={styles.input}
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />
      </div>
      {error ? (
        <p className={styles.feedbackError} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

/** The desk itself: the filed-story list plus the write/preview/confirm flow. */
export function AdminDesk({ initial }: { initial: Article[] }) {
  const router = useRouter();
  // The filed list always mirrors the server, so a publish or withdrawal that
  // refreshes the route is reflected even while a notice is on screen.
  const stories = initial;
  const [view, setView] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormState>(blankForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [preview, setPreview] = useState<Article | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  const effectiveSlug = slugTouched ? form.slug : slugifyStory(form.headline);

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setPreview(null);
  }

  function startNew() {
    setForm(blankForm());
    setEditingSlug(null);
    setSlugTouched(false);
    setPreview(null);
    setNotice(null);
    setView("form");
  }

  function startEdit(story: Article) {
    setForm(formFromStory(story));
    setEditingSlug(story.slug);
    setSlugTouched(true);
    setPreview(null);
    setNotice(null);
    setView("form");
  }

  function backToList() {
    setView("list");
    setPreview(null);
  }

  /** Step one: render the story exactly as its article page will read. */
  function buildPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: StoryInput = {
      ...form,
      slug: effectiveSlug,
      body: splitParagraphs(form.bodyText),
    };
    const taken = new Set(
      stories.map((story) => story.slug).filter((slug) => slug !== editingSlug),
    );
    const result = buildManualStory(input, taken);
    if (!result.ok) {
      setNotice({ kind: "error", text: result.error });
      setPreview(null);
      return;
    }
    setNotice(null);
    setPreview(result.article);
  }

  /** Step two: the confirmed story goes to the publish API. */
  async function confirmPublish() {
    if (!preview) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: editingSlug ? "update" : "create",
          originalSlug: editingSlug,
          input: { ...form, slug: effectiveSlug, body: splitParagraphs(form.bodyText) },
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        url?: string;
      } | null;
      if (!response.ok || !data?.url) {
        setNotice({ kind: "error", text: data?.error ?? "Publishing failed." });
        return;
      }
      setNotice({
        kind: "ok",
        url: data.url,
        text: editingSlug
          ? `Updated. ${data.url} is live in the edition on the next build.`
          : `Filed. ${data.url} joins the edition on the next build — commit and push (or run npm run build) to publish it to the live site.`,
      });
      setView("list");
      setPreview(null);
      setEditingSlug(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(slug: string) {
    if (!window.confirm(`Withdraw “${slug}” from the edition?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/stories?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setNotice({ kind: "error", text: data?.error ?? "Withdrawing failed." });
        return;
      }
      setNotice({ kind: "ok", text: `“${slug}” withdrawn.` });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const words = splitParagraphs(form.bodyText).join(" ").split(/\s+/).filter(Boolean).length;

  return (
    <>
      <div className={styles.deskBar}>
        <button className={styles.button} type="button" onClick={startNew}>
          Write a story
        </button>
        <button className={styles.buttonSecondary} type="button" onClick={signOut}>
          Sign out
        </button>
      </div>

      {notice ? (
        <p
          className={notice.kind === "ok" ? styles.feedbackOk : styles.feedbackError}
          role="status"
        >
          {notice.text}{" "}
          {notice.url ? <Link href={notice.url}>Read it back</Link> : null}
        </p>
      ) : null}

      {view === "list" ? (
        stories.length === 0 ? (
          <p className={styles.empty}>
            No hand-filed stories yet. Anything you file appears in Latest News,
            its section, search, the RSS feed and the sitemap.
          </p>
        ) : (
          <ul className={styles.list}>
            {stories.map((story) => (
              <li key={story.slug} className={styles.listItem}>
                <span className={styles.listHeadline}>
                  <Link href={`/article/${story.slug}`}>{story.headline}</Link>
                </span>
                <span className={styles.listActions}>
                  <button
                    className={styles.smallButton}
                    type="button"
                    onClick={() => startEdit(story)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.smallButton}
                    type="button"
                    onClick={() => withdraw(story.slug)}
                    disabled={busy}
                  >
                    Withdraw
                  </button>
                </span>
                <span className={styles.listMeta}>
                  {story.section} · {story.date} · By {story.author} · /article/
                  {story.slug}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <form className={styles.form} onSubmit={buildPreview}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="story-headline">
                Headline
              </label>
              <input
                className={styles.input}
                id="story-headline"
                value={form.headline}
                onChange={(event) => field("headline", event.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="story-dek">
                Dek (one-line summary)
              </label>
              <input
                className={styles.input}
                id="story-dek"
                value={form.dek}
                onChange={(event) => field("dek", event.target.value)}
                maxLength={300}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="story-section">
                  Section
                </label>
                <select
                  className={styles.select}
                  id="story-section"
                  value={form.section}
                  onChange={(event) => field("section", event.target.value)}
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="story-date">
                  Date
                </label>
                <input
                  className={styles.input}
                  id="story-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => field("date", event.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="story-author">
                  Byline
                </label>
                <input
                  className={styles.input}
                  id="story-author"
                  value={form.author}
                  onChange={(event) => field("author", event.target.value)}
                  maxLength={80}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="story-slug">
                  Slug
                </label>
                <input
                  className={styles.input}
                  id="story-slug"
                  value={effectiveSlug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    field("slug", event.target.value);
                  }}
                  placeholder="auto from the headline"
                />
                <p className={styles.hint}>
                  The story&apos;s address: /article/{effectiveSlug || "…"}
                </p>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="story-body">
                Body — one paragraph per blank line (three or more)
              </label>
              <textarea
                className={styles.textarea}
                id="story-body"
                value={form.bodyText}
                onChange={(event) => field("bodyText", event.target.value)}
                required
              />
              <p className={styles.hint}>
                {splitParagraphs(form.bodyText).length} paragraph(s) · ~{words}{" "}
                words · {estimateReadingTime(splitParagraphs(form.bodyText))} min
                read
              </p>
            </div>

            <div className={styles.actions}>
              <button className={styles.button} type="submit">
                Preview story
              </button>
              <button
                className={styles.buttonSecondary}
                type="button"
                onClick={backToList}
              >
                Cancel
              </button>
            </div>
          </form>

          {preview ? (
            <section className={styles.preview} aria-label="Story preview">
              <p className={styles.previewKicker}>{preview.section}</p>
              <h2 className={styles.previewHeadline}>{preview.headline}</h2>
              <p className={styles.previewDek}>{preview.dek}</p>
              <p className={styles.previewByline}>
                By {preview.author} · {preview.date} · {preview.readingTime} min
                read
              </p>
              <div className={styles.previewBody}>
                {preview.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={confirmPublish}
                  disabled={busy}
                >
                  {busy
                    ? "Publishing…"
                    : editingSlug
                      ? "Confirm & update"
                      : "Confirm & publish"}
                </button>
                <button
                  className={styles.buttonSecondary}
                  type="button"
                  onClick={() => setPreview(null)}
                >
                  Keep editing
                </button>
              </div>
            </section>
          ) : null}
        </>
      )}
    </>
  );
}
