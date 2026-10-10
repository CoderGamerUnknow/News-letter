import { ImageResponse } from "next/og";
import { getFeatured, newspaper } from "@/lib/articles";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${newspaper.name} — ${newspaper.tagline}`;

/**
 * The default social card, used by every route that doesn't generate its own
 * (front page, /news, sections, author pages, search). Article routes are
 * matched by their own closer `opengraph-image`, so they keep their headline
 * card. Built with next/og, so there are no static image assets to manage.
 */
export default function Image() {
  const featured = getFeatured();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f7f4ec",
          color: "#14100c",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#4a443c",
          }}
        >
          <span>{newspaper.issue}</span>
          <span>Today&apos;s Edition</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 112,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            {newspaper.name}
          </div>
          <div style={{ display: "flex", fontSize: 36, fontStyle: "italic", color: "#4a443c" }}>
            {newspaper.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderTop: "6px solid #8c2f21",
            paddingTop: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8c2f21",
            }}
          >
            {featured.section}
          </div>
          <div style={{ display: "flex", fontSize: 40, lineHeight: 1.15 }}>
            {featured.headline}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
