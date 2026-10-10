"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveStory } from "@/lib/live-news";

const POLL_MS = 5 * 60 * 1000;

/**
 * Shared polling hook. Seeds from the build-time snapshot (so the first paint
 * is instant and works offline), then revalidates from /api/live on an
 * interval. If a poll fails we simply keep the current stories.
 */
export function useLiveStories(initial: LiveStory[]): LiveStory[] {
  const [stories, setStories] = useState<LiveStory[]>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { stories?: LiveStory[] };
        if (!cancelled && Array.isArray(data.stories) && data.stories.length > 0) {
          // Normalize to the shape the UI expects (section/source/date/title/link).
          const normalized: LiveStory[] = data.stories.map((story) => ({
            title: story.title ?? "",
            link: story.link ?? "",
            summary: story.summary ?? "",
            section: story.section ?? "",
            source: story.source ?? "",
            date: story.date ?? "",
          }));
          setStories(normalized);
          loaded.current = true;
        }
      } catch {
        // Offline or endpoint unreachable — keep whatever we already show.
      }
    }

    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return stories;
}
