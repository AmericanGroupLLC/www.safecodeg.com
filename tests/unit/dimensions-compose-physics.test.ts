/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/state/compose.ts — physics step (T-007, §5.3 step 3)
 */
import { describe, it, expect } from 'vitest';
import { composeScene } from '@/dimensions/state/compose';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';
import type { ObjectId } from '@/dimensions/state/types';
import type { PhysicsSnapshot } from '@/dimensions/physics/sandbox';

describe('composeScene — physics step (5D)', () => {
  it('adds no phys: objects when physics is null (not yet loaded/run)', () => {
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {} });
    const physIds = Object.keys(scene.objects).filter((id) => id.startsWith('phys:'));
    expect(physIds).toEqual([]);
  });

  it('projects each physics body to a `phys:<bodyId>` scene object, never touching an authored id', () => {
    const physics: PhysicsSnapshot = {
      steps: 12,
      bodies: { ball: { position: { x: 1, y: 2, z: 3 }, velocity: { x: 0, y: -1, z: 0 } } },
    };
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics, selection: null, actors: {} });

    expect(scene.objects['phys:ball']).toBeDefined();
    expect(scene.objects['phys:ball'].position).toEqual({ x: 1, y: 2, z: 3 });
    expect(scene.objects['phys:ball'].visible).toBe(true);
    expect(scene.objects['phys:ball'].label.length).toBeGreaterThan(0);

    // Every authored id from model/process.ts is still present, untouched by physics.
    for (const id of Object.keys(PRODUCT_PIPELINE.objects)) {
      expect(scene.objects[id]).toBeDefined();
      expect(scene.objects[id].kind).toBe(PRODUCT_PIPELINE.objects[id].kind);
    }
  });

  it('is pure: the same input produces a structurally identical output', () => {
    const physics: PhysicsSnapshot = { steps: 3, bodies: { ball: { position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 } } } };
    const a = composeScene({ model: PRODUCT_PIPELINE, t: 2, physics, selection: null, actors: {} });
    const b = composeScene({ model: PRODUCT_PIPELINE, t: 2, physics, selection: null, actors: {} });
    expect(a).toEqual(b);
  });

  it('carries the selection field through untouched — physics never overrides it', () => {
    const selection = 'platform' as ObjectId;
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection, actors: {} });
    expect(scene.selection).toBe(selection);
  });
});
