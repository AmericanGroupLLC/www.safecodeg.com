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

export const DIMENSION_LEVEL_META: Readonly<
  Record<DimensionLevel, DimensionLevelMeta>
> = {
  "3D": {
    level: "3D",
    short: "Spatial model",
    label: "3D — Spatial model and navigation",
    summary:
      "A real WebGL scene with a sourced 3D model, orbitable by pointer or keyboard.",
  },
  "4D": {
    level: "4D",
    short: "Time and process",
    label: "4D — Time, animation, lifecycle and process simulation",
    summary:
      "A named process simulation, scrubbed deterministically over time.",
  },
  "5D": {
    level: "5D",
    short: "Interaction and physics",
    label: "5D — Interaction, physics and live data",
    summary:
      "Object selection, a real physics sandbox and a live external data feed.",
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
    summary:
      "The same scene entered as an immersive WebXR session, where a device supports one.",
  },
} as const;

/**
 * A product's HIGHEST verified dimensional capability.
 * `undefined` means UNKNOWN. It never means "none" and never means "3D" —
 * see ARCHITECTURE-DIMENSIONS.md §11.1. No default value exists anywhere
 * for this type; a product's absence of a level must render as nothing.
 */
export type ProductDimensionLevel = DimensionLevel | undefined;

/**
 * Whether this build has actually shipped a level, today — and, where it is
 * only partly true, precisely what is not yet true about it.
 *
 * A plain live/not-live boolean cannot represent a level that is genuinely
 * partial: 5D's interaction, physics sandbox and live weather feed are real,
 * but the AI capability the level also names has not been built; 7D's
 * capability probe, every degradation state and the AR Quick Look path are
 * real and verified, but an immersive session actually starting has never
 * been observed on real XR hardware. Rounding either of those to "live"
 * overstates them; rounding them to "not live" understates the real, tested
 * work. "partial" is the third option, and its `caveat` is mandatory —
 * enforced by the discriminated union below, not by convention — so a
 * partial level can never render with nothing said about what is missing.
 *
 * `caveat` is where the honesty lives: every consumer renders it verbatim.
 * There is deliberately no separate marketing string a component could
 * choose to show instead.
 */
export type DimensionAvailabilityStatus = "live" | "partial" | "not-built";

export type DimensionAvailability =
  | { readonly status: "live" }
  | { readonly status: "partial"; readonly caveat: string }
  | { readonly status: "not-built"; readonly caveat?: string };

/**
 * THE single source of truth for "which dimensional levels actually work,
 * and how well" — read (not duplicated) by `client/src/lib/dimensionsAvailability.ts`,
 * which every UI surface (`pages/Home.tsx`, `pages/AGL.tsx`,
 * `pages/Dimensions.tsx`) imports from in turn. Update a level's entry here,
 * once, when its own acceptance criteria genuinely change — never in
 * advance of that, and never by editing a second copy elsewhere.
 */
export const DIMENSION_AVAILABILITY: Readonly<
  Record<DimensionLevel, DimensionAvailability>
> = {
  "3D": { status: "live" },
  "4D": { status: "live" },
  "5D": {
    status: "partial",
    caveat:
      "Object selection, the physics sandbox and the live weather feed are real and working. The AI capability this level also describes has not been built yet.",
  },
  "6D": {
    status: "partial",
    caveat:
      "Multi-user sync, presence, the digital twin and remote session control are real and verified across two pages in one browser — against a transport the test itself injects, because no Supabase project key exists in this build and the vendor code is therefore tree-shaken out entirely. Genuine sync across two separate browsers has not been verified — this build has no shared-session configuration, so it runs stand-alone for every visitor today.",
  },
  "7D": {
    status: "partial",
    caveat:
      "The capability probe, every degradation state and the AR Quick Look path are real and verified. Actually starting an immersive VR or AR session has not yet been observed on real XR hardware.",
  },
} as const;
