"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./news-ui.module.css";

/**
 * A real photograph layered over the procedural art. It starts transparent and
 * fades in once decoded; if the image fails to load it stays hidden, so the
 * deterministic SVG artwork underneath always shows through. This keeps the
 * page fully populated even offline or when the image host is unreachable.
 */
export function PhotoLayer({ slug, sizes }: { slug: string; sizes: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      className={styles.thumbPhoto}
      data-loaded={loaded ? "true" : "false"}
      src={`https://picsum.photos/seed/${encodeURIComponent(slug)}/640/360`}
      alt=""
      fill
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
    />
  );
}
