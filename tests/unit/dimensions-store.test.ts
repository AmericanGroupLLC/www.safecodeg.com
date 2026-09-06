/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/state/store.ts (T-006, 4D)
 *
 * Exercises the store's public API directly — no browser, no WebGL, no
 * React rendering. `store.tick()` is called by hand with explicit
 * timestamps rather than waiting on real wall-clock time, so these run in
 * milliseconds and are not flaky against real timers.
 */
import { describe, it, expect } from 'vitest';
import { createDimensionsStore } from '@/dimensions/state/store';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';

describe('createDimensionsStore — quantisation (§5.5 rule 1)', () => {
  it('setT snaps to the nearest 1/120 s lattice point', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.setT(0.501); // not on the 1/120 s lattice
    // 0.501 * 120 = 60.12 -> rounds to 60 -> 60/120 = 0.5 exactly on the lattice
    expect(store.getSnapshot().t).toBeCloseTo(0.5, 10);
  });

  it('clamps t into [0, duration]', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.setT(-10);
    expect(store.getSnapshot().t).toBe(0);
    store.setT(9999);
    expect(store.getSnapshot().t).toBe(PRODUCT_PIPELINE.duration);
  });

  it('t = 0.5 reached directly and t = 0.5 reached via many small setT calls are byte-identical', () => {
    const direct = createDimensionsStore(PRODUCT_PIPELINE);
    direct.setT(0.5);

    const stepped = createDimensionsStore(PRODUCT_PIPELINE);
    for (let i = 1; i <= 60; i++) stepped.setT(i / 120); // 60 * (1/120) = 0.5

    const { revision: _r1, ...directRest } = direct.getSnapshot();
    const { revision: _r2, ...steppedRest } = stepped.getSnapshot();
    expect(steppedRest).toEqual(directRest);
  });
});

describe('createDimensionsStore — playback (§5.5 rule 2: t = tAtPlay + elapsed, never t += dt)', () => {
  it('tick computes t from elapsed wall-clock time, not by accumulating deltas', () => {
    // Fully controlled clock: play() and tick() now read the same injected
    // source, so the assertion is exact rather than a race against real time.
    let clock = 1_000;
    const store = createDimensionsStore(PRODUCT_PIPELINE, { now: () => clock });
    store.setT(2);
    store.play(); // captures wallClockAtPlay = 1000, tAtPlay = 2

    store.tick(1_000);
    const tAfterFirstTick = store.getSnapshot().t;

    store.tick(1_500); // + 500ms
    const tAfterSecondTick = store.getSnapshot().t;

    // t = tAtPlay + (tick - wallClockAtPlay) / 1000, so the first tick lands on
    // exactly tAtPlay and the second exactly 0.5s later. A drifting `t += dt`
    // implementation would not preserve either equality.
    expect(tAfterFirstTick).toBeCloseTo(2, 5);
    expect(tAfterSecondTick).toBeCloseTo(2.5, 5);
    expect(tAfterSecondTick - tAfterFirstTick).toBeCloseTo(0.5, 5);
  });

  it('pause freezes t exactly, and further ticks while paused are no-ops', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.setT(1);
    store.play();
    store.tick(1_000);
    store.tick(1_300);
    store.pause();
    const atPause = store.getSnapshot().t;

    store.tick(2_300); // 1000ms later, but paused
    expect(store.getSnapshot().t).toBe(atPause);
    expect(store.isPlaying()).toBe(false);
  });

  it('playback stops automatically at the end of the duration rather than overshooting', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    // `play()` reads the real clock internally, so `tick()`'s timestamps
    // must be offsets from that same clock, not arbitrary literals — this
    // is exactly how a real `requestAnimationFrame` timestamp relates to
    // the clock `play()` reads.
    const start = performance.now();
    store.play();
    store.tick(start + 1 + PRODUCT_PIPELINE.duration * 1000); // far past the end
    expect(store.getSnapshot().t).toBe(PRODUCT_PIPELINE.duration);
    expect(store.isPlaying()).toBe(false);
  });
});

describe('createDimensionsStore — subscribe/notify', () => {
  it('notifies subscribers on a committed setT change', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls++;
    });
    store.setT(3);
    expect(calls).toBeGreaterThan(0);
    unsubscribe();
  });

  it('notifies subscribers when play()/pause() toggle, even though t has not changed yet', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    let calls = 0;
    store.subscribe(() => {
      calls++;
    });
    store.play();
    expect(calls).toBeGreaterThan(0);
    const afterPlay = calls;
    store.pause();
    expect(calls).toBeGreaterThan(afterPlay);
  });

  it('getSnapshot returns the same reference when nothing has changed (required by useSyncExternalStore)', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const first = store.getSnapshot();
    const second = store.getSnapshot();
    expect(first).toBe(second);
  });
});
