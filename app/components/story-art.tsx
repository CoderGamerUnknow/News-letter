import type { Article } from "@/lib/articles";
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
export function storyArtSvg(article: Article, viewBoxWidth = 320, viewBoxHeight = 200): string {
  const [base, accent] = article.tone;
  const rand = mulberry32(hashString(article.slug));
  const w = viewBoxWidth;
  const h = viewBoxHeight;

  // Choose a subject silhouette archetype so different stories read differently.
  const archetypes = ["skyline", "ridge", "wave", "columns", "orbit", "grid"];
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

  // A soft light source for depth.
  parts.push(
    `<circle cx="${(rand() * w).toFixed(1)}" cy="${(rand() * h * 0.5).toFixed(1)}" r="${(h * 0.6).toFixed(
      1,
    )}" fill="rgba(255,255,255,0.10)"/>`,
  );

  // 2. Subject silhouette, drawn in a translucent dark ink so it reads as a
  //    press-printed shape over the wash.
  const ink = "rgba(0,0,0,0.34)";
  if (archetype === "skyline") {
    let x = 8;
    while (x < w - 8) {
      const bw = 14 + rand() * 30;
      const bh = 30 + rand() * (h * 0.6);
      parts.push(`<rect x="${x.toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${bw.toFixed(
        1,
      )}" height="${bh.toFixed(1)}" fill="${ink}"/>`);
      x += bw + 6 + rand() * 10;
    }
  } else if (archetype === "ridge") {
    const peakCount = 3 + Math.floor(rand() * 3);
    const pts: string[] = [`0,${h}`];
    for (let i = 0; i <= peakCount; i++) {
      const px = (i / peakCount) * w;
      const py = h * (0.3 + rand() * 0.45);
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    pts.push(`${w},${h}`);
    parts.push(`<polygon points="${pts.join(" ")}" fill="${ink}"/>`);
  } else if (archetype === "wave") {
    const waves = 3;
    for (let i = 0; i < waves; i++) {
      const yBase = h * (0.4 + i * 0.16);
      let d = `M0 ${yBase.toFixed(1)}`;
      for (let x = 0; x <= w; x += 20) {
        const dy = Math.sin((x / w) * Math.PI * (2 + i)) * (10 + rand() * 8);
        d += ` L${x} ${(yBase + dy).toFixed(1)}`;
      }
      d += ` L${w} ${h} L0 ${h} Z`;
      parts.push(`<path d="${d}" fill="rgba(0,0,0,${(0.18 + i * 0.07).toFixed(2)})"/>`);
    }
  } else if (archetype === "columns") {
    const cols = 4 + Math.floor(rand() * 4);
    const gap = w / cols;
    for (let i = 0; i < cols; i++) {
      const cw = gap * (0.4 + rand() * 0.25);
      const cx = i * gap + (gap - cw) / 2;
      const top = h * (0.2 + rand() * 0.2);
      parts.push(`<rect x="${cx.toFixed(1)}" y="${top.toFixed(1)}" width="${cw.toFixed(
        1,
      )}" height="${(h - top).toFixed(1)}" fill="${ink}"/>`);
      parts.push(
        `<circle cx="${(cx + cw / 2).toFixed(1)}" cy="${(top - 6).toFixed(1)}" r="${(cw / 2).toFixed(
          1,
        )}" fill="rgba(255,255,255,0.22)"/>`,
      );
    }
  } else if (archetype === "orbit") {
    const cx = w * (0.35 + rand() * 0.3);
    const cy = h * (0.4 + rand() * 0.2);
    parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(h * 0.28).toFixed(
      1,
    )}" fill="${ink}"/>`);
    for (let i = 0; i < 3; i++) {
      const rx = h * (0.4 + i * 0.12);
      const ry = h * (0.14 + i * 0.05);
      const rot = rand() * 180;
      parts.push(
        `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(
          1,
        )}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" transform="rotate(${rot.toFixed(
          1,
        )} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`,
      );
    }
  } else {
    // grid
    const cell = 26 + rand() * 16;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        if (rand() > 0.45) {
          parts.push(
            `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cell * 0.7).toFixed(
              1,
            )}" height="${(cell * 0.7).toFixed(1)}" fill="${ink}"/>`,
          );
        }
      }
    }
  }

  // 3. Halftone dot field across the lower third, evoking newsprint screening.
  //    Drawn as one tiled <pattern> rather than hundreds of <circle> elements,
  //    which keeps each illustration (and the HTML it ends up in) small.
  const dotStep = 9;
  const startY = h * 0.62;
  parts.push(
    `<pattern id="dots-${article.slug}" width="${dotStep}" height="${dotStep}" patternUnits="userSpaceOnUse">` +
      `<circle cx="${dotStep / 2}" cy="${dotStep / 2}" r="1.7" fill="rgba(0,0,0,0.12)"/>` +
      `</pattern>`,
  );
  parts.push(
    `<rect x="0" y="${startY.toFixed(1)}" width="${w}" height="${(h - startY).toFixed(
      1,
    )}" fill="url(#dots-${article.slug})"/>`,
  );

  // 4. Horizontal newsprint rules near the top, like a press registration mark.
  let ruleY = h * 0.06;
  const ruleCount = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < ruleCount; i++) {
    const rw = w * (0.3 + rand() * 0.5);
    parts.push(
      `<rect x="${(w - rw).toFixed(1)}" y="${ruleY.toFixed(1)}" width="${rw.toFixed(
        1,
      )}" height="1.5" fill="rgba(255,255,255,0.5)"/>`,
    );
    ruleY += 6;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="presentation">${parts.join(
    "",
  )}</svg>`;
}
