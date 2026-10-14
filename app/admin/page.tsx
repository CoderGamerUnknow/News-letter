import type { Metadata } from "next";
import { cookies } from "next/headers";
import styles from "./admin.module.css";
import {
  COOKIE_NAME,
  hasValidSession,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { newspaper } from "@/lib/articles";
import { readManualStories } from "@/lib/manual-store";
import { Page, SiteFooter, SiteHeader } from "@/app/components/news-ui";
import { AdminDesk, AdminLogin, AdminSetupNotice } from "@/app/components/admin-views";

export const metadata: Metadata = {
  title: "Admin Desk",
  description: `File stories by hand into ${newspaper.name}.`,
  // The desk is for editors only; keep it out of every index.
  robots: { index: false, follow: false },
};

// The desk reads the session cookie and the on-disk store per request, so it
// must never be prerendered into the static build.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isAdminConfigured();
  const store = await cookies();
  const authed = configured && hasValidSession(store.get(COOKIE_NAME)?.value);
  const stories = authed ? await readManualStories() : [];

  return (
    <Page>
      <SiteHeader />

      <main className={styles.main} id="main-content">
        <header className={styles.header}>
          <p className={styles.kicker}>{newspaper.name} · Editors Only</p>
          <h1 className={styles.title}>Admin Desk</h1>
          <p className={styles.dek}>
            File a story by hand, read it back as a preview, and confirm to put
            it into the edition.
          </p>
        </header>

        {!configured ? (
          <AdminSetupNotice />
        ) : !authed ? (
          <AdminLogin />
        ) : (
          <AdminDesk initial={stories} />
        )}
      </main>

      <SiteFooter note="Admin desk · filed stories live in lib/manual-news.json." />
    </Page>
  );
}
