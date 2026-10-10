import type { Metadata } from "next";
import { Suspense } from "react";
import styles from "./search.module.css";
import { Page, SiteFooter, SiteHeader } from "@/app/components/news-ui";
import { SearchBox } from "@/app/components/search-box";
import { newspaper } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Search",
  description: `Search every story in today's edition of ${newspaper.name}.`,
};

export default function SearchPage() {
  return (
    <Page>
      <SiteHeader />

      <main className={styles.main} id="main-content">
        <header className={styles.header}>
          <p className={styles.kicker}>{newspaper.name}</p>
          <h1 className={styles.title}>Search</h1>
        </header>

        {/* The search box reads ?q= on the client, so the shell stays static. */}
        <Suspense fallback={<p className={styles.loading}>Loading search…</p>}>
          <SearchBox />
        </Suspense>
      </main>

      <SiteFooter note="Search runs entirely in your browser." />
    </Page>
  );
}
