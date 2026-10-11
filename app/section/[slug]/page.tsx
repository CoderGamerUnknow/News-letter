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
  summarize,
} from "@/lib/articles";
import { sectionToTopic } from "@/lib/feeds";
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

// Only the slugs above are ever served: anything else is a real 404 from the
// first byte, instead of an on-demand render that streams a 200 shell before
// `notFound()` resolves (the old Cache Components soft-404).
export const dynamicParams = false;

export async function generateMetadata(
  props: PageProps<"/section/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const section = sectionFromSlug(slug);

  // An unknown slug resolves to the app's not-found page, matching the page body.
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
 * Only the section waits on the slug, inside Suspense, so the route streams an
 * instant shell for navigation instead of blocking on URL data; an unknown slug
 * resolves to the app's not-found page. The active section is highlighted by the
 * client nav from the pathname.
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
            <Thumb article={summarize(lead)} tall />
            <h2 className={styles.leadHeadline}>
              <Link href={`/article/${lead.slug}`}>{lead.headline}</Link>
            </h2>
            <p className={styles.leadDek}>{lead.dek}</p>
            <Byline article={summarize(lead)} />
          </article>
        ) : (
          <p className={styles.empty}>
            No stories have been filed in this section yet.
          </p>
        )}

        {rest.length > 0 ? (
          <section aria-label={`All ${section} stories`}>
            <SectionHeading>More in {section}</SectionHeading>
            <StoryPager stories={rest.map(summarize)} />
          </section>
        ) : null}

        {/* The wire names its buckets differently from the paper (e.g. "World"
            is "Top Stories" on the wire), so the client-side refresh must filter
            on the mapped topic or it drops every headline after the first poll. */}
        <LiveWireClient
          initial={live}
          section={sectionToTopic(section)}
          title={`Live Wire — ${section}`}
        />
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
