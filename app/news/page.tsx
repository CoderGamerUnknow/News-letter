import type { Metadata } from "next";
import styles from "./news.module.css";
import { liveStories, seedLiveStories } from "@/lib/live-news";
import { newspaper } from "@/lib/articles";
import { Page, SiteFooter, SiteHeader } from "@/app/components/news-ui";
import { BreakingTickerClient } from "@/app/components/live-views";
import { RegionNews } from "@/app/components/region-news";

export const metadata: Metadata = {
  title: "News",
  description: `Live headlines from Nigeria, India and the world on ${newspaper.name}.`,
};

export default function NewsPage() {
  return (
    <Page>
      <BreakingTickerClient initial={liveStories.slice(0, 12)} />
      <SiteHeader />

      <main className={styles.main} id="main-content">
        <header className={styles.header}>
          <p className={styles.kicker}>{newspaper.name} · Live Wire</p>
          <h1 className={styles.title}>News</h1>
          <p className={styles.dek}>
            Nigerian, Indian and global headlines, grouped by section as you scroll. Every
            headline links out to the original publisher.
          </p>
        </header>

        <RegionNews initial={seedLiveStories(8)} heading="News by Region" limitPerTopic={8} />
      </main>

      <SiteFooter note="Live headlines refresh automatically · sourced from public RSS feeds." />
    </Page>
  );
}
