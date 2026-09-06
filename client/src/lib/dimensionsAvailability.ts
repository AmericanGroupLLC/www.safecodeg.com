/**
 * Which dimensional levels this build has actually shipped, today — and,
 * for a level that is only partly true, exactly what is not yet true about
 * it.
 *
 * Single source of truth for every surface that names the 3D–7D stack:
 * `pages/Home.tsx` (the teaser), `pages/AGL.tsx` (the "Spatial & Industry
 * SaaS" vertical) and `pages/Dimensions.tsx` (the stage's own capability
 * matrix) all read `DIMENSION_AVAILABILITY` from `@/dimensions/contract`
 * through this module. There is exactly one place to update when a level's
 * own acceptance criteria (T-007/T-008/T-009/T-010/T-012) actually change,
 * and the change propagates to all three surfaces because none of them
 * hand-write their own status list any more.
 *
 * History: this file used to define its own `LIVE_DIMENSION_LEVELS =
 * ["3D", "4D"]`, hand-typed, because a boolean is all a live/not-live flag
 * can express — and `Dimensions.tsx` separately hand-typed its own
 * `LIVE_LEVELS = ["3D", "4D", "5D", "7D"]` for the same reason, both
 * documented at the time as "should be kept in step by whichever task next
 * closes a dimensional level." Nobody did, so the two drifted: this file
 * said 5D and 7D were not live, `Dimensions.tsx` said they were, on the same
 * site. Both were wrong in the way a binary flag makes likely — 5D's AI
 * engine genuinely is not built (5D is not fully "live"), but its
 * interaction, physics and live-data are genuinely working (5D is not
 * "not built" either). `DimensionAvailability` (contract.ts) adds the third
 * state a boolean cannot hold — "partial", with a mandatory `caveat` naming
 * precisely what is not yet true — so there is no longer a rounding choice
 * to get wrong, and only one physical place either page can read it from.
 */
import {
  DIMENSION_LEVELS,
  DIMENSION_AVAILABILITY,
  type DimensionLevel,
  type DimensionAvailability,
  type DimensionAvailabilityStatus,
} from "@/dimensions/contract";

export type { DimensionAvailability, DimensionAvailabilityStatus };

/** The single per-level availability record every surface renders from. */
export function getDimensionAvailability(
  level: DimensionLevel
): DimensionAvailability {
  return DIMENSION_AVAILABILITY[level];
}

/**
 * Derived, not hand-typed: exactly the levels whose status is "live".
 * Kept for call sites that only need a yes/no gate; anything that needs to
 * say more should read `getDimensionAvailability(level)` instead so a
 * partial level's caveat has somewhere to render.
 */
export const LIVE_DIMENSION_LEVELS: readonly DimensionLevel[] =
  DIMENSION_LEVELS.filter(
    level => DIMENSION_AVAILABILITY[level].status === "live"
  );

export function isDimensionLevelLive(level: DimensionLevel): boolean {
  return DIMENSION_AVAILABILITY[level].status === "live";
}

/**
 * The caveat for a level, or `undefined` when it has none — "live" never
 * has one, "not-built" may or may not. A plain `.caveat` access on
 * `DimensionAvailability` does not type-check outside a narrowed branch
 * (the "live" variant has no such property at all, by design), so callers
 * that just want the string — without needing to branch on status
 * themselves — read it through here instead.
 */
export function getDimensionCaveat(level: DimensionLevel): string | undefined {
  const availability = DIMENSION_AVAILABILITY[level];
  return "caveat" in availability ? availability.caveat : undefined;
}

/** A short, honest badge label for a status — never a marketing adjective. */
export interface DimensionStatusPresentation {
  readonly badgeLabel: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly borderColor: string;
}

const STATUS_PRESENTATION: Readonly<
  Record<DimensionAvailabilityStatus, DimensionStatusPresentation>
> = {
  live: {
    badgeLabel: "Live",
    badgeBg: "rgba(52,211,153,0.15)",
    badgeText: "#34D399",
    borderColor: "rgba(124,58,237,0.35)",
  },
  partial: {
    badgeLabel: "Partial",
    badgeBg: "rgba(251,191,36,0.15)",
    badgeText: "#FBBF24",
    borderColor: "rgba(245,158,11,0.35)",
  },
  "not-built": {
    badgeLabel: "Not yet available",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeText: "rgba(255,255,255,0.6)",
    borderColor: "rgba(255,255,255,0.08)",
  },
};

/** The one place badge copy/color for a status is defined — every consumer reads it from here instead of re-deriving it. */
export function dimensionStatusPresentation(
  status: DimensionAvailabilityStatus
): DimensionStatusPresentation {
  return STATUS_PRESENTATION[status];
}
