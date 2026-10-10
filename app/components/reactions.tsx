"use client";

import { useMemo, useSyncExternalStore } from "react";
import styles from "./reactions.module.css";

const REACTIONS = [
  { key: "insightful", label: "Insightful", glyph: "💡" },
  { key: "important", label: "Important", glyph: "🚨" },
  { key: "good", label: "Good read", glyph: "👏" },
  { key: "curious", label: "Curious", glyph: "🤔" },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];

type Store = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => { picked: ReactionKey | null; counts: Record<ReactionKey, number> };
  getServerSnapshot: () => { picked: ReactionKey | null; counts: Record<ReactionKey, number> };
  react: (key: ReactionKey) => void;
};

const EMPTY_COUNTS: Record<ReactionKey, number> = {
  insightful: 0,
  important: 0,
  good: 0,
  curious: 0,
};

/**
 * A localStorage-backed store for one story's reactions, read with
 * useSyncExternalStore so the value is treated as an external system instead
 * of being synced into state inside an effect. The store is memoized per slug
 * so its cache and listener set stay stable across renders.
 */
function createReactionStore(key: string): Store {
  const listeners = new Set<() => void>();

  function read() {
    if (typeof window === "undefined") {
      return { picked: null, counts: EMPTY_COUNTS };
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return { picked: null, counts: EMPTY_COUNTS };
      const parsed = JSON.parse(raw) as {
        picked?: ReactionKey | null;
        counts?: Partial<Record<ReactionKey, number>>;
      };
      return {
        picked: parsed.picked ?? null,
        counts: { ...EMPTY_COUNTS, ...(parsed.counts ?? {}) },
      };
    } catch {
      return { picked: null, counts: EMPTY_COUNTS };
    }
  }

  let cached = read();
  let cachedRaw = typeof window !== "undefined" ? safeGet(key) : null;

  function safeGet(k: string): string | null {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  }

  function refresh() {
    const raw = safeGet(key);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cached = read();
    }
    return cached;
  }

  function emit() {
    cached = read();
    for (const listener of listeners) listener();
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: refresh,
    getServerSnapshot: () => ({ picked: null, counts: EMPTY_COUNTS }),
    react(nextKey: ReactionKey) {
      const current = read();
      let next: { picked: ReactionKey | null; counts: Record<ReactionKey, number> };
      if (current.picked === nextKey) {
        next = {
          picked: null,
          counts: { ...current.counts, [nextKey]: Math.max(0, current.counts[nextKey] - 1) },
        };
      } else {
        const counts = { ...current.counts };
        if (current.picked) counts[current.picked] = Math.max(0, counts[current.picked] - 1);
        counts[nextKey] += 1;
        next = { picked: nextKey, counts };
      }
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage unavailable — the in-memory snapshot still updates.
      }
      emit();
    },
  };
}

/**
 * A local-only reaction bar. Counts are stored in localStorage per story so a
 * reader's taps persist across reloads on the same device. There is no backend
 * and no tracking — these are the reader's own marks, not a shared tally.
 */
export function Reactions({ slug }: { slug: string }) {
  const store = useMemo(() => createReactionStore(`ledger:reactions:${slug}`), [slug]);
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return (
    <div className={styles.wrap} role="group" aria-label="Rate this story">
      <span className={styles.label}>Your reaction</span>
      <div className={styles.buttons}>
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.key}
            type="button"
            className={`${styles.reaction} ${state.picked === reaction.key ? styles.active : ""}`}
            aria-pressed={state.picked === reaction.key}
            onClick={() => store.react(reaction.key)}
          >
            <span className={styles.glyph} aria-hidden="true">
              {reaction.glyph}
            </span>
            <span className={styles.labelText}>{reaction.label}</span>
            <span className={styles.count}>{state.counts[reaction.key]}</span>
          </button>
        ))}
      </div>
      <p className={styles.note}>Saved on this device only — no account needed.</p>
    </div>
  );
}
