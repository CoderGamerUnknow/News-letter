import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
