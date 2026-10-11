import type { StorySummary } from "@/lib/articles";
import { hashString, mulberry32 } from "@/lib/random";

/**
 * Generate the layered editorial artwork for a story as an SVG string.
 *
 * The composition is derived entirely from the article's `tone` pair and a
 * hash of its slug, so it is deterministic (no randomness at render time) and
 * needs no binary assets. It layers a duotone backdrop, an abstract "subject"
 * silhouette, a halftone dot field and horizontal newsprint rules to evoke a
 * press-printed illustration rather than a plain gradient swatch.
 */
export function storyArtSvg(
  article: StorySummary,
  viewBoxWidth = 320,
  viewBoxHeight = 200,
): string {
  const [base, accent] = article.tone;
  const rand = mulberry32(hashString(article.slug));
  const w = viewBoxWidth;
  const h = viewBoxHeight;

  // Choose a subject silhouette archetype.
  const archetypes = ["skyline", "ridge"] as const;
  const archetype = archetypes[Math.floor(rand() * archetypes.length)];

  const parts: string[] = [];

  // 1. Duotone backdrop: a diagonal wash between the two tones.
  parts.push(
    `<defs><linearGradient id="bg-${article.slug}" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${base}"/>` +
      `<stop offset="1" stop-color="${accent}"/>` +
      `</linearGradient></defs>`,
  );
  parts.push(`<rect width="${w}" height="${h}" fill="url(#bg-${article.slug})"/>`);

  // A soft light source for depth (lightweight).
  parts.push(
    `<circle cx="${(w * 0.2).toFixed(1)}" cy="${(h * 0.25).toFixed(1)}" r="${(h * 0.4).toFixed(1)}" fill="rgba(255,255,255,0.08)"/>`,
  );

  // 2. Subject silhouette, simplified for smaller size
  const ink = "rgba(0,0,0,0.24)";
  if (archetype === "skyline") {
    const cols = 3 + Math.floor(rand() * 2);
    const gap = w / cols;
    for (let i = 0; i < cols; i++) {
      const cw = gap * 0.5;
      const cx = i * gap + (gap - cw) / 2;
      const bh = h * (0.3 + rand() * 0.4);
      parts.push(`<rect x="${cx.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${cw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${ink}"/>`);
    }
  } else {
    const peakCount = 2 + Math.floor(rand() * 2);
    const pts: string[] = [`0,${h}`];
    for (let i = 0; i <= peakCount; i++) {
      const px = (i / peakCount) * w;
      const py = h * (0.4 + rand() * 0.3);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    pts.push(`${w},${h}`);
    parts.push(`<polygon points="${pts.join(" ")}" fill="${ink}"/>`);
  }

  // 3. Halftone dot field across the lower third
  const dotStep = 12;
  const startY = h * 0.7;
  parts.push(
    `<pattern id="dots-${article.slug}" width="${dotStep}" height="${dotStep}" patternUnits="userSpaceOnUse">` +
      `<circle cx="${dotStep / 2}" cy="${dotStep / 2}" r="1.2" fill="rgba(0,0,0,0.08)"/>` +
      `</pattern>`,
  );
  parts.push(
    `<rect x="0" y="${startY.toFixed(1)}" width="${w}" height="${(h - startY).toFixed(1)}" fill="url(#dots-${article.slug})"/>`,
  );

  // 4. Horizontal newsprint rule
  parts.push(
    `<rect x="${(w * 0.4).toFixed(1)}" y="${(h * 0.08).toFixed(1)}" width="${(w * 0.5).toFixed(1)}" height="1" fill="rgba(255,255,255,0.4)"/>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="presentation">${parts.join(
    "",
  )}</svg>`;
}
