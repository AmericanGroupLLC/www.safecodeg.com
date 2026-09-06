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
 */

const DEFAULT_MAX_EVENTS = 30;
const DEFAULT_WINDOW_MS = 1000;

export interface RateLimiterOptions {
  maxEvents?: number;
  windowMs?: number;
  /** Injectable for deterministic tests. Defaults to `Date.now`. */
  now?: () => number;
}

export interface RateLimiter {
  /**
   * Records one event for `key` and reports whether it is within the cap.
   * Call this once per inbound message, before it is applied — a `false`
   * result means the caller must drop the message.
   */
  allow(key: string): boolean;
}

/**
 * Creates a sliding-window rate limiter.
 *
 * @example
 * ```ts
 * const limiter = createRateLimiter({ maxEvents: 30, windowMs: 1000 });
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
  const now = options.now ?? Date.now;
  const timestampsByKey = new Map<string, number[]>();

  return {
    allow(key: string): boolean {
      const currentTime = now();
      const windowStart = currentTime - windowMs;
      let timestamps = timestampsByKey.get(key);
      if (!timestamps) {
        timestamps = [];
        timestampsByKey.set(key, timestamps);
      }
      while (timestamps.length > 0 && timestamps[0] < windowStart) {
        timestamps.shift();
      }
      if (timestamps.length >= maxEvents) {
        return false;
      }
      timestamps.push(currentTime);
      return true;
    },
  };
}
