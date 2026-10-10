import type { Metadata, Viewport } from "next";
import { absoluteUrl, newspaper, siteUrl } from "@/lib/articles";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: newspaper.name,
    template: `%s | ${newspaper.name}`,
  },
  description: `${newspaper.tagline}.`,
  applicationName: newspaper.name,
  alternates: {
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },
  openGraph: {
    type: "website",
    siteName: newspaper.name,
    title: newspaper.name,
    description: newspaper.tagline,
    url: absoluteUrl("/"),
  },
};

/** Paper stock colors, so mobile browser chrome matches the printed page. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#14120f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
