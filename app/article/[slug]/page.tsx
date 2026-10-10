import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./article.module.css";
import {
  articles,
  formatDate,
  getArticleBySlug,
  getRelatedStories,
  newspaper,
  sectionSlug,
} from "@/lib/articles";
import {
  Byline,
  Page,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  StoryCard,
  StoryGrid,
  Thumb,
} from "@/app/components/news-ui";
import { ShareRow } from "@/app/components/share-row";
import { Reactions } from "@/app/components/reactions";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata(
  props: PageProps<"/article/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: "Story not found" };
  }

  return {
    title: article.headline,
    description: article.dek,
    openGraph: {
      title: article.headline,
      description: article.dek,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      section: article.section,
      images: [{ url: `/article/${article.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      description: article.dek,
      images: [`/article/${article.slug}/opengraph-image`],
    },
  };
}

export default async function ArticlePage(props: PageProps<"/article/[slug]">) {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { sameSection, elsewhere } = getRelatedStories(article);

  return (
    <Page>
      <SiteHeader activeSection={article.section} />

      <main className={styles.main} id="main-content">
        <article className={styles.story}>
          <p className={styles.kicker}>
            <Link href={`/section/${sectionSlug(article.section)}`}>
              {article.section}
            </Link>
          </p>
          <h1 className={styles.headline}>{article.headline}</h1>
          <p className={styles.dek}>{article.dek}</p>
          <Byline article={article} />

          <div className={styles.leadImage}>
            <Thumb article={article} tall />
          </div>

          <div className={styles.body}>
            {article.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <ShareRow headline={article.headline} slug={article.slug} />
          <Reactions slug={article.slug} />

          <p className={styles.filedUnder}>
            Filed under{" "}
            <Link href={`/section/${sectionSlug(article.section)}`}>
              {article.section}
            </Link>{" "}
            · {formatDate(article.date)} · {newspaper.name}, {newspaper.issue}
          </p>
        </article>

        <div className={styles.related}>
          {sameSection.length > 0 ? (
            <section aria-label={`More in ${article.section}`}>
              <SectionHeading>More in {article.section}</SectionHeading>
              <StoryGrid>
                {sameSection.map((story) => (
                  <StoryCard key={story.slug} article={story} />
                ))}
              </StoryGrid>
            </section>
          ) : null}

          {elsewhere.length > 0 ? (
            <section
              className={styles.moreFromEdition}
              aria-label="Elsewhere in today's edition"
            >
              <SectionHeading>Elsewhere in Today&apos;s Edition</SectionHeading>
              <StoryGrid>
                {elsewhere.map((story) => (
                  <StoryCard key={story.slug} article={story} />
                ))}
              </StoryGrid>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter note={`${article.section} · ${article.readingTime} min read`} />
    </Page>
  );
}
