// Best-effort in-memory rate limiter (per server instance).
// Good enough to blunt credential-stuffing / signup spam on a single node.
// For multi-instance production, back this with Upstash/Redis later.

type Bucket = number[];
const store = new Map<string, Bucket>();

export type RateRule = { windowMs: number; max: number };

/**
 * Returns true when the caller is OVER the limit (should be blocked).
 * `key` should combine action + identifier, e.g. `login:1.2.3.4`.
 */
export function rateLimited(key: string, rule: RateRule): boolean {
  const now = Date.now();
  const list = (store.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  if (list.length >= rule.max) {
    store.set(key, list);
    return true;
  }
  list.push(now);
  store.set(key, list);
  // Cheap memory cap
  if (store.size > 10_000) store.clear();
  return false;
}

export const RULES = {
  login: { windowMs: 10 * 60 * 1000, max: 10 }, // 10 / 10 min / IP
  signup: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 / hour / IP
  reset: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 / hour / IP
} satisfies Record<string, RateRule>;
