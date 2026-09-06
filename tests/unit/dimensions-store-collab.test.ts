/**
 * UNIT TESTS — Category 1, Category 6 (security-shaped: T-016 finding S-5)
 * client/src/dimensions/state/store.ts — the 6D methods (T-010): `applyOp`,
 * `publishLocalOp`, `setActors`, `hydrateFromSnapshot`, `getValidObjectIds`,
 * `getOpCounters`.
 *
 * The single highest-value test in this file is the S-5 negative test: a
 * peer op naming `phys:ball` — an id `compose.ts`'s step 3 injects from the
 * *local* physics snapshot, never from the authored model — must be
 * rejected by `applyOp`, because the allowlist is built from
 * `ProcessModel.objects`, never from `getSnapshot().objects` (which DOES
 * contain `phys:` ids once physics has run). Proving this requires no
 * physics engine at all: the allowlist is built once, from `model.objects`,
 * at store construction — before physics ever runs — so an op naming a
 * `phys:`-prefixed id is rejected whether or not physics has ever loaded.
 */
import { describe, it, expect } from 'vitest';
import { createDimensionsStore } from '@/dimensions/state/store';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';
import type { ActorId, ObjectId, SceneOp } from '@/dimensions/transport/types';

const ALICE = 'alice' as ActorId;
const BOB = 'bob' as ActorId;
const PLATFORM = 'platform' as ObjectId;

function op(overrides: Partial<SceneOp> = {}): SceneOp {
  return {
    opId: 'op-1',
    objectId: PLATFORM,
    actorId: ALICE,
    seq: 1,
    at: 0,
    patch: { position: { x: 1, y: 0, z: 0 } },
    ...overrides,
  };
}

describe('createDimensionsStore — applyOp allowlist (T-016 finding S-5)', () => {
  it('the allowlist is built from ProcessModel.objects — every authored id is a member', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const ids = store.getValidObjectIds();
    for (const id of Object.keys(PRODUCT_PIPELINE.objects)) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it('REJECTS an op naming a phys:-prefixed id — that id exists only in composed state, never in ProcessModel.objects, so a peer cannot win control of the locally-simulated physics ball', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    // No physics chunk has ever loaded in this test — `phys:ball` is not a
    // member of `model.objects` regardless, which is exactly the point:
    // the check does not depend on whether physics happens to be running.
    const hostileOp = op({ objectId: 'phys:ball' as ObjectId, opId: 'hostile-1' });
    const applied = store.applyOp(hostileOp);
    expect(applied).toBe(false);
    expect(store.getOpCounters()).toEqual({ applied: 0, rejected: 1 });
    // And it must never have reached the composed scene.
    expect(store.getSnapshot().objects['phys:ball']).toBeUndefined();
  });

  it('REJECTS an op naming any id not present in ProcessModel.objects (not just phys:-prefixed ones)', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const applied = store.applyOp(op({ objectId: 'not-a-real-object' as ObjectId }));
    expect(applied).toBe(false);
    expect(store.getOpCounters().rejected).toBe(1);
  });

  it('ACCEPTS an op naming a real authored id, and the composed scene reflects the patch', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const applied = store.applyOp(op());
    expect(applied).toBe(true);
    expect(store.getOpCounters()).toEqual({ applied: 1, rejected: 0 });
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 1, y: 0, z: 0 });
    expect(store.getSnapshot().objects.platform.rev).toEqual({ seq: 1, actorId: ALICE });
  });
});

describe('createDimensionsStore — applyOp / LWW (§6.4, transport/merge.ts reused)', () => {
  it('a lower seq than the current register loses and does not overwrite', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.applyOp(op({ seq: 5, actorId: BOB, patch: { position: { x: 9, y: 0, z: 0 } } }));
    const applied = store.applyOp(op({ seq: 2, actorId: ALICE, patch: { position: { x: 1, y: 0, z: 0 } } }));
    expect(applied).toBe(false);
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 9, y: 0, z: 0 });
  });

  it('a higher seq always wins, regardless of actorId', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.applyOp(op({ seq: 1, actorId: BOB }));
    const applied = store.applyOp(op({ seq: 2, actorId: ALICE, patch: { position: { x: 2, y: 0, z: 0 } } }));
    expect(applied).toBe(true);
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 2, y: 0, z: 0 });
  });

  it('a partial patch merges onto the previous winning patch rather than erasing untouched fields', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.applyOp(op({ seq: 1, patch: { position: { x: 1, y: 0, z: 0 }, visible: true } }));
    store.applyOp(op({ seq: 2, patch: { position: { x: 2, y: 0, z: 0 } } })); // no `visible` field this time
    expect(store.getSnapshot().objects.platform.visible).toBe(true); // not erased
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 2, y: 0, z: 0 });
  });
});

describe('createDimensionsStore — publishLocalOp (the local half of a 6D move)', () => {
  it('computes the next seq from the current register and applies through the same path as a remote op', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const published = store.publishLocalOp(PLATFORM, ALICE, { position: { x: 3, y: 0, z: 0 } });
    expect(published).not.toBeNull();
    expect(published?.seq).toBe(1); // current register starts at seq 0
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 3, y: 0, z: 0 });
    expect(store.getOpCounters()).toEqual({ applied: 1, rejected: 0 });
  });

  it('returns null for an unknown objectId rather than fabricating an op that would only be rejected downstream', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const published = store.publishLocalOp('phys:ball' as ObjectId, ALICE, { position: { x: 0, y: 0, z: 0 } });
    expect(published).toBeNull();
    expect(store.getOpCounters()).toEqual({ applied: 0, rejected: 0 }); // never even attempted
  });

  it('a second local publish computes seq from the register the FIRST publish left, so two local moves in a row both apply', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    const first = store.publishLocalOp(PLATFORM, ALICE, { position: { x: 1, y: 0, z: 0 } });
    const second = store.publishLocalOp(PLATFORM, ALICE, { position: { x: 2, y: 0, z: 0 } });
    expect(first?.seq).toBe(1);
    expect(second?.seq).toBe(2);
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 2, y: 0, z: 0 });
  });
});

describe('createDimensionsStore — setActors (6D presence)', () => {
  it('replaces the presence dict and the composed scene reflects it', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    expect(store.getSnapshot().actors).toEqual({});
    store.setActors({ alice: { actorId: ALICE, displayName: 'Alice', colorHex: '#ffffff', joinedAt: 1, lastSeenAt: 1 } });
    expect(Object.keys(store.getSnapshot().actors)).toEqual(['alice']);
  });
});

describe('createDimensionsStore — hydrateFromSnapshot (§6.6 digital twin)', () => {
  it('applies a loaded snapshot object onto the composed scene', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.hydrateFromSnapshot({
      platform: {
        id: PLATFORM,
        kind: 'platform',
        position: { x: 7, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 12, y: 0.2, z: 4 },
        visible: true,
        stage: null,
        label: 'Loading platform',
        rev: { seq: 4, actorId: BOB },
      },
    });
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 7, y: 0, z: 0 });
    expect(store.getSnapshot().objects.platform.rev).toEqual({ seq: 4, actorId: BOB });
  });

  it('S-5 defence in depth: silently skips a snapshot object whose id is not in the authored model, even if the caller forgot to pre-filter', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.hydrateFromSnapshot({
      'phys:ball': {
        id: 'phys:ball' as ObjectId,
        kind: 'physics-ball',
        position: { x: 99, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        stage: null,
        label: 'hostile',
        rev: { seq: 1, actorId: null },
      },
    });
    expect(store.getSnapshot().objects['phys:ball']).toBeUndefined();
  });

  it('a subsequent op with a lower seq than the hydrated snapshot loses, so a stale live op cannot regress the twin', () => {
    const store = createDimensionsStore(PRODUCT_PIPELINE);
    store.hydrateFromSnapshot({
      platform: {
        id: PLATFORM,
        kind: 'platform',
        position: { x: 5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        scale: { x: 12, y: 0.2, z: 4 },
        visible: true,
        stage: null,
        label: 'Loading platform',
        rev: { seq: 10, actorId: BOB },
      },
    });
    const applied = store.applyOp(op({ seq: 3, actorId: ALICE }));
    expect(applied).toBe(false);
    expect(store.getSnapshot().objects.platform.position).toEqual({ x: 5, y: 0, z: 0 });
  });
});
