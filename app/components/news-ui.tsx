import Link from "next/link";
import styles from "./news-ui.module.css";
import { storyArtSvg } from "./story-art";
import { PhotoLayer } from "./photo-layer";
import { SiteNav } from "./site-nav";
import {
  authorSlug,
  formatDate,
  getFeatured,
  newspaper,
  type Article,
} from "@/lib/articles";

/** Root wrapper that paints every newspaper route with the shared paper theme. */
export function Page({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

/**
 * Masthead + nav. `home` renders the wordmark as the page's single `<h1>`;
 * on content routes the route supplies its own `<h1>` and the wordmark is a
 * plain paragraph, so no page ever ships two top-level headings.
 */
export function SiteHeader({ home = false }: { home?: boolean }) {
  const today = formatDate(getFeatured().date);
  const wordmark = <Link href="/">{newspaper.name}</Link>;

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
        {home ? (
          <h1 className={styles.wordmark}>{wordmark}</h1>
        ) : (
          <p className={styles.wordmark}>{wordmark}</p>
        )}
        <p className={styles.tagline}>{newspaper.tagline}</p>
      </header>

      <SiteNav />
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

