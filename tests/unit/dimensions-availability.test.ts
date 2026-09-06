/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/contract.ts (DIMENSION_AVAILABILITY) and
 * client/src/lib/dimensionsAvailability.ts
 *
 * This is the regression test for the defect T-013's own doc comment
 * described: a binary live/not-live flag lived in two physical places
 * (`lib/dimensionsAvailability.ts`'s `LIVE_DIMENSION_LEVELS` and
 * `pages/Dimensions.tsx`'s own `LIVE_LEVELS`), each hand-typed, and they
 * drifted — one said 5D/7D were not live, the other said they were, on the
 * same site. The fix makes `DIMENSION_AVAILABILITY` in `contract.ts` the
 * only place a status is written, with every consumer reading it (directly
 * or through `dimensionsAvailability.ts`) rather than re-declaring it.
 * These tests prove that structurally, not just by inspection.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DIMENSION_LEVELS, DIMENSION_AVAILABILITY, type DimensionLevel } from '@/dimensions/contract';
import {
  getDimensionAvailability,
  getDimensionCaveat,
  isDimensionLevelLive,
  LIVE_DIMENSION_LEVELS,
  dimensionStatusPresentation,
} from '@/lib/dimensionsAvailability';

function readRepoFile(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8');
}

describe('DIMENSION_AVAILABILITY — the single source of truth', () => {
  it('has exactly one entry per dimensional level, no more, no fewer', () => {
    const keys = Object.keys(DIMENSION_AVAILABILITY).sort();
    expect(keys).toEqual([...DIMENSION_LEVELS].sort());
  });

  it('every status is one of live / partial / not-built', () => {
    for (const level of DIMENSION_LEVELS) {
      expect(['live', 'partial', 'not-built']).toContain(DIMENSION_AVAILABILITY[level].status);
    }
  });

  it('a "live" level carries no caveat — nowhere for a marketing adjective to live', () => {
    for (const level of DIMENSION_LEVELS) {
      const availability = DIMENSION_AVAILABILITY[level];
      if (availability.status === 'live') {
        expect('caveat' in availability).toBe(false);
      }
    }
  });

  it('every "partial" level carries a non-empty caveat naming what is not yet true', () => {
    const partialLevels = DIMENSION_LEVELS.filter((l) => DIMENSION_AVAILABILITY[l].status === 'partial');
    expect(partialLevels.length).toBeGreaterThan(0); // this project genuinely has partial levels today
    for (const level of partialLevels) {
      const availability = DIMENSION_AVAILABILITY[level];
      expect(availability.status).toBe('partial');
      if (availability.status === 'partial') {
        expect(typeof availability.caveat).toBe('string');
        expect(availability.caveat.length).toBeGreaterThan(0);
      }
    }
  });

  it("current, verified state: 3D, 4D are live; 5D, 6D and 7D are partial", () => {
    // This is not a tautology against the source — it pins today's actually
    // verified state (per TASKS.md / this task's brief) so a silent,
    // unreviewed change to DIMENSION_AVAILABILITY fails this test and must
    // be a deliberate edit, not an accident.
    //
    // T-010/T-011: 6D moved from "not-built" to "partial". Multi-user sync,
    // presence, the digital twin and remote session control are real and
    // proven — genuinely, across two pages in one browser context
    // (`tests/e2e/dimensions-collab.spec.ts`) — but this build has no
    // Supabase anon key, so genuine sync across two *separate* browsers is
    // unverified and the build runs `nullTransport`/"unconfigured" for
    // every real visitor today. "partial", not "live": rounding either way
    // would misstate what is actually true.
    const statuses: Record<DimensionLevel, string> = Object.fromEntries(
      DIMENSION_LEVELS.map((l) => [l, DIMENSION_AVAILABILITY[l].status]),
    ) as Record<DimensionLevel, string>;
    expect(statuses).toEqual({
      '3D': 'live',
      '4D': 'live',
      '5D': 'partial',
      '6D': 'partial',
      '7D': 'partial',
    });
  });
});

describe('lib/dimensionsAvailability.ts — the adapter every UI surface reads through', () => {
  it('getDimensionAvailability(level) returns the same record contract.ts defines (not a copy)', () => {
    for (const level of DIMENSION_LEVELS) {
      expect(getDimensionAvailability(level)).toBe(DIMENSION_AVAILABILITY[level]);
    }
  });

  it('isDimensionLevelLive agrees with DIMENSION_AVAILABILITY exactly — true iff status is "live"', () => {
    for (const level of DIMENSION_LEVELS) {
      expect(isDimensionLevelLive(level)).toBe(DIMENSION_AVAILABILITY[level].status === 'live');
    }
  });

  it('LIVE_DIMENSION_LEVELS is derived, not hand-typed: exactly the levels whose status is "live"', () => {
    const expected = DIMENSION_LEVELS.filter((l) => DIMENSION_AVAILABILITY[l].status === 'live');
    expect([...LIVE_DIMENSION_LEVELS].sort()).toEqual([...expected].sort());
  });

  it('getDimensionCaveat returns undefined for "live" and the exact caveat string for "partial"', () => {
    for (const level of DIMENSION_LEVELS) {
      const availability = DIMENSION_AVAILABILITY[level];
      if (availability.status === 'live') {
        expect(getDimensionCaveat(level)).toBeUndefined();
      } else if (availability.status === 'partial') {
        expect(getDimensionCaveat(level)).toBe(availability.caveat);
      }
    }
  });

  it('dimensionStatusPresentation gives a distinct badge label per status, and "partial" is never labelled "Live" or "Not yet available"', () => {
    const live = dimensionStatusPresentation('live');
    const partial = dimensionStatusPresentation('partial');
    const notBuilt = dimensionStatusPresentation('not-built');
    expect(live.badgeLabel).toBe('Live');
    expect(notBuilt.badgeLabel).toBe('Not yet available');
    expect(partial.badgeLabel).not.toBe('Live');
    expect(partial.badgeLabel).not.toBe('Not yet available');
  });
});

describe('propagation proof — a status/caveat change in contract.ts reaches every consumer', () => {
  it('Dimensions.tsx no longer hand-rolls its own live-levels list; it reads the shared lib', () => {
    const src = readRepoFile('client/src/pages/Dimensions.tsx');
    expect(src).not.toMatch(/LIVE_LEVELS\s*:\s*readonly DimensionLevel\[\]\s*=\s*\[/);
    expect(src).toMatch(/from ["']@\/lib\/dimensionsAvailability["']/);
    expect(src).toMatch(/getDimensionAvailability/);
  });

  it('Home.tsx and AGL.tsx read availability through the shared lib, not a private list', () => {
    for (const path of ['client/src/pages/Home.tsx', 'client/src/pages/AGL.tsx']) {
      const src = readRepoFile(path);
      expect(src).not.toMatch(/LIVE_DIMENSION_LEVELS\s*:\s*readonly DimensionLevel\[\]\s*=\s*\[/);
      expect(src).toMatch(/from ["']@\/lib\/dimensionsAvailability["']/);
      expect(src).toMatch(/getDimensionAvailability/);
    }
  });

  it('contract.ts — the one place a level\'s availability is written — stays import-free (ARCHITECTURE-DIMENSIONS.md §9.3/§11: entry-chunk-safe)', () => {
    const src = readRepoFile('client/src/dimensions/contract.ts');
    expect(src).not.toMatch(/^\s*import /m);
  });
});
