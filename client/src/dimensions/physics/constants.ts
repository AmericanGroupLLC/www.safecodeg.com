/**
 * Physics sandbox constants — client/src/dimensions/physics/constants.ts
 *
 * ZERO imports, deliberately — like `contract.ts` (ARCHITECTURE-DIMENSIONS.md
 * §9.3, §11), that is what makes this file safe to import as a *value* from
 * `state/compose.ts` (which sits in the always-loaded `vendor-three` chunk)
 * without dragging `cannon-es` along with it. `physics/sandbox.ts` imports
 * these same numbers so the visual placement in `compose.ts` and the
 * simulation in `sandbox.ts` never drift apart into two hardcoded copies.
 */

import type { Vec3 } from "../state/types";

/** Matches the pipeline platform's top surface (`model/process.ts`'s platform keyframe: y=-0.5, half-height 0.1). */
export const PHYSICS_GROUND_Y = -0.4;

export const PHYSICS_BALL_RADIUS = 0.35;

/**
 * Off to the side of the 4D pipeline (which occupies roughly x:[-2.4, 4.2],
 * z:[-0.8, 0.8]) so the two simulations never visually overlap, both sitting
 * on the same platform box (half-extents x:6, z:2 — see `model/process.ts`).
 */
export const PHYSICS_START_POSITION: Vec3 = { x: -4.5, y: 4, z: 1.2 };

export const PHYSICS_IMPULSE_MIN = -6;
export const PHYSICS_IMPULSE_MAX = 6;
export const PHYSICS_IMPULSE_STEP = 0.5;
export const PHYSICS_IMPULSE_DEFAULT = 2;
