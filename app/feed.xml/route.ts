import {
  absoluteUrl,
  articles,
  getLatest,
  newspaper,
} from "@/lib/articles";

const FEED_PATH = "/feed.xml";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS wants RFC 822 dates; the archive stores plain ISO days. */
function toRfc822(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

export function GET() {
  const stories = getLatest(articles.length);
  const updated = stories[0];

  const items = stories
    .map((article) => {
      const link = absoluteUrl(`/article/${article.slug}`);
      return [
        "    <item>",
        `      <title>${escapeXml(article.headline)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${toRfc822(article.date)}</pubDate>`,
        `      <category>${escapeXml(article.section)}</category>`,
        `      <dc:creator>${escapeXml(article.author)}</dc:creator>`,
        `      <description>${escapeXml(article.dek)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(newspaper.name)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(newspaper.tagline)}</description>
    <language>en-us</language>
    <lastBuildDate>${toRfc822(updated.date)}</lastBuildDate>
    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
