import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "./author.module.css";
import {
  authorFromSlug,
  authorSlug,
  getAllAuthors,
  getArticlesByAuthor,
  newspaper,
  summarize,
} from "@/lib/articles";
import {
  Page,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  StoryCard,
  StoryGrid,
} from "@/app/components/news-ui";

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: authorSlug(author) }));
}

export async function generateMetadata(
  props: PageProps<"/author/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const author = authorFromSlug(slug);

  // An unknown slug resolves to the app's not-found page, matching the page body.
  if (!author) notFound();

  return {
    title: `By ${author}`,
    description: `All stories by ${author} in ${newspaper.name}.`,
  };
}

/**
 * The shell renders instantly; only the contributor's stories wait on the slug,
 * inside Suspense, so navigation is never blocked by URL data. An unknown slug
 * resolves to the app's not-found page.
 */
export default function AuthorPage(props: PageProps<"/author/[slug]">) {
  return (
    <Page>
      <SiteHeader />

      <Suspense fallback={<AuthorLoading />}>
        <AuthorContent params={props.params} />
      </Suspense>
    </Page>
  );
}

async function AuthorContent({
  params,
}: {
  params: PageProps<"/author/[slug]">["params"];
}) {
  const { slug } = await params;
  const author = authorFromSlug(slug);
  if (!author) notFound();

  const stories = getArticlesByAuthor(author);
  const [lead, ...rest] = stories;

  return (
    <>
      <main className={styles.main} id="main-content">
        <header className={styles.header}>
          <p className={styles.kicker}>Contributor · {newspaper.name}</p>
          <h1 className={styles.name}>{author}</h1>
          <p className={styles.meta}>
            {stories.length === 1
              ? "1 story in today's edition"
              : `${stories.length} stories in today's edition`}
          </p>
        </header>

        {lead ? (
          <section aria-label={`Latest by ${author}`}>
            <SectionHeading>Latest</SectionHeading>
            <div className={styles.lead}>
              <StoryCard article={summarize(lead)} />
            </div>
          </section>
        ) : (
          <p className={styles.empty}>No stories filed by this contributor yet.</p>
        )}

        {rest.length > 0 ? (
          <section aria-label={`More by ${author}`}>
            <SectionHeading>More by {author}</SectionHeading>
            <StoryGrid>
              {rest.map((story) => (
                <StoryCard key={story.slug} article={summarize(story)} />
              ))}
            </StoryGrid>
          </section>
        ) : null}
      </main>

      <SiteFooter note={`Contributor · ${author}`} />
    </>
  );
}

function AuthorLoading() {
  return (
    <main className={styles.main} id="main-content">
      <p className={styles.loading}>Loading contributor…</p>
    </main>
  );
}
