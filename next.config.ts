import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /*
   * Cache Components / partial prerendering is deliberately OFF:
   *
   * 1. It makes unknown slugs soft-404 — the static shell streams with a 200
   *    before `notFound()` resolves, and `dynamicParams = false` does not
   *    exist under Cache Components. With it off, the dynamic routes set
   *    `dynamicParams = false` and an unknown URL is a true 404 from the
   *    first byte.
   * 2. Its `.prefetch.rsc` artifacts have crashed Netlify's OpenNext adapter
   *    ("Failed assembling prerendered content", opennextjs-netlify#3346).
   *
   * All page data is local and synchronous, so PPR bought nothing here.
   */

  // Pin Turbopack to the project root so it doesn't walk up into the user's
  // home directory (this project lives under ~/, which otherwise triggers a
  // warning and ignores the lockfile).
  turbopack: {
    root: projectRoot,
  },
  images: {
    // picsum.photos serves deterministic placeholder photography seeded by the
    // article slug, giving each story a real image without binary assets.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
