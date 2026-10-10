import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import {
  articles,
  getFeatured,
  getLatestExcluding,
  getSecondary,
  newspaper,
  type Article,
} from "@/lib/articles";
import { getBreaking, seedLiveStories } from "@/lib/live-news";
import {
  Byline,
  Page,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  StoryCard,
  StoryGrid,
  Thumb,
} from "./components/news-ui";
import { BreakingTickerClient } from "./components/live-views";
import { RegionNews } from "./components/region-news";

export const metadata: Metadata = {
  title: "Today's Front Page",
  description: newspaper.tagline,
};

export default function Home() {
  const featured = getFeatured();
  const secondary = getSecondary(3);
  // Stories already on the front page must not reappear in the grid below it.
  const latest = getLatestExcluding([
    featured.slug,
    ...secondary.map((article) => article.slug),
  ]);


  return (
    <Page>
      <BreakingTickerClient initial={getBreaking(12)} />
      <SiteHeader home />

      <main className={styles.main} id="main-content">
        <section className={styles.front} aria-label="Front page stories">
          <article className={styles.lead}>
            <Thumb article={featured} tall />
            <p className={styles.kicker}>{featured.section}</p>
            <h2 className={styles.leadHeadline}>
              <Link href={`/article/${featured.slug}`}>{featured.headline}</Link>
            </h2>
            <p className={styles.leadDek}>{featured.dek}</p>
            <Byline article={featured} />
          </article>

          <div className={styles.secondary}>
            <h2 className={styles.columnTitle}>Also on the Front</h2>
            {secondary.map((article) => (
              <SecondaryItem key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className={styles.latest} aria-label="Latest news">
          <SectionHeading>Latest News</SectionHeading>
          <StoryGrid>
            {latest.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </StoryGrid>
        </section>

        <RegionNews initial={seedLiveStories(4)} heading="Latest by Region" limitPerTopic={4} />
      </main>

      <SiteFooter note={`${articles.length} stories in today's edition.`} />
    </Page>
  );
}

function SecondaryItem({ article }: { article: Article }) {
  return (
    <article className={styles.secondaryItem}>
      <p className={styles.kicker}>{article.section}</p>
      <h3 className={styles.secondaryHeadline}>
        <Link href={`/article/${article.slug}`}>{article.headline}</Link>
      </h3>
      <p className={styles.secondaryDek}>{article.dek}</p>
      <Byline article={article} />
    </article>
  );
}
