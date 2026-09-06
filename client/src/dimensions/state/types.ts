/**
 * The authoritative scene state — client/src/dimensions/state/types.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §5.1 (D-STATE): this state is plain,
 * JSON-serializable data. No `three` object appears anywhere below.
 * `render/projector.ts` is the only file permitted to turn this into an
 * `Object3D`.
 *
 * Scope note (T-004/T-005/T-006): `selection` and `actors` are part of the
 * full §5.2 contract so this type does not have to change shape again when
 * T-007 (5D interaction) and T-009/T-010 (6D collaboration) land — but this
 * task never writes anything to them. `selection` is always `null` and
 * `actors` is always `{}` until those tasks exist. That is an honest
 * "not built yet", not a placeholder standing in for real behaviour.
 */

export type ObjectId = string & { readonly __objectId: unique symbol };
export type ActorId = string & { readonly __actorId: unique symbol };

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface SceneObject {
  id: ObjectId;
  /** Key into the projector's geometry registry. Never a URL, never a three object. */
  kind: string;
  position: Vec3;
  rotation: Quat;
  scale: Vec3;
  visible: boolean;
  /** 4D lifecycle stage this object belongs to; null = present in every stage. */
  stage: string | null;
  /** Accessible name. Required, never empty — used as the a11y label for this object. */
  label: string;
  /** 6D last-writer-wins register (T-010). Unused until then; always seq 0 / actorId null. */
  rev: { seq: number; actorId: ActorId | null };
}

export interface ActorPresence {
  actorId: ActorId;
  displayName: string;
  colorHex: string;
  joinedAt: number;
  lastSeenAt: number;
}

export interface StageDescriptor {
  id: string;
  /** Rendered in the UI. T-006 compares rendered labels against this list. */
  label: string;
  startsAt: number;
  endsAt: number;
  objectIds: readonly ObjectId[];
}

export interface SceneState {
  /** Increments on every committed change. */
  revision: number;
  /** 4D simulation time in seconds, quantised to 1/120 s (§5.5). */
  t: number;
  objects: Readonly<Record<string, SceneObject>>;
  /** 5D (T-007). Always null until then. */
  selection: ObjectId | null;
  /** 4D, sourced from the process model — never hand-written in the UI. */
  stages: readonly StageDescriptor[];
  /** 6D (T-009/T-010). Always empty until then. */
  actors: Readonly<Record<string, ActorPresence>>;
}
