import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "./section.module.css";
import {
  getArticlesBySection,
  newspaper,
  sectionFromSlug,
  sectionSlug,
  sections,
} from "@/lib/articles";
import {
  Byline,
  Page,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  Thumb,
} from "@/app/components/news-ui";
import { StoryPager } from "@/app/components/story-pager";
import { LiveWireClient } from "@/app/components/live-views";
import { getLiveBySection } from "@/lib/live-news";

export function generateStaticParams() {
  return sections.map((section) => ({ slug: sectionSlug(section) }));
}

export async function generateMetadata(
  props: PageProps<"/section/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const section = sectionFromSlug(slug);

  // Metadata resolves before the shell streams, so an unknown slug is a real
  // 404 here rather than a streamed "not found" under a 200 shell.
  if (!section) {
    notFound();
  }

  return {
    title: section,
    description: `All ${section} stories from ${newspaper.name}.`,
  };
}

/**
 * The shell — masthead, nav and page frame — is static and renders instantly.
 * Only the section itself waits on the slug, inside Suspense, so the route
 * streams an instant shell for navigation instead of blocking on URL data.
 * The active section is highlighted by the client nav from the pathname.
 */
export default function SectionPage(props: PageProps<"/section/[slug]">) {
  return (
    <Page>
      <SiteHeader />

      <Suspense fallback={<SectionLoading />}>
        <SectionContent params={props.params} />
      </Suspense>
    </Page>
  );
}

async function SectionContent({
  params,
}: {
  params: PageProps<"/section/[slug]">["params"];
}) {
  const { slug } = await params;
  const section = sectionFromSlug(slug);

  if (!section) {
    notFound();
  }

  const stories = getArticlesBySection(section);
  const [lead, ...rest] = stories;
  const live = getLiveBySection(section, 8);

  return (
    <>
      <main className={styles.main} id="main-content">
        <header className={styles.sectionHeader}>
          <p className={styles.kicker}>
            {newspaper.name} · {newspaper.issue}
          </p>
          <h1 className={styles.title}>{section}</h1>
          <p className={styles.dek}>
            {stories.length === 1
              ? "1 story in today's edition"
              : `${stories.length} stories in today's edition`}
          </p>
        </header>

        {lead ? (
          <article className={styles.lead}>
            <Thumb article={lead} tall />
            <h2 className={styles.leadHeadline}>
              <Link href={`/article/${lead.slug}`}>{lead.headline}</Link>
            </h2>
            <p className={styles.leadDek}>{lead.dek}</p>
            <Byline article={lead} />
          </article>
        ) : (
          <p className={styles.empty}>
            No stories have been filed in this section yet.
          </p>
        )}

        {rest.length > 0 ? (
          <section aria-label={`All ${section} stories`}>
            <SectionHeading>More in {section}</SectionHeading>
            <StoryPager stories={rest} />
          </section>
        ) : null}

        <LiveWireClient initial={live} section={section} title={`Live Wire — ${section}`} />
      </main>

      <SiteFooter note={`Section · ${section}`} />
    </>
  );
}

function SectionLoading() {
  return (
    <main className={styles.main} id="main-content">
      <p className={styles.loading}>Loading section…</p>
    </main>
  );
}
