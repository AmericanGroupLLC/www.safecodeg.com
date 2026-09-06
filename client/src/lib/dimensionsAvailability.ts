/**
 * Which dimensional levels this build has actually shipped, today.
 *
 * Single source of truth for every surface that names the 3D–7D stack
 * *outside* `/dimensions` itself — currently the Home teaser and the AGL
 * "Spatial & Industry SaaS" vertical (both T-013). Both import
 * `LIVE_DIMENSION_LEVELS` from here instead of each hand-writing which
 * levels are live, so there is exactly one place to update when a level's
 * own acceptance criteria (T-007/T-009/T-010/T-012) actually pass.
 *
 * Add a level here only once its task has genuinely shipped — never in
 * advance of that. Per the recorded project decision, a capability that
 * cannot be genuinely delivered is marked as such, never implied.
 *
 * Note on why this list does not live in `client/src/dimensions/contract.ts`:
 * that file is intentionally a static type/metadata contract with no "live"
 * flag (ARCHITECTURE-DIMENSIONS.md §11), and is being read (not written) by
 * `client/src/pages/Dimensions.tsx`, which keeps its own local
 * `LIVE_LEVELS` constant for the same purpose. This module mirrors that
 * constant's value; the two should be kept in step by whichever task next
 * closes a dimensional level. Consolidating them into one physical export
 * would mean either editing `contract.ts` or exporting from
 * `Dimensions.tsx`, both outside T-013's assigned scope (Home.tsx and
 * AGL.tsx only) — recorded as a follow-up rather than done silently here.
 */
import type { DimensionLevel } from "@/dimensions/contract";

export const LIVE_DIMENSION_LEVELS: readonly DimensionLevel[] = ["3D", "4D"];

export function isDimensionLevelLive(level: DimensionLevel): boolean {
  return LIVE_DIMENSION_LEVELS.includes(level);
}
