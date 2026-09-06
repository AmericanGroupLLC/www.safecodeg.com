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
