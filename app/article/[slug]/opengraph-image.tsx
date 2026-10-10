import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/articles";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Story card";

/**
 * A generated social card for each article — headline, section and byline over
 * the story's two-tone palette. Built at the edge with next/og, so there are
 * no static image assets to manage and every story gets a matching card.
 */
export default async function Image(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#14100c", color: "#f7f4ec", fontSize: 48 }}>
          {alt}
        </div>
      ),
      size,
    );
  }

  const [c1, c2] = article.tone;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          color: "#fffdf8",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "8px 18px",
            background: "rgba(10,8,6,0.7)",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {article.section}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: article.headline.length > 60 ? 58 : 72,
              fontWeight: 700,
              lineHeight: 1.02,
              textWrap: "balance",
            }}
          >
            {article.headline}
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
            By {article.author} · The Daily Ledger
          </div>
        </div>
      </div>
    ),
    size,
  );
}
