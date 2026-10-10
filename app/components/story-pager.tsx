"use client";

import { useState } from "react";
import type { StorySummary } from "@/lib/articles";
import { StoryCard } from "./news-ui";
import styles from "./story-pager.module.css";

const PAGE_SIZE = 9;

/**
 * Renders a grid of story cards, revealing a page at a time so a section with
 * hundreds of stories does not dump them all into the DOM at once. The button
 * disappears once everything is shown.
 */
export function StoryPager({ stories }: { stories: StorySummary[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = stories.slice(0, visible);
  const remaining = stories.length - shown.length;

  return (
    <>
      <div className={styles.grid}>
        {shown.map((story) => (
          <StoryCard key={story.slug} article={story} />
        ))}
      </div>

      {remaining > 0 ? (
        <div className={styles.moreWrap}>
          <button
            type="button"
            className={styles.moreButton}
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            Load {Math.min(remaining, PAGE_SIZE)} more{" "}
            <span className={styles.moreCount}>({remaining} remaining)</span>
          </button>
        </div>
      ) : (
        <p className={styles.end}>
          You&apos;ve reached the end — {stories.length}{" "}
          {stories.length === 1 ? "story" : "stories"} in this section.
        </p>
      )}
    </>
  );
}
