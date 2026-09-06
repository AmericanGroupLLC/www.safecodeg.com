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
import type {
  ActorId,
  ActorPresence,
  ObjectId,
  SceneObject,
  SceneState,
} from "./types";
import type { ProcessModel } from "../model/process";
import { composeScene, type RemoteObjectOverride } from "./compose";
import type { PhysicsSnapshot } from "../physics/sandbox";
import { opWins } from "../transport/merge";
import type { SceneOp } from "../transport/types";

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

  /** 6D — replaces the presence dict wholesale. Called from `transport.onPresence()`'s callback. */
  setActors(actors: Readonly<Record<string, ActorPresence>>): void;
  /**
   * 6D — the single entry point for applying a `SceneOp`, whether it arrived
   * from a peer (`transport.onOp()`) or originated locally (`publishLocalOp`
   * routes through this too, so a local move and a remote move are subject
   * to the exact same rules and can never diverge).
   *
   * T-016 finding S-5: `objectId` is checked against a set built from
   * `model.objects` — the *authored* model this store was created with —
   * never from `getSnapshot().objects`. The composed snapshot additionally
   * contains `phys:`-prefixed ids injected by `compose.ts`'s step 3 from the
   * *local* physics simulation (`compose.ts`, the "Step 3 (5D physics)"
   * block); deriving the allowlist from the composed state instead would let
   * a peer's op carrying `objectId: "phys:ball"` win the LWW comparison and
   * overwrite the locally-simulated ball's transform on every other screen,
   * even though no other peer runs that simulation. Building the allowlist
   * from `model.objects` once, at store creation, makes that impossible:
   * `phys:ball` is never a member of it, so `applyOp` rejects it before
   * anything else runs.
   *
   * Returns `true` iff the op passed the allowlist check and won the LWW
   * comparison (`transport/merge.ts`'s `opWins`) and was applied; `false`
   * otherwise. Every call increments exactly one of the `opsApplied` /
   * `opsRejected` counters `getOpCounters()` reports (surfaced by
   * `state/testHook.ts`'s `getTransport()`).
   */
  applyOp(op: SceneOp): boolean;
  /**
   * 6D — the local half of a move: computes the next `seq` from this
   * object's current register (so it competes fairly against a concurrent
   * remote op on the same object), builds a `SceneOp`, and routes it through
   * the same `applyOp` a peer's op would go through. Returns the op — for
   * the caller to `transport.publish()` — or `null` if `objectId` is not a
   * member of the authored model (the same allowlist `applyOp` enforces).
   */
  publishLocalOp(
    objectId: ObjectId,
    actorId: ActorId,
    patch: SceneOp["patch"]
  ): SceneOp | null;
  /**
   * 6D digital twin (§6.6) — hydrates the store from a loaded snapshot's
   * objects, once, before any live op is applied. Every entry not already a
   * member of the authored model's id set is silently skipped (T-016 S-5,
   * applied identically to a stored row as to a live op) — the caller
   * (`transport/useCollaboration.ts`) is additionally expected to have
   * already filtered against `getValidObjectIds()` before calling this, per
   * the security review's "pass `validObjectIds` to `loadSnapshot`"
   * instruction; this is the second, defensive layer, not the only one.
   */
  hydrateFromSnapshot(objects: Readonly<Record<string, SceneObject>>): void;
  /** The authored model's object-id allowlist (T-016 S-5) — read-only, for a caller that needs to filter a snapshot or a UI's target-object list against the same set `applyOp` enforces. */
  getValidObjectIds(): ReadonlySet<string>;
  getOpCounters(): { applied: number; rejected: number };
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
    (() =>
      typeof performance !== "undefined" ? performance.now() : Date.now());
  let revision = 0;
  let t = 0;
  let playing = false;
  let tAtPlay = 0;
  let wallClockAtPlayMs = 0;
  let selection: ObjectId | null = null;
  let physicsSnapshot: PhysicsSnapshot | null = null;
  let actors: Readonly<Record<string, ActorPresence>> = {};
  // 6D — the per-object LWW register + its currently-winning patch (§6.4).
  // Keyed only by ids this store will ever recognise (`validObjectIds`
  // below); `applyOpInternal` is the only writer.
  let remoteOverrides: Record<string, RemoteObjectOverride> = {};
  let opsApplied = 0;
  let opsRejected = 0;
  let localOpCounter = 0;

  // T-016 finding S-5: built ONCE from the authored model this store was
  // constructed with, never from `getSnapshot().objects` (which also
  // contains `phys:`-prefixed ids `compose.ts`'s step 3 injects from the
  // *local* physics snapshot — see `DimensionsStore.applyOp`'s doc comment
  // for the exploit this prevents).
  const validObjectIds = new Set(Object.keys(model.objects));

  let cachedSnapshot: SceneState = {
    ...composeScene({
      model,
      t,
      physics: physicsSnapshot,
      selection,
      actors,
      remote: remoteOverrides,
    }),
    revision,
  };
  const listeners = new Set<() => void>();

  function notify() {
    // `.forEach()` rather than `for...of` — the latter needs
    // `--downlevelIteration` at this project's tsconfig target for a Set.
    listeners.forEach(listener => listener());
  }

  function commit() {
    revision += 1;
    cachedSnapshot = {
      ...composeScene({
        model,
        t,
        physics: physicsSnapshot,
        selection,
        actors,
        remote: remoteOverrides,
      }),
      revision,
    };
    notify();
  }

  /**
   * The single arbiter for every `SceneOp`, local or remote (T-016 S-5). See
   * `DimensionsStore.applyOp`'s doc comment for the allowlist rationale.
   */
  function applyOpInternal(op: SceneOp): boolean {
    const objectId = op.objectId as string;
    if (!validObjectIds.has(objectId)) {
      opsRejected += 1;
      return false;
    }
    const current = remoteOverrides[objectId]?.rev ?? { seq: 0, actorId: null };
    if (!opWins(op, current)) {
      opsRejected += 1;
      return false;
    }
    const previousPatch = remoteOverrides[objectId]?.patch ?? {};
    remoteOverrides = {
      ...remoteOverrides,
      [objectId]: {
        // A later op that sets only `position` must not erase a field an
        // earlier winning op set (e.g. `rotation`) — merge onto the
        // previous winning patch rather than replacing it wholesale.
        patch: { ...previousPatch, ...op.patch },
        rev: { seq: op.seq, actorId: op.actorId },
      },
    };
    opsApplied += 1;
    commit();
    return true;
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
    setActors(next) {
      actors = next;
      commit();
    },
    applyOp(op) {
      return applyOpInternal(op);
    },
    publishLocalOp(objectId, actorId, patch) {
      const id = objectId as string;
      if (!validObjectIds.has(id)) return null;
      const current = remoteOverrides[id]?.rev ?? { seq: 0, actorId: null };
      localOpCounter += 1;
      const op: SceneOp = {
        opId: `local:${actorId}:${id}:${localOpCounter}`,
        objectId,
        actorId,
        seq: current.seq + 1,
        at: now(),
        patch,
      };
      return applyOpInternal(op) ? op : null;
    },
    hydrateFromSnapshot(objects) {
      let changed = false;
      const next = { ...remoteOverrides };
      for (const [id, obj] of Object.entries(objects)) {
        // Defence in depth — the caller (`transport/useCollaboration.ts`)
        // must already have filtered against `getValidObjectIds()` per
        // T-016 S-5's "pass validObjectIds to loadSnapshot" instruction;
        // this check is what makes that non-optional even if a future
        // caller forgets.
        if (!validObjectIds.has(id)) continue;
        next[id] = {
          patch: {
            position: obj.position,
            rotation: obj.rotation,
            scale: obj.scale,
            visible: obj.visible,
          },
          rev: obj.rev,
        };
        changed = true;
      }
      if (!changed) return;
      remoteOverrides = next;
      commit();
    },
    getValidObjectIds() {
      return validObjectIds;
    },
    getOpCounters() {
      return { applied: opsApplied, rejected: opsRejected };
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
export function useStoreValue<T>(
  store: DimensionsStore,
  selector: (state: SceneState) => T
): T {
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
