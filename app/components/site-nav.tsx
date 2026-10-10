"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections, sectionSlug } from "@/lib/articles";
import styles from "./news-ui.module.css";

/**
 * The section nav. It derives the active section from the pathname on the
 * client rather than accepting it from the page, which lets dynamic routes
 * render a static shell instantly and still highlight the current section.
 */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Sections">
      <ul className={styles.navList}>
        {sections.map((section) => {
          const href = `/section/${sectionSlug(section)}`;
          const isActive = pathname === href;
          return (
            <li key={section}>
              <Link
                href={href}
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
        <Link
          href="/news"
          className={pathname === "/news" ? styles.navSearchActive : styles.navSearch}
          aria-current={pathname === "/news" ? "page" : undefined}
        >
          News
        </Link>
        <Link
          href="/search"
          className={pathname === "/search" ? styles.navSearchActive : styles.navSearch}
          aria-current={pathname === "/search" ? "page" : undefined}
        >
          <span aria-hidden="true">🔍</span> Search
        </Link>
      </div>
    </nav>
  );
}
