import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";
import {
  getLatest,
  newspaper,
  sections,
  sectionSlug,
} from "@/lib/articles";
import { Page, SiteFooter, SiteHeader } from "./components/news-ui";

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you asked for is not part of ${newspaper.issue} of ${newspaper.name}.`,
};

export default function NotFound() {
  const headlines = getLatest(3);

  return (
    <Page>
      <SiteHeader />

      <main className={styles.main} id="main-content">
        <p className={styles.code}>Error 404</p>
        <h1 className={styles.title}>
          This page is not in today&apos;s edition.
        </h1>
        <p className={styles.body}>
          The address you asked for does not match a story or section filed in{" "}
          {newspaper.issue}. It may have been spelled differently, or the story
          may have been reassigned elsewhere in the paper.
        </p>

        <p className={styles.actions}>
          <Link href="/">Back to the front page</Link>
        </p>

        <div className={styles.suggestions}>
          <h2 className={styles.suggestionsTitle}>Today&apos;s headlines</h2>
          <ul className={styles.headlineList}>
            {headlines.map((article) => (
              <li key={article.slug}>
                <Link href={`/article/${article.slug}`}>
                  {article.headline}
                </Link>
                <span className={styles.headlineMeta}>{article.section}</span>
              </li>
            ))}
          </ul>

          <p className={styles.sectionLinks}>
            Or browse a section:{" "}
            {sections.map((section, index) => (
              <span key={section}>
                {index > 0 ? " · " : null}
                <Link href={`/section/${sectionSlug(section)}`}>{section}</Link>
              </span>
            ))}
          </p>
        </div>
      </main>

      <SiteFooter />
    </Page>
  );
}
