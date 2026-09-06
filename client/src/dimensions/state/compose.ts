/**
 * The fixed composition pipeline — client/src/dimensions/state/compose.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §5.3: not a plugin system, not a registry —
 * named steps in a fixed order, in one file, so "which layer last wrote
 * this object" is always answerable. The full design has five steps:
 *
 *   1. baseline   — model.objects. Owns every id in the authored model.
 *   2. timeline (4D) — timelineAt(model, t). Overrides visible/transform.
 *   3. physics (5D)  — owns ids prefixed `phys:`. Built in T-007.
 *   4. interaction (5D) — owns `selection`. Built in T-007.
 *   5. presence (6D) — applied last, per-object, on `opWins`. NOT BUILT (T-010).
 *
 * Scope note (T-010): step 5 now runs. `state/store.ts` is the "which layer
 * last wrote this object" arbiter — it decides, per inbound or locally
 * originated `SceneOp`, whether the op wins the LWW comparison
 * (`transport/merge.ts`'s `opWins`) against the object's current `rev`, and
 * only ever records that decision for an id drawn from `ProcessModel.objects`
 * (T-016 finding S-5 — see `store.ts`'s `applyOpInternal`). This file stays
 * a pure overlay: it is handed the *already-resolved* winners as `remote`
 * and simply applies them last, per object, exactly as §5.3 step 5
 * specifies — it never itself decides who wins.
 *
 * `physics` (step 3) is read as `import type` only — `PhysicsSnapshot` is a
 * plain data shape with no runtime import of `cannon-es` attached to it, so
 * this file (which sits in the always-loaded `vendor-three` chunk) never
 * pulls the physics engine along with it (ARCHITECTURE-DIMENSIONS.md §9.3's
 * boundary rule, applied to the physics chunk the same way it applies to
 * `@/dimensions` from outside this directory).
 *
 * `revision` is deliberately not part of this function's output: it is a
 * store-level counter (ARCHITECTURE-DIMENSIONS.md §5.4, "increments on every
 * committed change"), not something a pure projection of `(model, t, …)`
 * can derive on its own. `state/store.ts` attaches it.
 */

import type { ActorId, ActorPresence, ObjectId, Quat, SceneObject, SceneState, Vec3 } from "./types";
import type { ProcessModel } from "../model/process";
import { timelineAt } from "../model/timeline";
import type { PhysicsSnapshot } from "../physics/sandbox";
import { PHYSICS_BALL_RADIUS } from "../physics/constants";

const IDENTITY_ROTATION: Quat = { x: 0, y: 0, z: 0, w: 1 };
const PHYSICS_BODY_SCALE: Vec3 = { x: PHYSICS_BALL_RADIUS, y: PHYSICS_BALL_RADIUS, z: PHYSICS_BALL_RADIUS };

/**
 * One object's already-resolved 6D state — the *winning* value of the LWW
 * register described in ARCHITECTURE-DIMENSIONS.md §6.4, computed by
 * `state/store.ts`'s `applyOpInternal` before this file ever sees it. `patch`
 * accumulates every field a winning op has ever set for this object (a peer
 * sending only `position` must not erase a previously-won `rotation`); `rev`
 * is `SceneObject["rev"]` — the register itself, carried through so the
 * composed object's `rev` reflects who last won it, not always `{seq:0,
 * actorId:null}`.
 */
export interface RemoteObjectOverride {
  patch: Partial<Pick<SceneObject, "position" | "rotation" | "scale" | "visible">>;
  rev: { seq: number; actorId: ActorId | null };
}

export interface ComposeInput {
  model: ProcessModel;
  /** 4D simulation time in seconds. Already quantised by the store (§5.5). */
  t: number;
  /** 5D. `null` until the physics chunk has loaded and been run at least once. */
  physics: PhysicsSnapshot | null;
  /** 5D. `null` until an object is picked by raycast or from the scene outline. */
  selection: ObjectId | null;
  /** 6D presence — the participant list, keyed by `actorId`. Empty until the user joins (T-010). */
  actors: Readonly<Record<string, ActorPresence>>;
  /**
   * 6D per-object overrides (T-010), already winner-resolved by the store —
   * keyed only by an id drawn from `model.objects` (T-016 S-5: the store
   * builds this key set from `ProcessModel.objects`, never from this
   * function's own composed output, which is what keeps a physics-owned
   * `phys:` id — injected below, step 3 — from ever being remotely
   * overridable). Empty until the user joins.
   *
   * Optional — every call site predating T-010 (this module's own existing
   * unit tests included) omits it, which is equivalent to `{}` (no 6D
   * overrides, i.e. this build's behaviour before T-010).
   */
  remote?: Readonly<Record<string, RemoteObjectOverride>>;
}

export type ComposedScene = Omit<SceneState, "revision">;

/** Pure. Same input object graph ⇒ structurally identical output, every time. */
export function composeScene(input: ComposeInput): ComposedScene {
  const { model, t, physics, selection, actors, remote = {} } = input;
  const slice = timelineAt(model, t);

  const objects: Record<string, SceneObject> = {};
  for (const [id, base] of Object.entries(model.objects)) {
    const transform = slice.transforms[id];
    const visible = slice.visible[id];
    objects[id] = {
      ...base,
      ...(transform ? { position: transform.position, rotation: transform.rotation, scale: transform.scale } : {}),
      ...(visible !== undefined ? { visible } : {}),
    };
  }

  // Step 3 (5D physics) — owns only ids prefixed `phys:`, never an authored
  // id, which is what keeps the 4D timeline above pure (§5.3).
  if (physics) {
    for (const [bodyId, body] of Object.entries(physics.bodies)) {
      const id = `phys:${bodyId}`;
      objects[id] = {
        id: id as ObjectId,
        kind: `physics-${bodyId}`,
        position: body.position,
        rotation: IDENTITY_ROTATION,
        scale: PHYSICS_BODY_SCALE,
        visible: true,
        stage: null,
        label: `Physics sandbox — ${bodyId}`,
        rev: { seq: 0, actorId: null },
      };
    }
  }

  // Step 5 (6D presence) — applied last, per object, and only for ids this
  // loop above already produced (i.e. ids in `model.objects`, per S-5's
  // membership rule) — a `remote` entry for anything else is simply never
  // looked up. This is what makes it structurally impossible for a
  // `phys:`-prefixed id (step 3, owned exclusively by the local physics
  // snapshot) to be remotely overridden: `remote`'s keys come from the
  // store's `validObjectIds`, built from `model.objects`, never from this
  // function's own output.
  for (const [id, override] of Object.entries(remote)) {
    const base = objects[id];
    if (!base) continue;
    objects[id] = { ...base, ...override.patch, rev: override.rev };
  }

  return {
    t,
    objects,
    selection,
    stages: model.stages,
    actors,
  };
}

/** Re-exported so callers that only need actor ids don't have to know the field name. */
export function actorIds(actors: Readonly<Record<string, ActorPresence>>): readonly ActorId[] {
  return Object.values(actors).map((a) => a.actorId);
}
