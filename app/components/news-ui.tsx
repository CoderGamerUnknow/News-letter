import Link from "next/link";
import styles from "./news-ui.module.css";
import { storyArtSvg } from "./story-art";
import { PhotoLayer } from "./photo-layer";
import { getBreaking, hasLiveNews, type LiveStory } from "@/lib/live-news";
import {
  authorSlug,
  formatDate,
  getFeatured,
  newspaper,
  sections,
  sectionSlug,
  type Article,
  type Section,
} from "@/lib/articles";

/** Root wrapper that paints every newspaper route with the shared paper theme. */
export function Page({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function SiteHeader({ activeSection }: { activeSection?: Section }) {
  const today = formatDate(getFeatured().date);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.masthead}>
        <div className={styles.mastheadMeta}>
          <span>{newspaper.issue}</span>
          <span>{today}</span>
          <span>Today&apos;s Edition</span>
        </div>
        <h1 className={styles.wordmark}>
          <Link href="/">{newspaper.name}</Link>
        </h1>
        <p className={styles.tagline}>{newspaper.tagline}</p>
      </header>

      <nav className={styles.nav} aria-label="Sections">
        <ul className={styles.navList}>
          {sections.map((section) => {
            const isActive = section === activeSection;
            return (
              <li key={section}>
                <Link
                  href={`/section/${sectionSlug(section)}`}
                  className={isActive ? styles.navActive : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  {section}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.navUtility}>
          <Link href="/search" className={styles.navSearch}>
            🔍 Search
          </Link>
        </div>
      </nav>
    </>
  );
}

export function SiteFooter({ note }: { note?: React.ReactNode }) {
  return (
    <footer className={styles.footer}>
      <p>
        © {getFeatured().date.slice(0, 4)} {newspaper.name}. All rights reserved.
      </p>
      {note ? <p className={styles.footerNote}>{note}</p> : null}
    </footer>
  );
}

export function Thumb({ article, tall = false }: { article: Article; tall?: boolean }) {
  return (
    <div className={`${styles.thumb} ${tall ? styles.thumbTall : ""}`}>
      {/* Guaranteed procedural fallback — renders instantly with no network. */}
      <div
        className={styles.thumbArt}
        role="img"
        aria-label={`Illustration for “${article.headline}”`}
        dangerouslySetInnerHTML={{
          __html: storyArtSvg(article) + thumbOverlay(article.section),
        }}
      />
      {/* Real photography layered on top; if it fails, the art shows through. */}
      <PhotoLayer
        slug={article.slug}
        sizes={tall ? "(max-width: 900px) 100vw, 60vw" : "(max-width: 900px) 100vw, 33vw"}
      />
    </div>
  );
}

/** The section label chip overlaid on top of the generated artwork. */
function thumbOverlay(section: string): string {
  return `<span class="${styles.thumbLabel}">${section}</span>`;
}

export function Byline({ article }: { article: Article }) {
  return (
    <p className={styles.byline}>
      By{" "}
      <Link className={styles.bylineAuthor} href={`/author/${authorSlug(article.author)}`}>
        {article.author}
      </Link>{" "}
      · <time dateTime={article.date}>{formatDate(article.date)}</time> ·{" "}
      {article.readingTime} min read
    </p>
  );
}

export function StoryCard({ article }: { article: Article }) {
  return (
    <article className={styles.card}>
      <Thumb article={article} />
      <p className={styles.kicker}>{article.section}</p>
      <h3 className={styles.cardHeadline}>
        <Link href={`/article/${article.slug}`}>{article.headline}</Link>
      </h3>
      <p className={styles.cardDek}>{article.dek}</p>
      <Byline article={article} />
    </article>
  );
}

export function StoryGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={styles.sectionHeading}>
      <span>{children}</span>
    </h2>
  );
}

/**
 * A scrolling "breaking" strip of real headlines pulled from global feeds at
 * build time. Purely presentational and CSS-driven — no client JS — and it
 * renders nothing when the wire is empty.
 */
export function BreakingTicker() {
  if (!hasLiveNews) return null;
  const headlines = getBreaking(12);

  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...headlines, ...headlines];

  return (
    <div className={styles.ticker} aria-label="Breaking news">
      <span className={styles.tickerBadge}>Breaking</span>
      <div className={styles.tickerViewport}>
        <div className={styles.tickerTrack}>
          {loop.map((story, index) => (
            <span key={`${story.link}-${index}`} className={styles.tickerItem}>
              <a href={story.link} target="_blank" rel="noreferrer">
                {story.title}
              </a>
              <span className={styles.tickerDot} aria-hidden="true">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A "Live Wire" block of real headlines for a section, each linking out to its
 * original publisher with a source credit and relative date.
 */
export function LiveWire({ stories, title = "Live Wire" }: { stories: LiveStory[]; title?: string }) {
  if (stories.length === 0) return null;

  return (
    <section className={styles.liveWire} aria-label={`${title} — real-time headlines`}>
      <div className={styles.liveWireHeader}>
        <span className={styles.livePulse} aria-hidden="true" />
        <h2 className={styles.liveWireTitle}>{title}</h2>
        <span className={styles.liveWireNote}>from global wires</span>
      </div>
      <ul className={styles.liveList}>
        {stories.map((story) => (
          <li key={story.link} className={styles.liveItem}>
            <a
              href={story.link}
              target="_blank"
              rel="noreferrer"
              className={styles.liveLink}
            >
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
