/**
 * The DimensionLevel contract — client/src/dimensions/contract.ts
 *
 * ZERO imports. That is what makes this file safe to import from outside
 * `client/src/dimensions/` without pulling the 3D runtime into the entry
 * chunk (ARCHITECTURE-DIMENSIONS.md §9.3, §11). Do not add an import here —
 * doing so removes the one property that makes this file entry-chunk-safe.
 *
 * `client/src/pages/Dimensions.tsx` is the only file outside this directory
 * that currently imports from here.
 */

export const DIMENSION_LEVELS = ["3D", "4D", "5D", "6D", "7D"] as const;

export type DimensionLevel = (typeof DIMENSION_LEVELS)[number];

export interface DimensionLevelMeta {
  level: DimensionLevel;
  /** Short label, e.g. "Spatial model". */
  short: string;
  /** Full label, e.g. "3D — Spatial model and navigation". */
  label: string;
  summary: string;
}

export const DIMENSION_LEVEL_META: Readonly<Record<DimensionLevel, DimensionLevelMeta>> = {
  "3D": {
    level: "3D",
    short: "Spatial model",
    label: "3D — Spatial model and navigation",
    summary: "A real WebGL scene with a sourced 3D model, orbitable by pointer or keyboard.",
  },
  "4D": {
    level: "4D",
    short: "Time and process",
    label: "4D — Time, animation, lifecycle and process simulation",
    summary: "A named process simulation, scrubbed deterministically over time.",
  },
  "5D": {
    level: "5D",
    short: "Interaction and physics",
    label: "5D — Interaction, physics and live data",
    summary: "Object selection, a real physics sandbox and a live external data feed.",
  },
  "6D": {
    level: "6D",
    short: "Shared session",
    label: "6D — Multi-user collaboration and a digital twin",
    summary: "A shared stage with presence, live edits and a durable twin.",
  },
  "7D": {
    level: "7D",
    short: "Immersive AR/VR",
    label: "7D — Immersive AR and VR",
    summary: "The same scene entered as an immersive WebXR session, where a device supports one.",
  },
} as const;

/**
 * A product's HIGHEST verified dimensional capability.
 * `undefined` means UNKNOWN. It never means "none" and never means "3D" —
 * see ARCHITECTURE-DIMENSIONS.md §11.1. No default value exists anywhere
 * for this type; a product's absence of a level must render as nothing.
 */
export type ProductDimensionLevel = DimensionLevel | undefined;
