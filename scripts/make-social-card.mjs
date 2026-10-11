/**
 * One-off generator for `public/social-cover.png` — the social preview card.
 *
 * It reuses the paper-and-ink palette from `app/globals.css` so the card reads
 * as part of the same publication. Rendered with a tiny software rasteriser
 * (Node's built-in `zlib` only, no image dependencies) writing a hand-rolled
 * PNG: 8-bit RGB, one deflate-compressed IDAT, CRC per chunk.
 *
 *   node scripts/make-social-card.mjs
 */

import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = join(ROOT, "public", "social-cover.png");

const W = 1200;
const H = 630;

/** Paper-and-ink palette, matching app/globals.css. */
const PAPER = [247, 244, 236];
const INK = [20, 16, 12];
const RULE = [201, 194, 179];
const ACCENT = [178, 58, 46];

const buf = new Uint8Array(W * H * 3);
const px = (x, y, c) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
};

const fill = (x0, y0, x1, y1, c) => {
  for (let y = Math.max(0, y0 | 0); y < Math.min(H, y1 | 0); y++) {
    for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1 | 0); x++) px(x, y, c);
  }
};

/** Aged-paper mottling so the background is not flat. */
let seed = 0x2f6e2b1;
const rand = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 1000) / 1000;
};

fill(0, 0, W, H, PAPER);
for (let i = 0; i < 2600; i++) {
  const x = (rand() * W) | 0;
  const y = (rand() * H) | 0;
  const s = 1 + rand() * 2;
  const shade = 232 + rand() * 12;
  fill(x, y, x + s, y + s, [shade, shade - 4, shade - 12]);
}

/** Halftone dot field across the lower band, like press screening. */
const dotStep = 14;
for (let y = H * 0.52; y < H - 24; y += dotStep) {
  for (let x = 24; x < W - 24; x += dotStep) {
    const r = 1 + ((y / dotStep) % 3) * 0.4;
    for (let a = 0; a < 16; a++) {
      const t = (a / 16) * Math.PI * 2;
      px((x + Math.cos(t) * r) | 0, (y + Math.sin(t) * r) | 0, RULE);
    }
  }
}

/** Masthead: a heavy ink band with the title knocked out in paper. */
fill(0, 120, W, 268, INK);
fill(0, 268, W, 276, ACCENT);

/** A serif "T" mark drawn as blocks in the accent colour, left of the title. */
const markX = 96;
fill(markX, 152, markX + 132, 176, ACCENT);
fill(markX + 44, 176, markX + 88, 236, ACCENT);

/** Knocked-out title, drawn as variable-width paper blocks (wordmark rhythm). */
const words = ["THE", "DAILY", "LEDGER"];
let cx = 288;
for (const word of words) {
  for (const ch of word) {
    const w = ch === "I" ? 16 : ch === "L" ? 40 : 46;
    const gap = ch === "I" ? 18 : 12;
    fill(cx, 156, cx + w, 232, PAPER);
    cx += w + gap;
  }
  cx += 26;
}

/** Double rule under the masthead, classic broadsheet. */
fill(60, 300, W - 60, 304, INK);
fill(60, 312, W - 60, 314, RULE);

/** Three "headline" columns, implied by ruled blocks of text. */
const colX = [60, 452, 844];
const colW = 300;
for (const [ci, x] of colX.entries()) {
  const top = 352;
  fill(x, top, x + colW, top + 6, INK);
  const lines = 6 - ci;
  for (let i = 0; i < lines; i++) {
    const y = top + 24 + i * 22;
    const w = colW * (0.55 + rand() * 0.45);
    fill(x, y, x + w, y + 9, i === 0 ? INK : RULE);
  }
  if (ci < 2) fill(x + colW + 22, 344, x + colW + 24, 560, RULE);
}

/** Footer strip with the tagline rule. */
fill(60, H - 84, W - 60, H - 82, INK);
fill(60, H - 40, W - 60, H - 34, ACCENT);

/* ---- PNG encoding ------------------------------------------------------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (bytes) => {
  let c = -1;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};

// Scanlines: filter byte 0 + RGB triplets.
const raw = Buffer.alloc(H * (W * 3 + 1));
for (let y = 0; y < H; y++) {
  const row = y * (W * 3 + 1);
  raw[row] = 0;
  Buffer.from(buf.buffer, y * W * 3, W * 3).copy(raw, row + 1);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour RGB
ihdr[10] = 0; // deflate
ihdr[11] = 0; // adaptive filtering
ihdr[12] = 0; // no interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync(OUT_FILE, png);
console.log(`wrote ${OUT_FILE} (${W}x${H}, ${png.length} bytes)`);
