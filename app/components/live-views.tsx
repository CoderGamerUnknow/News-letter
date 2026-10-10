"use client";

import type { LiveStory } from "@/lib/live-news";
import { useLiveStories } from "./live-client";
import styles from "./news-ui.module.css";

/**
 * Client versions of the breaking ticker and live wire. They render the
 * build-time snapshot immediately (no layout shift, works offline) and then
 * refresh on an interval so headlines stay current without a rebuild.
 */

export function BreakingTickerClient({ initial }: { initial: LiveStory[] }) {
  const stories = useLiveStories(initial);
  if (stories.length === 0) return null;
  const headlines = stories.slice(0, 12);
  const loop = [...headlines, ...headlines];

  return (
    <div className={styles.ticker} role="region" aria-label="Breaking news">
      <span className={styles.tickerBadge}>Breaking</span>
      <div className={styles.tickerViewport}>
        <div className={styles.tickerTrack} key={stories.map((s) => s.link).join("|").slice(0, 64)}>
          {loop.map((story, index) => {
            // The second pass only exists to loop the marquee, so hide it from
            // assistive tech and keep its links out of the tab order.
            const duplicate = index >= headlines.length;
            return (
              <span
                key={`${story.link}-${index}`}
                className={styles.tickerItem}
                aria-hidden={duplicate ? "true" : undefined}
              >
                <a
                  href={story.link}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={duplicate ? -1 : undefined}
                >
                  {story.title}
                </a>
                <span className={styles.tickerDot} aria-hidden="true">•</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LiveWireClient({
  initial,
  section,
  title = "Live Wire",
}: {
  initial: LiveStory[];
  section?: string;
  title?: string;
}) {
  const all = useLiveStories(initial);
  const stories = (
    section ? all.filter((story) => story.section === section) : all
  ).slice(0, 8);

  if (stories.length === 0) return null;

  return (
    <section className={styles.liveWire} aria-label={`${title} — real-time headlines`}>
      <div className={styles.liveWireHeader}>
        <span className={styles.livePulse} aria-hidden="true" />
        <h2 className={styles.liveWireTitle}>{title}</h2>
        <span className={styles.liveWireNote}>live · auto-updates</span>
      </div>
      <ul className={styles.liveList}>
        {stories.map((story) => (
          <li key={story.link} className={styles.liveItem}>
            <a href={story.link} target="_blank" rel="noreferrer" className={styles.liveLink}>
              <span className={styles.liveHeadline}>{story.title}</span>
              <span className={styles.liveMeta}>
                <span className={styles.liveSource}>{story.source}</span>
                {story.date ? (
                  <time dateTime={story.date}>
                    {new Date(`${story.date}T00:00:00Z`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
