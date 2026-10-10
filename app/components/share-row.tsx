"use client";

import { useState } from "react";
import styles from "./share-row.module.css";

/**
 * A lightweight share row for the foot of each story. Uses the Web Share API
 * where available and falls back to copying the link, with a polite
 * confirmation. Purely client-side — no third-party trackers.
 */
export function ShareRow({ headline, slug }: { headline: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : slug;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: headline, url });
        return;
      } catch {
        // User dismissed or share failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing to do.
    }
  }

  const encodedUrl = encodeURIComponent(slug);
  const encodedTitle = encodeURIComponent(headline);

  return (
    <div className={styles.row}>
      <span className={styles.label}>Share</span>
      <button type="button" className={styles.button} onClick={handleShare}>
        {copied ? "Link copied ✓" : "Copy link / Share"}
      </button>
      <a
        className={styles.link}
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        Post
      </a>
      <a
        className={styles.link}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn
      </a>
    </div>
  );
}
