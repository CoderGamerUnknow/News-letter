"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { newsRegions, type RegionId } from "@/lib/feeds";
import { groupByTopic, type LiveStory } from "@/lib/live-news";
import { useLiveStories } from "./live-client";
import styles from "./region-news.module.css";

function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Browse the live wire by region (Nigerian / Indian / Global). Each region
 * renders its sub-topics as always-visible headings stacked down the page, so
 * a reader just scrolls rather than chasing filter buttons. Regions are a
 * proper ARIA tablist: arrow keys, Home and End move between tabs.
 *
 * The component seeds from the build-time snapshot and refreshes from
 * `/api/live` on an interval, exactly like the ticker.
 */
export function RegionNews({
  initial,
  heading = "News by Region",
  limitPerTopic = 5,
}: {
  initial: LiveStory[];
  heading?: string;
  limitPerTopic?: number;
}) {
  const stories = useLiveStories(initial);
  const [active, setActive] = useState<RegionId>(newsRegions[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  // Unique per instance so two RegionNews blocks never clash on element ids.
  const baseId = useId();
  const headingId = `${baseId}-heading`;

  const activeRegion = newsRegions.find((region) => region.id === active) ?? newsRegions[0];
  const groups = useMemo(
    () => groupByTopic(stories.filter((story) => story.region === active), limitPerTopic),
    [stories, active, limitPerTopic],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = newsRegions.findIndex((region) => region.id === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % newsRegions.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + newsRegions.length) % newsRegions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = newsRegions.length - 1;
    if (next < 0) return;

    event.preventDefault();
    setActive(newsRegions[next].id);
    const tabs = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  return (
    <section className={styles.wrap} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        <span className={styles.livePulse} aria-hidden="true" />
        {heading}
        <span className={styles.headingNote}>live · auto-updates</span>
      </h2>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="News regions"
        onKeyDown={handleKeyDown}
        ref={tabsRef}
      >
        {newsRegions.map((region) => {
          const selected = region.id === active;
          return (
            <button
              key={region.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${region.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${region.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setActive(region.id)}
            >
              {region.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active}`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className={styles.panel}
      >
        {groups.length === 0 ? (
          <p className={styles.empty}>
            No live {activeRegion.label.toLowerCase()} headlines right now — the wire refreshes
            automatically.
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.section}
              className={styles.topic}
              aria-labelledby={`${baseId}-topic-${active}-${group.section}`}
            >
              <h3
                id={`${baseId}-topic-${active}-${group.section}`}
                className={styles.topicTitle}
              >
                {group.label}
              </h3>
              <ul className={styles.list}>
                {group.stories.map((story) => (
                  <li key={story.link} className={styles.item}>
                    <a
                      href={story.link}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.link}
                    >
                      <span className={styles.headline}>{story.title}</span>
                      <span className={styles.meta}>
                        <span className={styles.source}>{story.source}</span>
                        {story.date ? (
                          <time dateTime={story.date}>{formatShortDate(story.date)}</time>
                        ) : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
