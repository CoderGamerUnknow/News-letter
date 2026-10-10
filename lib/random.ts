/**
 * Deterministic hashing + pseudo-random utilities shared by the wire-story
 * generator and the editorial artwork renderer. Keeping them here (rather than
 * inside a component) avoids a lib -> component dependency and guarantees the
 * same story always produces the same seed.
 */

/** Deterministic 32-bit hash (FNV-1a) over a string. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Small deterministic PRNG (mulberry32) seeded by a 32-bit integer. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
