import { NextResponse, type NextRequest } from "next/server";
import { safeDecodeSlug } from "@/lib/articles";
import { articleSlugs, authorSlugs, sectionSlugs } from "@/lib/slug-index";

/**
 * Reject unknown dynamic slugs before the router renders them.
 *
 * (Next 16 renamed the `middleware` file convention to `proxy`.)
 *
 * Cache Components has no `dynamicParams = false`, so an unlisted param would
 * otherwise be rendered on demand: the static shell streams with a 200 and the
 * `notFound()` only lands once the upgraded result is cached. Matching the slug
 * here turns an invalid URL into a real 404 on the very first request, while
 * every valid URL is untouched and still served from its prerendered page.
 */

const LOOKUPS: { prefix: string; slugs: ReadonlySet<string> }[] = [
  { prefix: "/article/", slugs: articleSlugs },
  { prefix: "/section/", slugs: sectionSlugs },
  { prefix: "/author/", slugs: authorSlugs },
];

/** Internal path that renders the app's not-found page. */
const NOT_FOUND_PATH = "/not-found";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const { prefix, slugs } of LOOKUPS) {
    if (!pathname.startsWith(prefix)) continue;

    // Malformed percent-encoding (`/article/100%`, `/article/%zz`) used to throw
    // a URIError here and surface as a 500. `safeDecodeSlug` returns the segment
    // unchanged when it cannot be decoded; it then matches no known slug and
    // falls through to the 404 rewrite like any other unknown path.
    const slug = safeDecodeSlug(pathname.slice(prefix.length)).replace(/\/$/, "");
    if (slug && !slugs.has(slug)) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), { status: 404 });
    }
    break;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/article/:slug", "/section/:slug", "/author/:slug"],
};
