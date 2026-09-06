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
 * Scope note (T-004/T-005/T-006/T-007): steps 1, 2, 3 and 4 now run real
 * logic. Step 5 has nothing to compose from yet — there is no transport
 * wired into this store — so `actors` is always `{}` until T-010. When
 * T-010 lands, it extends this file by adding its step in the position the
 * order above already reserves for it; the order itself does not change.
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

export interface ComposeInput {
  model: ProcessModel;
  /** 4D simulation time in seconds. Already quantised by the store (§5.5). */
  t: number;
  /** 5D. `null` until the physics chunk has loaded and been run at least once. */
  physics: PhysicsSnapshot | null;
  /** 5D. `null` until an object is picked by raycast or from the scene outline. */
  selection: ObjectId | null;
  /** 6D (T-010). Always `{}` in this build. */
  actors: Readonly<Record<string, ActorPresence>>;
}

export type ComposedScene = Omit<SceneState, "revision">;

/** Pure. Same input object graph ⇒ structurally identical output, every time. */
export function composeScene(input: ComposeInput): ComposedScene {
  const { model, t, physics, selection, actors } = input;
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
