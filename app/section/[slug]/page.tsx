import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

// Like the article route, this page's shell depends on the slug (active nav
// highlight, section lead, paginated grid, live wire), so it opts out of
// instant-navigation validation and blocks on URL data by design.
export const instant = false;

export async function generateMetadata(
  props: PageProps<"/section/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const section = sectionFromSlug(slug);

  if (!section) {
    return { title: "Section not found" };
  }

  return {
    title: section,
    description: `All ${section} stories from ${newspaper.name}.`,
  };
}

export default async function SectionPage(props: PageProps<"/section/[slug]">) {
  const { slug } = await props.params;
  const section = sectionFromSlug(slug);

  if (!section) {
    notFound();
  }

  const stories = getArticlesBySection(section);
  const [lead, ...rest] = stories;
  const live = getLiveBySection(section, 8);

  return (
    <Page>
      <SiteHeader activeSection={section} />

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
    </Page>
  );
}
