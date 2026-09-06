/**
 * Per-actor op rate limiting — client/src/dimensions/transport/rateLimiter.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §6.5: "Op rate per actorId is capped; the
 * excess is dropped." §3.3 names this one of the three ways blast radius is
 * bounded client-side (rate per actor, total object count, unknown-objectId
 * rejection). This file is the first of those three; `validation.ts` is the
 * third.
 *
 * A sliding-window limiter, keyed by `actorId`. The default of 30 events
 * per rolling second per actor is not given by the architecture document —
 * it is chosen here: generous enough that a legitimate drag (which UI code
 * typically throttles well below 30 Hz before it ever reaches the wire)
 * never trips it, while still bounding how much one hostile or malfunctioning
 * peer can push through this client per second.
 *
 * **T-016 finding S-3, and the two bounds it added.** `allow()` is called
 * with the peer-supplied `actorId` (`supabaseTransport.ts`), which Realtime
 * never verifies — a peer can rotate it on every message. The reviewer
 * measured 30 accepted from one id (the per-actor cap, as designed), 200
 * accepted from 200 rotated ids, and 50 000 admitted with 50 000 rotated
 * ids — the per-actor cap does nothing against an attacker who never reuses
 * a key. Two independent bounds fix this:
 *
 *  1. `maxGlobalEvents` — a sliding-window ceiling shared across *every*
 *     key, checked before the per-actor check. Rotating `actorId` cannot
 *     evade it, because it does not look at `actorId` at all. Default 300:
 *     10x the default per-actor cap, generous headroom for several
 *     legitimate actors near their own cap at once, while turning an
 *     unbounded flood into a small, fixed number regardless of how many
 *     ids are rotated.
 *  2. `maxTrackedKeys` — `timestampsByKey` was never pruned: every distinct
 *     `actorId` a peer ever sent, even once, added a permanent entry, in
 *     every *other* peer's tab (a monotonic memory leak, not just a rate-
 *     limit gap). The map is now bounded at `maxTrackedKeys` (default
 *     1000 — far above any plausible legitimate room population),
 *     evicting the least-recently-touched key once it would grow past
 *     that. Combined with (1) — once the global cap saturates within a
 *     window, an unseen key is never even added to the map — this bounds
 *     memory to O(maxTrackedKeys) regardless of attack volume or duration.
 */

const DEFAULT_MAX_EVENTS = 30;
const DEFAULT_WINDOW_MS = 1000;
const DEFAULT_MAX_GLOBAL_EVENTS = 300;
const DEFAULT_MAX_TRACKED_KEYS = 1000;

export interface RateLimiterOptions {
  maxEvents?: number;
  windowMs?: number;
  /**
   * Ceiling on events per `windowMs` across *every* key combined — the one
   * cap a peer cannot evade by rotating `actorId` (T-016 finding S-3).
   * Checked before the per-actor cap. Defaults to `DEFAULT_MAX_GLOBAL_EVENTS`.
   */
  maxGlobalEvents?: number;
  /**
   * Maximum number of distinct keys tracked at once. Once exceeded, the
   * least-recently-touched key is evicted, bounding memory regardless of
   * how many distinct `actorId`s a peer invents (T-016 finding S-3).
   * Defaults to `DEFAULT_MAX_TRACKED_KEYS`.
   */
  maxTrackedKeys?: number;
  /** Injectable for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
}

export interface RateLimiter {
  /**
   * Records one event for `key` and reports whether it is within both the
   * per-key cap and the global cap. Call this once per inbound message,
   * before it is applied — a `false` result means the caller must drop the
   * message.
   */
  allow(key: string): boolean;
}

/**
 * Creates a sliding-window rate limiter with both a per-key cap and a
 * global cap across all keys.
 *
 * @example
 * ```ts
 * const limiter = createRateLimiter({ maxEvents: 30, windowMs: 1000, maxGlobalEvents: 300 });
 * if (!limiter.allow(op.actorId)) {
 *   console.warn("[6D] dropped op: rate limit exceeded for actor", op.actorId);
 *   return;
 * }
 * ```
 */
export function createRateLimiter(
  options: RateLimiterOptions = {}
): RateLimiter {
  const maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxGlobalEvents = options.maxGlobalEvents ?? DEFAULT_MAX_GLOBAL_EVENTS;
  const maxTrackedKeys = options.maxTrackedKeys ?? DEFAULT_MAX_TRACKED_KEYS;
  const now = options.now ?? Date.now;
  // Insertion order doubles as recency order: every touch (below) deletes
  // and re-sets a key's entry, moving it to the "most recently used" end,
  // which is what makes the maxTrackedKeys eviction below an LRU policy.
  const timestampsByKey = new Map<string, number[]>();
  let globalTimestamps: number[] = [];

  return {
    allow(key: string): boolean {
      const currentTime = now();
      const windowStart = currentTime - windowMs;

      // The global ceiling is checked first, and does not depend on `key`
      // at all — this is the bound rotating actorId cannot evade (S-3).
      // Its own length is self-limiting (a rejected event is never
      // pushed), so no separate size bound is needed for it the way
      // `timestampsByKey` needs `maxTrackedKeys` below.
      let globalPruneIndex = 0;
      while (
        globalPruneIndex < globalTimestamps.length &&
        globalTimestamps[globalPruneIndex] < windowStart
      ) {
        globalPruneIndex++;
      }
      if (globalPruneIndex > 0) {
        globalTimestamps = globalTimestamps.slice(globalPruneIndex);
      }
      if (globalTimestamps.length >= maxGlobalEvents) {
        return false;
      }

      let timestamps = timestampsByKey.get(key);
      if (timestamps) {
        // Re-inserting moves this key to the Map's most-recently-used end.
        timestampsByKey.delete(key);
      } else {
        timestamps = [];
      }
      while (timestamps.length > 0 && timestamps[0] < windowStart) {
        timestamps.shift();
      }
      if (timestamps.length >= maxEvents) {
        // Still bounded by its own per-actor cap. Re-insert (rather than
        // leaving it deleted) so an actively-sending actor is not evicted
        // ahead of a truly idle one.
        timestampsByKey.set(key, timestamps);
        return false;
      }

      timestamps.push(currentTime);
      timestampsByKey.set(key, timestamps);

      // Bound memory regardless of how many distinct keys a peer invents
      // (T-016 finding S-3: "timestampsByKey is never pruned... a
      // monotonic memory leak"): evict the least-recently-touched key once
      // the tracked-key cap is exceeded.
      if (timestampsByKey.size > maxTrackedKeys) {
        const oldestKey = timestampsByKey.keys().next().value;
        if (oldestKey !== undefined) timestampsByKey.delete(oldestKey);
      }

      globalTimestamps.push(currentTime);
      return true;
    },
  };
}
