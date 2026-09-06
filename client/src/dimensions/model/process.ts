/**
 * The authored 4D process model — client/src/dimensions/model/process.ts
 *
 * This is the single source of truth for the lifecycle T-006 requires be
 * "named in the UI", and for the stage list T-006 compares rendered labels
 * against. `DimensionsStage.tsx` renders `PRODUCT_PIPELINE.label` and
 * `PRODUCT_PIPELINE.stages[*].label` — it never hand-writes those strings
 * a second time (ARCHITECTURE-DIMENSIONS.md §5.6).
 *
 * The simulated process: a toy car's delivery pipeline — Warehouse, Loading,
 * Transit, Delivered — four non-overlapping stages over 16 seconds. The
 * 3D model (client/public/models/toycar.glb, see toycar.LICENSE.txt) is the
 * "product" moving through the pipeline; a crate and a platform are ordinary
 * primitive set dressing, not the sourced model T-005 requires.
 */

import type {
  ObjectId,
  Quat,
  SceneObject,
  StageDescriptor,
  Vec3,
} from "../state/types";

function objectId(id: string): ObjectId {
  return id as ObjectId;
}

export interface Keyframe {
  /** Seconds, on the model's own timeline. */
  t: number;
  position: Vec3;
  rotation: Quat;
  scale: Vec3;
}

export interface ProcessModel {
  id: string;
  /** The named lifecycle/process — rendered verbatim in the UI. */
  label: string;
  duration: number;
  stages: readonly StageDescriptor[];
  objects: Readonly<Record<string, SceneObject>>;
  keyframes: Readonly<Record<string, readonly Keyframe[]>>;
}

const IDENTITY_ROTATION: Quat = { x: 0, y: 0, z: 0, w: 1 };
const UNIT_SCALE: Vec3 = { x: 1, y: 1, z: 1 };
/** toycar.glb ships at real-world scale (~7cm) — see the keyframes below. */
const TOYCAR_SCALE: Vec3 = { x: 12, y: 12, z: 12 };

function turned(degrees: number): Quat {
  const half = (degrees * Math.PI) / 360;
  return { x: 0, y: Math.sin(half), z: 0, w: Math.cos(half) };
}

function baseObject(
  id: string,
  kind: string,
  label: string,
  stage: string | null
): SceneObject {
  return {
    id: objectId(id),
    kind,
    position: { x: 0, y: 0, z: 0 },
    rotation: IDENTITY_ROTATION,
    scale: UNIT_SCALE,
    visible: false,
    stage,
    label,
    rev: { seq: 0, actorId: null },
  };
}

const STAGE_WAREHOUSE: StageDescriptor = {
  id: "warehouse",
  label: "Warehouse",
  startsAt: 0,
  endsAt: 4,
  objectIds: [objectId("crate")],
};

const STAGE_LOADING: StageDescriptor = {
  id: "loading",
  label: "Loading",
  startsAt: 4,
  endsAt: 8,
  objectIds: [objectId("toycar-loading"), objectId("crate-open")],
};

const STAGE_TRANSIT: StageDescriptor = {
  id: "transit",
  label: "Transit",
  startsAt: 8,
  endsAt: 12,
  objectIds: [objectId("toycar-transit")],
};

const STAGE_DELIVERED: StageDescriptor = {
  id: "delivered",
  label: "Delivered",
  startsAt: 12,
  endsAt: 16,
  objectIds: [objectId("toycar-delivered")],
};

export const PRODUCT_PIPELINE: ProcessModel = {
  id: "product-delivery-pipeline",
  label: "Product Delivery Pipeline",
  duration: 16,
  stages: [STAGE_WAREHOUSE, STAGE_LOADING, STAGE_TRANSIT, STAGE_DELIVERED],
  objects: {
    platform: baseObject("platform", "platform", "Loading platform", null),
    crate: baseObject(
      "crate",
      "crate-closed",
      "Closed crate",
      STAGE_WAREHOUSE.id
    ),
    "crate-open": baseObject(
      "crate-open",
      "crate-open",
      "Opened crate",
      STAGE_LOADING.id
    ),
    "toycar-loading": baseObject(
      "toycar-loading",
      "toycar",
      "Toy car — at the loading dock",
      STAGE_LOADING.id
    ),
    "toycar-transit": baseObject(
      "toycar-transit",
      "toycar",
      "Toy car — in transit",
      STAGE_TRANSIT.id
    ),
    "toycar-delivered": baseObject(
      "toycar-delivered",
      "toycar",
      "Toy car — delivered",
      STAGE_DELIVERED.id
    ),
  },
  keyframes: {
    platform: [
      {
        t: 0,
        position: { x: 0, y: -0.5, z: 0 },
        rotation: IDENTITY_ROTATION,
        scale: { x: 12, y: 0.2, z: 4 },
      },
    ],
    crate: [
      {
        t: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: IDENTITY_ROTATION,
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
    ],
    "crate-open": [
      {
        t: 4,
        position: { x: -2.4, y: 0, z: 0.8 },
        rotation: turned(15),
        scale: { x: 0.8, y: 0.8, z: 0.8 },
      },
    ],
    // toycar.glb (client/public/models/toycar.LICENSE.txt) is modelled at
    // real-world scale — a bounding box roughly 7.3cm x 2.9cm x 7.4cm — so it
    // is scaled up ~12x to read clearly next to the crate and platform. The
    // y offset accounts for the model's origin sitting near the vertical
    // centre of its own mesh rather than at its base.
    "toycar-loading": [
      {
        t: 4,
        position: { x: -2.4, y: -0.2, z: -0.8 },
        rotation: turned(0),
        scale: TOYCAR_SCALE,
      },
    ],
    "toycar-transit": [
      {
        t: 8,
        position: { x: -2.4, y: -0.2, z: -0.8 },
        rotation: turned(0),
        scale: TOYCAR_SCALE,
      },
      {
        t: 10,
        position: { x: 0, y: -0.2, z: -0.8 },
        rotation: turned(180),
        scale: TOYCAR_SCALE,
      },
      {
        t: 12,
        position: { x: 4.2, y: -0.2, z: -0.8 },
        rotation: turned(180),
        scale: TOYCAR_SCALE,
      },
    ],
    "toycar-delivered": [
      {
        t: 12,
        position: { x: 4.2, y: -0.2, z: -0.8 },
        rotation: turned(180),
        scale: TOYCAR_SCALE,
      },
    ],
  },
};
