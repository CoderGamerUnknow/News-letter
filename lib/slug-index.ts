import {
  articles,
  authorSlug,
  getAllAuthors,
  sectionSlug,
  sections,
} from "./articles";

/**
 * Every valid slug for the dynamic routes, as sets the middleware can check
 * before a request reaches the router.
 *
 * Under Cache Components there is no `dynamicParams = false`, so an unknown
 * param is otherwise rendered on demand — which serves the static shell with a
 * 200 before `notFound()` resolves. Rejecting the slug in middleware keeps
 * invalid URLs a real 404 from the first byte, while every valid URL still
 * comes straight from its prerendered page.
 */
export const articleSlugs: ReadonlySet<string> = new Set(
  articles.map((article) => article.slug),
);

export const sectionSlugs: ReadonlySet<string> = new Set(sections.map(sectionSlug));

export const authorSlugs: ReadonlySet<string> = new Set(getAllAuthors().map(authorSlug));
