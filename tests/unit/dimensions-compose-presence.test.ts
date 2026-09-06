/**
 * UNIT TESTS — Category 1
 * client/src/dimensions/state/compose.ts — presence step (T-010, §5.3 step 5)
 *
 * `composeScene` is handed *already-resolved* winners (`remote`) — it never
 * itself decides who wins (that is `state/store.ts`'s job, unit-tested
 * separately in `dimensions-store-collab.test.ts`, including the T-016 S-5
 * negative test). This file only proves the pure overlay: applied last, per
 * object, and structurally unable to touch a `phys:`-prefixed id because
 * `remote`'s keys never include one (that is what `state/store.ts`'s
 * allowlist, built from `ProcessModel.objects`, guarantees upstream).
 */
import { describe, it, expect } from 'vitest';
import { composeScene, type RemoteObjectOverride } from '@/dimensions/state/compose';
import { PRODUCT_PIPELINE } from '@/dimensions/model/process';
import type { ActorId } from '@/dimensions/state/types';
import type { PhysicsSnapshot } from '@/dimensions/physics/sandbox';

const ALICE = 'alice' as ActorId;

describe('composeScene — presence step (6D, §5.3 step 5)', () => {
  it('with no remote overrides (default), behaves exactly as before T-010', () => {
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {} });
    expect(scene.objects.platform.rev).toEqual({ seq: 0, actorId: null });
  });

  it('applies a remote override onto an authored object, overriding its position and setting rev', () => {
    const remote: Record<string, RemoteObjectOverride> = {
      platform: { patch: { position: { x: 5, y: 0, z: 0 } }, rev: { seq: 3, actorId: ALICE } },
    };
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {}, remote });
    expect(scene.objects.platform.position).toEqual({ x: 5, y: 0, z: 0 });
    expect(scene.objects.platform.rev).toEqual({ seq: 3, actorId: ALICE });
  });

  it('applied LAST — a remote override wins over whatever the 4D timeline computed for the same object at this t', () => {
    // "crate" is stage-scoped (visible only during the warehouse stage) and
    // has its own keyframe transform; a remote override must still win.
    const remote: Record<string, RemoteObjectOverride> = {
      crate: { patch: { visible: true, position: { x: 42, y: 0, z: 0 } }, rev: { seq: 1, actorId: ALICE } },
    };
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {}, remote });
    expect(scene.objects.crate.position).toEqual({ x: 42, y: 0, z: 0 });
    expect(scene.objects.crate.visible).toBe(true);
  });

  it('a remote entry for an id compose does not itself produce (e.g. a physics-owned phys: id) is simply never looked up — it cannot inject a new object', () => {
    // This models what would happen if a caller mistakenly handed `remote` a
    // phys: key — compose.ts's own loop only ever assigns into ids the
    // baseline+physics steps already produced (`if (!base) continue`), so
    // this can never create a NEW `phys:` entry through the remote channel
    // — it is structurally distinct from the physics step 3 injection.
    const physics: PhysicsSnapshot = { steps: 1, bodies: { ball: { position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 } } } };
    const remote: Record<string, RemoteObjectOverride> = {
      'phys:ghost': { patch: { position: { x: 999, y: 999, z: 999 } }, rev: { seq: 1, actorId: ALICE } },
    };
    const scene = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics, selection: null, actors: {}, remote });
    expect(scene.objects['phys:ghost']).toBeUndefined();
    // The REAL phys: object physics step 3 produced is untouched by the bogus remote entry.
    expect(scene.objects['phys:ball'].position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('is pure: the same input produces a structurally identical output', () => {
    const remote: Record<string, RemoteObjectOverride> = {
      platform: { patch: { position: { x: 1, y: 0, z: 0 } }, rev: { seq: 1, actorId: ALICE } },
    };
    const a = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {}, remote });
    const b = composeScene({ model: PRODUCT_PIPELINE, t: 0, physics: null, selection: null, actors: {}, remote });
    expect(a).toEqual(b);
  });
});
