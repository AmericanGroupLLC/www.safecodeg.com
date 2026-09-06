/**
 * The external store — client/src/dimensions/state/store.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §5.4 (D-STATE): a hand-written external store on
 * React 19's `useSyncExternalStore`. No Redux, no Zustand, no Jotai.
 *
 * Performance contract, not optional:
 *   - The render loop never reads React state — it calls `getSnapshot()`
 *     directly (see `render/loop.ts`).
 *   - React subscribes only to UI-relevant slices, via `useStoreValue`.
 *   - Writes are batched per commit and increment `revision` once.
 *
 * §5.5 determinism, enforced here (not in `model/timeline.ts`):
 *   1. `t` is quantised to a 1/120 s lattice on every write, in `quantise()`,
 *      the one function both `setT` (scrubber / direct control) and `tick`
 *      (playback) route through. That is what makes `t = 0.5` reached either
 *      way land on the same value.
 *   2. Playback computes `t = tAtPlay + (now - wallClockAtPlay) / 1000` in
 *      `tick`, never `t += dt` — so it never drifts and never accumulates
 *      floating-point error across frames.
 */

import { useRef, useSyncExternalStore } from "react";
import type { ActorPresence, ObjectId, SceneState } from "./types";
import type { ProcessModel } from "../model/process";
import { composeScene } from "./compose";
import type { PhysicsSnapshot } from "../physics/sandbox";

const STEP = 1 / 120;

function quantise(t: number, duration: number): number {
  const snapped = Math.round(t / STEP) * STEP;
  return Math.min(Math.max(snapped, 0), duration);
}

export interface DimensionsStore {
  getSnapshot(): SceneState;
  subscribe(callback: () => void): () => void;
  /** Direct control / scrubber. Pauses playback — the scrubber is the source of truth while held. */
  setT(t: number): void;
  play(): void;
  pause(): void;
  isPlaying(): boolean;
  /** Called once per animation frame by the render loop. No-op while paused. */
  tick(nowMs: number): void;
  /** 5D — written by a raycast hit or by `a11y/SceneOutline.tsx`; both write this same state (§8.2). */
  select(id: ObjectId | null): void;
  /** 5D — the physics sandbox's snapshot for this frame, or `null` before it has loaded/run. Composed into `objects` under `phys:` ids (§5.3 step 3). */
  setPhysicsSnapshot(snapshot: PhysicsSnapshot | null): void;
}

/**
 * `now` exists so playback is deterministic under test.
 *
 * `play()` used to read the real clock directly while `tick(nowMs)` took an
 * injected timestamp. Mixing the two meant `tick()` computed elapsed time
 * against a baseline the caller could not control, `quantise` then wrapped the
 * nonsensical result against `model.duration`, and the playback test failed
 * intermittently under load. Both ends of the subtraction now come from the
 * same clock.
 */
export interface DimensionsStoreOptions {
  /** Monotonic millisecond clock. Defaults to `performance.now`. */
  now?: () => number;
}

export function createDimensionsStore(
  model: ProcessModel,
  options: DimensionsStoreOptions = {}
): DimensionsStore {
  const now =
    options.now ??
    (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));
  let revision = 0;
  let t = 0;
  let playing = false;
  let tAtPlay = 0;
  let wallClockAtPlayMs = 0;
  let selection: ObjectId | null = null;
  let physicsSnapshot: PhysicsSnapshot | null = null;
  const actors: Readonly<Record<string, ActorPresence>> = {};

  let cachedSnapshot: SceneState = {
    ...composeScene({ model, t, physics: physicsSnapshot, selection, actors }),
    revision,
  };
  const listeners = new Set<() => void>();

  function notify() {
    // `.forEach()` rather than `for...of` — the latter needs
    // `--downlevelIteration` at this project's tsconfig target for a Set.
    listeners.forEach((listener) => listener());
  }

  function commit() {
    revision += 1;
    cachedSnapshot = {
      ...composeScene({ model, t, physics: physicsSnapshot, selection, actors }),
      revision,
    };
    notify();
  }

  function setT(next: number) {
    playing = false;
    const quantised = quantise(next, model.duration);
    if (quantised === t) return;
    t = quantised;
    commit();
  }

  return {
    getSnapshot() {
      return cachedSnapshot;
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    setT,
    play() {
      if (playing) return;
      playing = true;
      tAtPlay = t;
      wallClockAtPlayMs = now();
      notify(); // `t`/`revision` did not change, but `isPlaying()` did — usePlaying() subscribers need this
    },
    pause() {
      if (!playing) return;
      playing = false;
      notify();
    },
    isPlaying() {
      return playing;
    },
    tick(nowMs) {
      if (!playing) return;
      const elapsedSeconds = (nowMs - wallClockAtPlayMs) / 1000;
      const next = quantise(tAtPlay + elapsedSeconds, model.duration);
      if (next >= model.duration) {
        playing = false;
      }
      if (next === t) return;
      t = next;
      commit();
    },
    select(id) {
      if (selection === id) return;
      selection = id;
      commit();
    },
    setPhysicsSnapshot(snapshot) {
      physicsSnapshot = snapshot;
      commit();
    },
  };
}

/**
 * Subscribes a component to one derived value from the store, re-rendering
 * only when that value changes (by `Object.is`) — not on every store commit.
 * This is the "selector" half of §5.4's "React subscribes only to
 * UI-relevant slices". Built on React's own `useSyncExternalStore` (the
 * store decision at §5.4) rather than a hand-rolled subscribe effect,
 * because a hand-rolled version re-introduces exactly the tearing hazard
 * `useSyncExternalStore` exists to avoid.
 *
 * `useSyncExternalStore` has no selector parameter of its own, so the
 * memoisation below exists only to give `selector`'s output a stable
 * reference between calls on the *same* underlying snapshot — the store's
 * own `getSnapshot()` is already stable across non-committing reads.
 */
export function useStoreValue<T>(store: DimensionsStore, selector: (state: SceneState) => T): T {
  const cache = useRef<{ snapshot: SceneState; value: T } | null>(null);

  const getSnapshot = () => {
    const snapshot = store.getSnapshot();
    if (cache.current && cache.current.snapshot === snapshot) {
      return cache.current.value;
    }
    const value = selector(snapshot);
    cache.current = { snapshot, value };
    return value;
  };

  return useSyncExternalStore(store.subscribe, getSnapshot);
}

/**
 * `isPlaying()` is not part of `SceneState` (it is playback-loop bookkeeping,
 * not scene content), so it gets its own tiny selector. A boolean needs no
 * memoisation — `Object.is` on two booleans is exact.
 */
export function usePlaying(store: DimensionsStore): boolean {
  return useSyncExternalStore(store.subscribe, store.isPlaying);
}
