/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/state/store.ts — `select()` and `setPhysicsSnapshot()`
 * (T-007, 5D interaction and physics)
 */
import { describe, it, expect } from 'vitest';
import { createDimensionsStore } from '@/dimensions/state/store';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';
import type { ObjectId } from '@/dimensions/state/types';
import type { PhysicsSnapshot } from '@/dimensions/physics/sandbox';

describe('createDimensionsStore — select() (5D interaction)', () => {
  it('starts with no selection', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    expect(store.getSnapshot().selection).toBeNull();
  });

  it('select(id) sets the selection and select(null) clears it', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.select('platform' as ObjectId);
    expect(store.getSnapshot().selection).toBe('platform');
    store.select(null);
    expect(store.getSnapshot().selection).toBeNull();
  });

  it('is a no-op (same snapshot reference) when selecting the same id twice', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.select('platform' as ObjectId);
    const first = store.getSnapshot();
    store.select('platform' as ObjectId);
    const second = store.getSnapshot();
    expect(second).toBe(first);
  });

  it('notifies subscribers on a real selection change', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    let calls = 0;
    store.subscribe(() => calls++);
    store.select('platform' as ObjectId);
    expect(calls).toBeGreaterThan(0);
  });
});

describe('createDimensionsStore — setPhysicsSnapshot() (5D physics)', () => {
  it('projects a physics snapshot into `phys:` scene objects', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    expect(Object.keys(store.getSnapshot().objects).some((id) => id.startsWith('phys:'))).toBe(false);

    const snapshot: PhysicsSnapshot = {
      steps: 5,
      bodies: { ball: { position: { x: 0, y: 1, z: 0 }, velocity: { x: 0, y: -2, z: 0 } } },
    };
    store.setPhysicsSnapshot(snapshot);

    const state = store.getSnapshot();
    expect(state.objects['phys:ball']).toBeDefined();
    expect(state.objects['phys:ball'].position).toEqual({ x: 0, y: 1, z: 0 });
  });

  it('setPhysicsSnapshot(null) removes the phys: objects again (e.g. after Reset)', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.setPhysicsSnapshot({ steps: 1, bodies: { ball: { position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 } } } });
    expect(store.getSnapshot().objects['phys:ball']).toBeDefined();

    store.setPhysicsSnapshot(null);
    expect(store.getSnapshot().objects['phys:ball']).toBeUndefined();
  });

  it('does not disturb the 4D timeline objects', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.setT(5); // "Loading" stage window
    const before = store.getSnapshot().objects['toycar-loading'];
    store.setPhysicsSnapshot({ steps: 1, bodies: { ball: { position: { x: 9, y: 9, z: 9 }, velocity: { x: 0, y: 0, z: 0 } } } });
    const after = store.getSnapshot().objects['toycar-loading'];
    expect(after).toEqual(before);
  });
});
