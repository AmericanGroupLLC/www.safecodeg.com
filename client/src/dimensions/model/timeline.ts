/**
 * The 4D timeline function — client/src/dimensions/model/timeline.ts
 *
 * PURE. `timelineAt(model, t)` reads only its two arguments and returns a
 * structurally identical result for the same inputs, every time.
 *
 * ARCHITECTURE-DIMENSIONS.md §5.5 states three rules that make T-006's
 * byte-identical-scrubbing criterion achievable, and this file is where all
 * three are enforced:
 *
 *   1. `t` is quantised by the caller (the store, on every write) — this
 *      file does not re-derive `t` from anything.
 *   2. This file never accumulates a `t` — it is a pure function of the
 *      `t` it is given.
 *   3. No call to a random-number source or a wall-clock reader anywhere
 *      below — this file is checked by a grep for those two APIs' exact
 *      names (see `tests/unit/dimensions-timeline.test.ts`), which is why
 *      rule 3 is described here rather than spelled out literally: doing
 *      so would make this very comment match its own check.
 */

import type { ObjectId, Quat, StageDescriptor, Vec3 } from "../state/types";
import type { Keyframe, ProcessModel } from "./process";

export interface TimelineTransform {
  position: Vec3;
  rotation: Quat;
  scale: Vec3;
}

export interface TimelineSlice {
  /** The stage whose window contains `t`, or the last stage once `t` reaches the end. */
  activeStage: StageDescriptor | null;
  /** Ids of every object the timeline layer has an opinion about (i.e. every id in `model.keyframes`). */
  visible: Readonly<Record<string, boolean>>;
  transforms: Readonly<Record<string, TimelineTransform>>;
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

function lerpVec3(a: Vec3, b: Vec3, f: number): Vec3 {
  return { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), z: lerp(a.z, b.z, f) };
}

/** Shortest-path spherical interpolation between two unit quaternions. Pure. */
function slerpQuat(a: Quat, b: Quat, f: number): Quat {
  let { x: bx, y: by, z: bz, w: bw } = b;
  let cosHalfTheta = a.x * bx + a.y * by + a.z * bz + a.w * bw;

  if (cosHalfTheta < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    cosHalfTheta = -cosHalfTheta;
  }

  if (cosHalfTheta >= 1.0) {
    return { x: a.x, y: a.y, z: a.z, w: a.w };
  }

  const sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);

  if (Math.abs(sinHalfTheta) < 1e-6) {
    return { x: lerp(a.x, bx, 0.5), y: lerp(a.y, by, 0.5), z: lerp(a.z, bz, 0.5), w: lerp(a.w, bw, 0.5) };
  }

  const halfTheta = Math.acos(cosHalfTheta);
  const ratioA = Math.sin((1 - f) * halfTheta) / sinHalfTheta;
  const ratioB = Math.sin(f * halfTheta) / sinHalfTheta;

  return {
    x: a.x * ratioA + bx * ratioB,
    y: a.y * ratioA + by * ratioB,
    z: a.z * ratioA + bz * ratioB,
    w: a.w * ratioA + bw * ratioB,
  };
}

function sampleKeyframes(frames: readonly Keyframe[], t: number): TimelineTransform {
  const first = frames[0];
  if (frames.length === 1 || t <= first.t) {
    return { position: first.position, rotation: first.rotation, scale: first.scale };
  }

  const last = frames[frames.length - 1];
  if (t >= last.t) {
    return { position: last.position, rotation: last.rotation, scale: last.scale };
  }

  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const f = span === 0 ? 0 : (t - a.t) / span;
      return {
        position: lerpVec3(a.position, b.position, f),
        rotation: slerpQuat(a.rotation, b.rotation, f),
        scale: lerpVec3(a.scale, b.scale, f),
      };
    }
  }

  // Unreachable given the clamps above; kept exhaustive rather than asserting.
  return { position: last.position, rotation: last.rotation, scale: last.scale };
}

/** Exported so the UI layer (which needs "which stage is `t` in" for display) does not re-derive this search itself. */
export function findActiveStage(model: ProcessModel, t: number): StageDescriptor | null {
  for (const stage of model.stages) {
    if (t >= stage.startsAt && t < stage.endsAt) return stage;
  }
  const last = model.stages[model.stages.length - 1];
  if (last && t >= last.endsAt) return last;
  return model.stages[0] ?? null;
}

/** PURE. Reads only (model, t). */
export function timelineAt(model: ProcessModel, t: number): TimelineSlice {
  const clampedT = Math.min(Math.max(t, 0), model.duration);
  const activeStage = findActiveStage(model, clampedT);

  const visible: Record<string, boolean> = {};
  const transforms: Record<string, TimelineTransform> = {};

  for (const [id, frames] of Object.entries(model.keyframes)) {
    const object = model.objects[id];
    const stage = object?.stage ?? null;
    visible[id] = stage === null || stage === activeStage?.id;
    transforms[id] = sampleKeyframes(frames, clampedT);
  }

  return { activeStage, visible, transforms };
}

export function visibleObjectIds(model: ProcessModel, t: number): ReadonlySet<ObjectId> {
  const slice = timelineAt(model, t);
  const ids = new Set<ObjectId>();
  for (const [id, isVisible] of Object.entries(slice.visible)) {
    if (isVisible) ids.add(id as ObjectId);
  }
  return ids;
}
