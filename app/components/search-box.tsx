"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { search, type SearchRecord } from "@/lib/search";
import styles from "./search-box.module.css";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function SearchBox() {
  const searchParams = useSearchParams();
  const paramQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(paramQuery);
  const [lastParam, setLastParam] = useState(paramQuery);

  // Adjust state during render when the URL query changes (React's recommended
  // alternative to syncing props in an effect).
  if (paramQuery !== lastParam) {
    setLastParam(paramQuery);
    setQuery(paramQuery);
  }

  const results: SearchRecord[] = useMemo(() => search(query), [query]);

  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="search-input">
        Search the edition
      </label>
      <input
        id="search-input"
        className={styles.input}
        type="search"
        placeholder="Search headlines, sections, contributors…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      {query.trim() === "" ? (
        <p className={styles.hint}>
          Type to search across every story in today&apos;s edition.
        </p>
      ) : results.length === 0 ? (
        <p className={styles.hint}>No stories match “{query}”.</p>
      ) : (
        <>
          <p className={styles.count}>
            {results.length} {results.length === 1 ? "story" : "stories"}
          </p>
          <ul className={styles.results}>
            {results.map((record) => (
              <li key={record.slug} className={styles.result}>
                <Link href={`/article/${record.slug}`} className={styles.resultLink}>
                  <span className={styles.resultSection}>{record.section}</span>
                  <span className={styles.resultHeadline}>{record.headline}</span>
                  <span className={styles.resultDek}>{record.dek}</span>
                  <span className={styles.resultMeta}>
                    {record.author} · {formatDate(record.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
