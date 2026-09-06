/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/transport/rateLimiter.ts — ARCHITECTURE-DIMENSIONS.md
 * §6.5 / §3.3: "Op rate per actorId is capped; the excess is dropped."
 * `now` is injected so the sliding window is exercised deterministically,
 * with no reliance on real wall-clock timing or fake timers.
 */
import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '@/dimensions/transport/rateLimiter';

describe('createRateLimiter — allows events under the cap', () => {
  it('allows events up to maxEvents within the window', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 3, windowMs: 1000, now: () => now });
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(true);
  });

  it('drops the event that exceeds the cap', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 3, windowMs: 1000, now: () => now });
    limiter.allow('actor-a');
    limiter.allow('actor-a');
    limiter.allow('actor-a');
    expect(limiter.allow('actor-a')).toBe(false);
  });
});

describe('createRateLimiter — is a sliding window, not a fixed bucket', () => {
  it('allows more events again once old ones age out of the window', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 2, windowMs: 1000, now: () => now });
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(false); // cap reached

    now += 1001; // both earlier events are now outside the window
    expect(limiter.allow('actor-a')).toBe(true);
  });

  it('a partially-aged window admits exactly as many new events as expired', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 2, windowMs: 1000, now: () => now });
    limiter.allow('actor-a'); // t=0
    now = 500;
    limiter.allow('actor-a'); // t=500 — cap (2) reached, window holds both
    expect(limiter.allow('actor-a')).toBe(false);

    now = 1001; // t=0 event has aged out; t=500 event has not (1001-500=501<1000)
    expect(limiter.allow('actor-a')).toBe(true); // one slot freed
    expect(limiter.allow('actor-a')).toBe(false); // and no more than one
  });
});

describe('createRateLimiter — actors are tracked independently', () => {
  it('one actor exceeding the cap does not affect another actor', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 1, windowMs: 1000, now: () => now });
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(false);
    expect(limiter.allow('actor-b')).toBe(true);
  });
});

describe('createRateLimiter — sane defaults exist when no options are given', () => {
  it('constructs successfully and allows at least one event with real time', () => {
    const limiter = createRateLimiter();
    expect(limiter.allow('actor-a')).toBe(true);
  });
});

/**
 * T-016 finding S-3: `allow()` was keyed only on the peer-supplied `actorId`
 * — Realtime carries no verified sender identity, so a hostile peer can
 * rotate `actorId` on every message and the per-actor cap never engages.
 * The reviewer measured 30 accepted from one id (the cap), 200 accepted
 * from 200 rotated ids, and 50 000 admitted with 50 000 rotated ids. These
 * reproduce that measurement against the fix: a **global** ceiling across
 * all actors, which rotating `actorId` cannot evade.
 */
describe('createRateLimiter — a global ceiling bounds acceptance across all actors (T-016 S-3)', () => {
  it('reproduces the reviewer\'s measurement: 50,000 rotated actorIds are no longer all admitted', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 30, windowMs: 1000, maxGlobalEvents: 50, now: () => now });
    let accepted = 0;
    for (let i = 0; i < 50_000; i++) {
      if (limiter.allow(`actor-${i}`)) accepted++;
    }
    expect(accepted).toBe(50);
  });

  it('200 rotated actorIds sending one op each are capped by the global ceiling, not admitted in full', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 30, windowMs: 1000, maxGlobalEvents: 50, now: () => now });
    let accepted = 0;
    for (let i = 0; i < 200; i++) {
      if (limiter.allow(`actor-${i}`)) accepted++;
    }
    expect(accepted).toBe(50);
  });

  it('a single actor is still bounded by its own per-actor cap even with global headroom remaining', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 3, windowMs: 1000, maxGlobalEvents: 1000, now: () => now });
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-a')).toBe(false); // the per-actor cap, not the global one
  });

  it('the global ceiling is a sliding window too — it recovers as old events age out', () => {
    let now = 0;
    const limiter = createRateLimiter({ maxEvents: 30, windowMs: 1000, maxGlobalEvents: 2, now: () => now });
    expect(limiter.allow('actor-a')).toBe(true);
    expect(limiter.allow('actor-b')).toBe(true);
    expect(limiter.allow('actor-c')).toBe(false); // global cap reached, distinct actorId does not help

    now += 1001; // both earlier global-window events have aged out
    expect(limiter.allow('actor-d')).toBe(true);
  });

  it('a sane global default exists when maxGlobalEvents is not given', () => {
    const limiter = createRateLimiter();
    // The default must be finite and enforced — not "no limit" — or a flood
    // of rotated ids is admitted in full again.
    let accepted = 0;
    for (let i = 0; i < 10_000; i++) {
      if (limiter.allow(`actor-${i}`)) accepted++;
    }
    expect(accepted).toBeLessThan(10_000);
    expect(accepted).toBeGreaterThan(0);
  });
});

/**
 * T-016 finding S-3, second half: `timestampsByKey` was never pruned, so
 * every distinct `actorId` a peer ever sends — even one message, from an id
 * never seen again — permanently adds an entry, in every other peer's tab.
 * The fix bounds the map at `maxTrackedKeys`, evicting the
 * least-recently-touched key once the cap is exceeded.
 */
describe('createRateLimiter — timestampsByKey is bounded, not a monotonic leak (T-016 S-3)', () => {
  it('evicts the least-recently-touched actor once maxTrackedKeys is exceeded', () => {
    let now = 0;
    const limiter = createRateLimiter({
      maxEvents: 1,
      windowMs: 1000,
      maxGlobalEvents: 1000,
      maxTrackedKeys: 2,
      now: () => now,
    });
    expect(limiter.allow('actor-a')).toBe(true); // tracked: {a}
    expect(limiter.allow('actor-b')).toBe(true); // tracked: {a, b} — at the cap

    // A third, distinct actor touches the map, which is already at the
    // maxTrackedKeys cap — the least-recently-touched entry ('actor-a') is
    // evicted to make room.
    expect(limiter.allow('actor-c')).toBe(true);

    // 'actor-a' was evicted, not merely present with a still-open window:
    // it is tracked as a brand-new actor, so its per-actor cap (1 event per
    // second) has not been consumed and it is allowed again immediately —
    // proof the map entry is actually gone, not just idle.
    expect(limiter.allow('actor-a')).toBe(true);
  });
});
