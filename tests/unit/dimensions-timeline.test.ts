/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/model/timeline.ts and state/compose.ts (T-006, 4D)
 *
 * These exercise the PURE functions directly — no browser, no WebGL, no
 * store — per ARCHITECTURE-DIMENSIONS.md §5.1 ("Tests: T-005 … T-012 read
 * state through a hook with no GPU involved").
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { timelineAt, visibleObjectIds, findActiveStage } from '@/dimensions/model/timeline';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';
import { composeScene } from '@/dimensions/state/compose';

describe('timelineAt — determinism (§5.5)', () => {
  it('is a pure function: the same (model, t) produces a structurally identical result', () => {
    const a = timelineAt(PRODUCT_PIPELINE, 6.5);
    const b = timelineAt(PRODUCT_PIPELINE, 6.5);
    expect(a).toEqual(b);
  });

  it('contains no Math.random, Date.now or performance.now (the grep §5.5 specifies)', () => {
    const source = readFileSync(
      resolve(__dirname, '../../client/src/dimensions/model/timeline.ts'),
      'utf-8',
    );
    expect(source).not.toMatch(/Math\.random|Date\.now|performance\.now/);
  });

  it('clamps t into [0, duration]', () => {
    const before = timelineAt(PRODUCT_PIPELINE, -5);
    const atZero = timelineAt(PRODUCT_PIPELINE, 0);
    expect(before).toEqual(atZero);

    const after = timelineAt(PRODUCT_PIPELINE, 999);
    const atEnd = timelineAt(PRODUCT_PIPELINE, PRODUCT_PIPELINE.duration);
    expect(after).toEqual(atEnd);
  });
});

describe('findActiveStage', () => {
  it('resolves each stage window to its own stage, and the tail end to the last stage', () => {
    expect(findActiveStage(PRODUCT_PIPELINE, 0)?.id).toBe('warehouse');
    expect(findActiveStage(PRODUCT_PIPELINE, 3.999)?.id).toBe('warehouse');
    expect(findActiveStage(PRODUCT_PIPELINE, 4)?.id).toBe('loading');
    expect(findActiveStage(PRODUCT_PIPELINE, 9)?.id).toBe('transit');
    expect(findActiveStage(PRODUCT_PIPELINE, 15)?.id).toBe('delivered');
    expect(findActiveStage(PRODUCT_PIPELINE, 16)?.id).toBe('delivered');
  });
});

describe('visibleObjectIds — genuine state-of-t, not an animation (T-006)', () => {
  it('reports a different visible set at a different t, and the same set on return', () => {
    const atLoading = [...visibleObjectIds(PRODUCT_PIPELINE, 5)].sort();
    const atTransit = [...visibleObjectIds(PRODUCT_PIPELINE, 9)].sort();
    expect(atTransit).not.toEqual(atLoading);

    const backToLoading = [...visibleObjectIds(PRODUCT_PIPELINE, 5)].sort();
    expect(backToLoading).toEqual(atLoading);
  });

  it('every stage-scoped object is invisible outside its own stage window', () => {
    // "crate" belongs to the warehouse stage only.
    expect(visibleObjectIds(PRODUCT_PIPELINE, 1).has('crate' as never)).toBe(true);
    expect(visibleObjectIds(PRODUCT_PIPELINE, 9).has('crate' as never)).toBe(false);
  });

  it('objects with stage=null (the platform) are visible at every t', () => {
    for (const t of [0, 4, 8, 12, 16]) {
      expect(visibleObjectIds(PRODUCT_PIPELINE, t).has('platform' as never)).toBe(true);
    }
  });
});

describe('composeScene', () => {
  it('is pure: the same input produces a structurally identical scene', () => {
    const input = { model: PRODUCT_PIPELINE, t: 6, selection: null, actors: {} };
    expect(composeScene(input)).toEqual(composeScene({ ...input }));
  });

  it('every authored object id is present in the composed scene, whether visible or not', () => {
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 1, selection: null, actors: {} });
    for (const id of Object.keys(PRODUCT_PIPELINE.objects)) {
      expect(scene.objects[id]).toBeDefined();
    }
  });

  it('stage labels in the composed scene come from the model, not a hand-written string table', () => {
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, selection: null, actors: {} });
    expect(scene.stages).toBe(PRODUCT_PIPELINE.stages);
  });
});
